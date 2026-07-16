using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Application.DTOs.Stats;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDonationRepository _donations;

    public StatsController(
        AppDbContext context,
        IDonationRepository donations)
    {
        _context = context;
        _donations = donations;
    }

    /// <summary>
    /// Indicadores públicos da plataforma, calculados a partir do banco:
    /// campanhas ativas e valor arrecadado (SQL Server) e a agregação de
    /// doações (MongoDB). Alimenta o painel da página inicial.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var activeCampaigns = await _context.Campaigns
            .Where(x => x.Status == CampaignStatus.Active)
            .ToListAsync();

        var donationStats = await _donations.GetStatsAsync(days: 14);

        var response = new PlatformStatsResponse
        {
            TotalRaised = activeCampaigns.Sum(x => x.TotalRaised),
            ActiveCampaigns = activeCampaigns.Count,
            TotalDonations = donationStats.TotalDonations,
            AverageTicket = donationStats.AverageTicket,
            Daily = donationStats.Daily
        };

        return Ok(response);
    }
}
