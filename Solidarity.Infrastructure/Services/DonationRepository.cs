using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using Solidarity.Application.DTOs.Stats;
using Solidarity.Domain.Documents;

public class DonationRepository : IDonationRepository
{
    private readonly IMongoCollection<Donation> _collection;

    public DonationRepository(IConfiguration configuration)
    {
        var client = new MongoClient(
            configuration["MongoDb:ConnectionString"]);

        var database =
            client.GetDatabase(
                configuration["MongoDb:DatabaseName"]);

        _collection =
            database.GetCollection<Donation>(
                "donations");
    }

    public async Task CreateAsync(Donation donation)
    {
        await _collection.InsertOneAsync(donation);
    }

    public async Task<DonationStats> GetStatsAsync(int days)
    {
        var total = await _collection
            .CountDocumentsAsync(FilterDefinition<Donation>.Empty);

        if (total == 0)
        {
            return new DonationStats { Daily = BuildEmptySeries(days) };
        }

        var sum = await SumAllAsync();

        var daily = await DailySeriesAsync(days);

        return new DonationStats
        {
            TotalDonations = total,
            TotalAmount = sum,
            AverageTicket = total > 0 ? sum / total : 0m,
            Daily = daily
        };
    }

    private async Task<decimal> SumAllAsync()
    {
        var result = await _collection
            .Aggregate()
            .Group(new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "sum", new BsonDocument("$sum", "$Amount") }
            })
            .FirstOrDefaultAsync();

        return result is null
            ? 0m
            : result["sum"].ToDecimal();
    }

    private async Task<IReadOnlyList<DailyPoint>> DailySeriesAsync(int days)
    {
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

        // Agrupa por dia (UTC) somando os valores doados no período.
        var grouped = await _collection
            .Aggregate()
            .Match(x => x.CreatedAt >= since)
            .Group(new BsonDocument
            {
                {
                    "_id",
                    new BsonDocument("$dateToString", new BsonDocument
                    {
                        { "format", "%Y-%m-%d" },
                        { "date", "$CreatedAt" }
                    })
                },
                { "amount", new BsonDocument("$sum", "$Amount") }
            })
            .ToListAsync();

        var byDay = grouped.ToDictionary(
            x => x["_id"].AsString,
            x => x["amount"].ToDecimal());

        // Preenche todos os dias do intervalo (inclusive os sem doação),
        // para o gráfico ter uma barra por dia.
        var series = new List<DailyPoint>();

        for (var i = 0; i < days; i++)
        {
            var day = since.AddDays(i);
            var key = day.ToString("yyyy-MM-dd");

            series.Add(new DailyPoint
            {
                Date = day,
                Amount = byDay.TryGetValue(key, out var amount) ? amount : 0m
            });
        }

        return series;
    }

    private static IReadOnlyList<DailyPoint> BuildEmptySeries(int days)
    {
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

        return Enumerable
            .Range(0, days)
            .Select(i => new DailyPoint { Date = since.AddDays(i), Amount = 0m })
            .ToList();
    }
}
