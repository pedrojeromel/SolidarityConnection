using Microsoft.AspNetCore.Mvc;
using Moq;
using Solidarity.Api.Controllers;
using Solidarity.Api.Tests.Builders;
using Solidarity.Api.Tests.Infrastructure;
using Solidarity.Application.DTOs.Stats;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Tests.Controllers;

public class StatsControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IDonationRepository> _donations;
    private readonly StatsController _controller;

    public StatsControllerTests()
    {
        _context = TestDbContextFactory.Create();
        _donations = new Mock<IDonationRepository>();
        _controller = new StatsController(_context, _donations.Object);
    }

    [Fact]
    public async Task Get_SumsOnlyActiveCampaignsRaisedValue()
    {
        // Arrange
        _context.Campaigns.AddRange(
            new CampaignBuilder()
                .WithStatus(CampaignStatus.Active)
                .WithTotalRaised(1000m)
                .Build(),
            new CampaignBuilder()
                .WithStatus(CampaignStatus.Active)
                .WithTotalRaised(500m)
                .Build(),
            new CampaignBuilder()
                .WithStatus(CampaignStatus.Cancelled)
                .WithTotalRaised(9999m)
                .Build());

        await _context.SaveChangesAsync();

        _donations
            .Setup(x => x.GetStatsAsync(It.IsAny<int>()))
            .ReturnsAsync(new DonationStats());

        // Act
        var result = await _controller.Get();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);
        var stats = Assert.IsType<PlatformStatsResponse>(ok.Value);

        Assert.Equal(2, stats.ActiveCampaigns);
        Assert.Equal(1500m, stats.TotalRaised);
    }

    [Fact]
    public async Task Get_ProjectsDonationAggregatesFromRepository()
    {
        // Arrange
        _donations
            .Setup(x => x.GetStatsAsync(It.IsAny<int>()))
            .ReturnsAsync(new DonationStats
            {
                TotalDonations = 42,
                AverageTicket = 153.93m,
                Daily = [new DailyPoint { Date = DateTime.UtcNow, Amount = 10m }]
            });

        // Act
        var result = await _controller.Get();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);
        var stats = Assert.IsType<PlatformStatsResponse>(ok.Value);

        Assert.Equal(42, stats.TotalDonations);
        Assert.Equal(153.93m, stats.AverageTicket);
        Assert.Single(stats.Daily);
    }

    [Fact]
    public async Task Get_WhenNoCampaigns_ReturnsZeroedTotals()
    {
        // Arrange
        _donations
            .Setup(x => x.GetStatsAsync(It.IsAny<int>()))
            .ReturnsAsync(new DonationStats());

        // Act
        var result = await _controller.Get();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);
        var stats = Assert.IsType<PlatformStatsResponse>(ok.Value);

        Assert.Equal(0, stats.ActiveCampaigns);
        Assert.Equal(0m, stats.TotalRaised);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
