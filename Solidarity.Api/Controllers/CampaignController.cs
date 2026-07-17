using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Application.DTOs.Campaigns;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Controllers;

[ApiController]
[Route("api/campaigns")]
public class CampaignController : ControllerBase
{
    private readonly AppDbContext _context;

    public CampaignController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "NgoManager")]
    public async Task<IActionResult> Create(
        CreateCampaignRequest request)
    {
        if (request.EndDate <= DateTime.UtcNow)
            return BadRequest(
                "EndDate must be greater than current date.");

        if (request.FinancialGoal <= 0)
            return BadRequest(
                "FinancialGoal must be greater than zero.");

        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            FinancialGoal = request.FinancialGoal,
            TotalRaised = 0,
            Status = CampaignStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Campaigns.Add(campaign);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = campaign.Id }, campaign.Id);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign is null)
            return NotFound();

        return Ok(campaign);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var campaigns = await _context.Campaigns
            .ToListAsync();

        return Ok(campaigns);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var campaigns = await _context.Campaigns
            .Where(x => x.Status == CampaignStatus.Active)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.FinancialGoal,
                x.TotalRaised
            })
            .ToListAsync();

        return Ok(campaigns);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "NgoManager")]
    public async Task<IActionResult> Update(
    Guid id,
    UpdateCampaignRequest request)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign is null)
            return NotFound();

        if (request.EndDate <= DateTime.UtcNow)
            return BadRequest(
                "EndDate must be greater than current date.");

        if (request.FinancialGoal <= 0)
            return BadRequest(
                "FinancialGoal must be greater than zero.");

        campaign.Title = request.Title;
        campaign.Description = request.Description;
        campaign.StartDate = request.StartDate;
        campaign.EndDate = request.EndDate;
        campaign.FinancialGoal = request.FinancialGoal;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "NgoManager")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign is null)
            return NotFound();

        campaign.Status = CampaignStatus.Cancelled;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "NgoManager")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign is null)
            return NotFound();

        if (campaign.Status != CampaignStatus.Active)
            return BadRequest(
                "Only active campaigns can be completed or closed.");

        campaign.Status = CampaignStatus.Completed;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}