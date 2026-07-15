using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Application.DTOs.Donations;
using Solidarity.Domain.Documents;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.Api.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDonationRepository _repository;
    private readonly IMessagePublisher _publisher;
    private readonly ILogger<DonationController> _logger;

    public DonationController(
        AppDbContext context,
        IDonationRepository repository,
        IMessagePublisher publisher,
        ILogger<DonationController> logger)
    {
        _context = context;
        _repository = repository;
        _publisher = publisher;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Roles = "Donor")]
    public async Task<IActionResult> Create(
        CreateDonationRequest request)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x =>
                x.Id == request.CampaignId);

        if (campaign is null)
            return NotFound("Campaign not found.");

        if (campaign.Status != CampaignStatus.Active)
            return BadRequest(
                "Campaign is not active.");

        var donorId =
            Guid.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)!);

        var donation = new Donation
        {
            CampaignId = request.CampaignId,
            DonorId = donorId,
            Amount = request.Amount,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.CreateAsync(donation);

        // Evento de domínio: o worker atualiza o valor arrecadado da campanha.
        await _publisher.PublishAsync(
            new DonationReceivedEvent
            {
                CampaignId = request.CampaignId,
                Amount = request.Amount
            },
            Queues.DonationReceived);

        await PublishConfirmationEmailAsync(donation, campaign.Title);

        return Accepted();
    }

    /// <summary>
    /// Resolve nome e e-mail do doador (o serviço de e-mail não acessa o banco)
    /// e publica o evento de confirmação. Uma falha aqui não afeta a doação,
    /// que já foi registrada.
    /// </summary>
    private async Task PublishConfirmationEmailAsync(
        Donation donation,
        string campaignTitle)
    {
        try
        {
            var donor = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == donation.DonorId);

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
}