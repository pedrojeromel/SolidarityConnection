using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;

namespace Solidarity.Api.Tests.Builders;

public class CampaignBuilder
{
    private Guid _id = Guid.NewGuid();
    private string _title = "Campanha de Teste";
    private string _description = "Descrição da campanha de teste";
    private DateTime _startDate = DateTime.UtcNow.AddDays(-1);
    private DateTime _endDate = DateTime.UtcNow.AddDays(30);
    private decimal _financialGoal = 10_000m;
    private decimal _totalRaised;
    private CampaignStatus _status = CampaignStatus.Active;

    public CampaignBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public CampaignBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public CampaignBuilder WithStatus(CampaignStatus status)
    {
        _status = status;
        return this;
    }

    public CampaignBuilder WithFinancialGoal(decimal financialGoal)
    {
        _financialGoal = financialGoal;
        return this;
    }

    public CampaignBuilder WithTotalRaised(decimal totalRaised)
    {
        _totalRaised = totalRaised;
        return this;
    }

    public CampaignBuilder WithEndDate(DateTime endDate)
    {
        _endDate = endDate;
        return this;
    }

    public Campaign Build()
    {
        return new Campaign
        {
            Id = _id,
            Title = _title,
            Description = _description,
            StartDate = _startDate,
            EndDate = _endDate,
            FinancialGoal = _financialGoal,
            TotalRaised = _totalRaised,
            Status = _status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
