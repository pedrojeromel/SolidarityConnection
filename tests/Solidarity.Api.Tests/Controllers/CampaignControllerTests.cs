using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Api.Controllers;
using Solidarity.Api.Tests.Builders;
using Solidarity.Api.Tests.Infrastructure;
using Solidarity.Application.DTOs.Campaigns;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Tests.Controllers;

public class CampaignControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly CampaignController _controller;

    public CampaignControllerTests()
    {
        _context = TestDbContextFactory.Create();
        _controller = new CampaignController(_context);
    }

    [Fact]
    public async Task Create_WhenEndDateIsInThePast_ReturnsBadRequest()
    {
        // Arrange
        var request = BuildCreateRequest();

        request.EndDate = DateTime.UtcNow.AddDays(-1);

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);

        Assert.False(await _context.Campaigns.AnyAsync());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Create_WhenFinancialGoalIsNotPositive_ReturnsBadRequest(
        decimal financialGoal)
    {
        // Arrange
        var request = BuildCreateRequest();

        request.FinancialGoal = financialGoal;

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);

        Assert.False(await _context.Campaigns.AnyAsync());
    }

    [Fact]
    public async Task Create_WhenRequestIsValid_PersistsCampaignAsActiveWithoutDonations()
    {
        // Arrange
        var request = BuildCreateRequest();

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<CreatedAtActionResult>(result);

        var campaign = await _context.Campaigns.SingleAsync();

        Assert.Equal(CampaignStatus.Active, campaign.Status);

        Assert.Equal(0m, campaign.TotalRaised);
    }

    [Fact]
    public async Task GetActive_WhenCampaignsHaveMixedStatus_ReturnsOnlyActiveOnes()
    {
        // Arrange
        await GivenCampaigns(
            new CampaignBuilder()
                .WithTitle("Ativa")
                .WithStatus(CampaignStatus.Active)
                .Build(),
            new CampaignBuilder()
                .WithTitle("Concluida")
                .WithStatus(CampaignStatus.Completed)
                .Build(),
            new CampaignBuilder()
                .WithTitle("Cancelada")
                .WithStatus(CampaignStatus.Cancelled)
                .Build());

        // Act
        var result = await _controller.GetActive();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);

        var campaigns = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);

        var titles = campaigns
            .Select(GetTitle)
            .ToList();

        Assert.Equal(["Ativa"], titles);
    }

    [Fact]
    public async Task Cancel_WhenCampaignExists_ChangesStatusToCancelled()
    {
        // Arrange
        var campaign = new CampaignBuilder()
            .WithStatus(CampaignStatus.Active)
            .Build();

        await GivenCampaigns(campaign);

        // Act
        var result = await _controller.Cancel(campaign.Id);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var persisted = await _context.Campaigns.FindAsync(campaign.Id);

        Assert.Equal(CampaignStatus.Cancelled, persisted!.Status);
    }

    [Fact]
    public async Task Cancel_WhenCampaignDoesNotExist_ReturnsNotFound()
    {
        // Arrange & Act
        var result = await _controller.Cancel(Guid.NewGuid());

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    private static CreateCampaignRequest BuildCreateRequest()
    {
        return new CreateCampaignRequest
        {
            Title = "Campanha de Teste",
            Description = "Descrição da campanha de teste",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            FinancialGoal = 10_000m
        };
    }

    private static string GetTitle(object campaign)
    {
        var title = campaign
            .GetType()
            .GetProperty("Title")!
            .GetValue(campaign);

        return (string)title!;
    }

    private async Task GivenCampaigns(params Campaign[] campaigns)
    {
        _context.Campaigns.AddRange(campaigns);

        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();

        GC.SuppressFinalize(this);
    }
}
