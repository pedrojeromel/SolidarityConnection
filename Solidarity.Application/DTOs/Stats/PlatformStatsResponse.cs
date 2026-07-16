namespace Solidarity.Application.DTOs.Stats;

public class DonationStats
{
    public long TotalDonations { get; set; }

    public decimal TotalAmount { get; set; }

    public decimal AverageTicket { get; set; }

    public IReadOnlyList<DailyPoint> Daily { get; set; } = [];
}

public class DailyPoint
{
    public DateTime Date { get; set; }

    public decimal Amount { get; set; }
}

public class PlatformStatsResponse
{
    public decimal TotalRaised { get; set; }

    public int ActiveCampaigns { get; set; }

    public long TotalDonations { get; set; }

    public decimal AverageTicket { get; set; }

    public IReadOnlyList<DailyPoint> Daily { get; set; } = [];
}
