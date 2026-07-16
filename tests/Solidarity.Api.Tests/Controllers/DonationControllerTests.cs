using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Solidarity.Api.Controllers;
using Solidarity.Api.Tests.Builders;
using Solidarity.Api.Tests.Infrastructure;
using Solidarity.Application.DTOs.Donations;
using Solidarity.Domain.Documents;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.Api.Tests.Controllers;

public class DonationControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IDonationRepository> _repository;
    private readonly Mock<IMessagePublisher> _publisher;
    private readonly Guid _donorId;
    private readonly DonationController _controller;

    public DonationControllerTests()
    {
        _context = TestDbContextFactory.Create();
        _repository = new Mock<IDonationRepository>();
        _publisher = new Mock<IMessagePublisher>();
        _donorId = Guid.NewGuid();

        _controller = new DonationController(
            _context,
            _repository.Object,
            _publisher.Object,
            NullLogger<DonationController>.Instance)
        {
            ControllerContext =
                AuthenticatedControllerContext.For(
                    _donorId,
                    UserRole.Donor)
        };
    }

    [Fact]
    public async Task Create_WhenCampaignIsActive_PublishesDonationReceivedEvent()
    {
        // Arrange
        var campaign = new CampaignBuilder()
            .WithStatus(CampaignStatus.Active)
            .Build();

        await GivenCampaign(campaign);

        var request = new CreateDonationRequest
        {
            CampaignId = campaign.Id,
            Amount = 150m
        };

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<AcceptedResult>(result);

        _publisher.Verify(
            x => x.PublishAsync(
                It.Is<DonationReceivedEvent>(e =>
                    e.CampaignId == campaign.Id &&
                    e.Amount == 150m),
                Queues.DonationReceived),
            Times.Once);
    }

    [Fact]
    public async Task Create_WhenCampaignIsActive_DoesNotUpdateTotalRaisedDirectly()
    {
        // Arrange
        var campaign = new CampaignBuilder()
            .WithStatus(CampaignStatus.Active)
            .WithTotalRaised(0m)
            .Build();

        await GivenCampaign(campaign);

        var request = new CreateDonationRequest
        {
            CampaignId = campaign.Id,
            Amount = 500m
        };

        // Act
        await _controller.Create(request);

        // Assert
        // Requisito obrigatório: quem atualiza o TotalRaised é o Worker,
        // ao consumir a fila. A API só publica o evento.
        var persisted = await _context.Campaigns.FindAsync(campaign.Id);

        Assert.Equal(0m, persisted!.TotalRaised);
    }

    [Fact]
    public async Task Create_WhenCampaignIsActive_PersistsDonationForLoggedDonor()
    {
        // Arrange
        var campaign = new CampaignBuilder()
            .WithStatus(CampaignStatus.Active)
            .Build();

        await GivenCampaign(campaign);

        var request = new CreateDonationRequest
        {
            CampaignId = campaign.Id,
            Amount = 75m
        };

        // Act
        await _controller.Create(request);

        // Assert
        _repository.Verify(
            x => x.CreateAsync(
                It.Is<Donation>(d =>
                    d.CampaignId == campaign.Id &&
                    d.DonorId == _donorId &&
                    d.Amount == 75m)),
            Times.Once);
    }

    [Theory]
    [InlineData(CampaignStatus.Cancelled)]
    [InlineData(CampaignStatus.Completed)]
    public async Task Create_WhenCampaignIsNotActive_ReturnsBadRequestAndDoesNotPublish(
        CampaignStatus status)
    {
        // Arrange
        var campaign = new CampaignBuilder()
            .WithStatus(status)
            .Build();

        await GivenCampaign(campaign);

        var request = new CreateDonationRequest
        {
            CampaignId = campaign.Id,
            Amount = 100m
        };

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);

        _publisher.Verify(
            x => x.PublishAsync(It.IsAny<DonationReceivedEvent>(), It.IsAny<string>()),
            Times.Never);

        _repository.Verify(
            x => x.CreateAsync(It.IsAny<Donation>()),
            Times.Never);
    }

    [Fact]
    public async Task Create_WhenCampaignDoesNotExist_ReturnsNotFoundAndDoesNotPublish()
    {
        // Arrange
        var request = new CreateDonationRequest
        {
            CampaignId = Guid.NewGuid(),
            Amount = 100m
        };

        // Act
        var result = await _controller.Create(request);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);

        _publisher.Verify(
            x => x.PublishAsync(It.IsAny<DonationReceivedEvent>(), It.IsAny<string>()),
            Times.Never);
    }

    private async Task GivenCampaign(
        Solidarity.Domain.Entities.Campaign campaign)
    {
        _context.Campaigns.Add(campaign);

        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();

        GC.SuppressFinalize(this);
    }
}
