using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Domain.Documents;
using Solidarity.Domain.Enums;
using Solidarity.Domain.Payments;
using Solidarity.Domain.Rules;
using Solidarity.Infrastructure.Data;
using Solidarity.PaymentService.DTOs;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.PaymentService.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDonationRepository _donations;
    private readonly IMessagePublisher _publisher;
    private readonly IPaymentGateway _gateway;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        AppDbContext context,
        IDonationRepository donations,
        IMessagePublisher publisher,
        IPaymentGateway gateway,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _donations = donations;
        _publisher = publisher;
        _gateway = gateway;
        _logger = logger;
    }

    /// <summary>
    /// Processa o pagamento de uma doação. Fluxo síncrono: só depois da
    /// aprovação a doação é registrada e os eventos (worker + e-mail) são
    /// publicados, reaproveitando o pipeline existente.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Donor")]
    public async Task<IActionResult> Checkout(CheckoutRequest request)
    {
        if (!DonationRules.IsAmountValid(request.Amount))
            return BadRequest(Fail(
                $"Valor mínimo para doação é R$ {DonationRules.MinimumAmount:0.00}."));

        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x => x.Id == request.CampaignId);

        if (campaign is null)
            return NotFound(Fail("Campanha não encontrada."));

        if (campaign.Status != CampaignStatus.Active)
            return BadRequest(Fail("Campanha não está ativa."));

        var card = new CardData(
            request.Card.Number,
            request.Card.Holder,
            request.Card.ExpiryMonth,
            request.Card.ExpiryYear,
            request.Card.Cvv);

        var result = _gateway.Authorize(card, request.Amount);

        if (!result.Approved)
        {
            // 402 Payment Required: recusa. Nada é registrado nem publicado.
            return StatusCode(
                StatusCodes.Status402PaymentRequired,
                Fail(result.Reason));
        }

        var donorId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var donation = new Donation
        {
            CampaignId = request.CampaignId,
            DonorId = donorId,
            Amount = request.Amount,
            CreatedAt = DateTime.UtcNow
        };

        await _donations.CreateAsync(donation);

        // Evento de domínio: o worker atualiza o valor arrecadado.
        await _publisher.PublishAsync(
            new DonationReceivedEvent
            {
                CampaignId = request.CampaignId,
                Amount = request.Amount
            },
            Queues.DonationReceived);

        await PublishConfirmationEmailAsync(donation, campaign.Title, donorId);

        return Ok(new CheckoutResponse
        {
            Status = "approved",
            Message = "Pagamento aprovado. Obrigado pela sua doação!"
        });
    }

    private async Task PublishConfirmationEmailAsync(
        Donation donation,
        string campaignTitle,
        Guid donorId)
    {
        try
        {
            var donor = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == donorId);

            if (donor is null)
                return;

            await _publisher.PublishAsync(
                new DonationConfirmedEvent
                {
                    DonorName = donor.FullName,
                    DonorEmail = donor.Email,
                    CampaignTitle = campaignTitle,
                    Amount = donation.Amount,
                    OccurredAt = donation.CreatedAt
                },
                Queues.EmailDonationConfirmed);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Falha ao publicar e-mail de confirmação da doação {DonationId}.",
                donation.Id);
        }
    }

    private static CheckoutResponse Fail(string message) =>
        new() { Status = "declined", Message = message };
}
