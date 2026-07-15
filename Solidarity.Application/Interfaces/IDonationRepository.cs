using Solidarity.Application.DTOs.Stats;
using Solidarity.Domain.Documents;

public interface IDonationRepository
{
    Task CreateAsync(Donation donation);

    /// <summary>
    /// Agrega as doações registradas no MongoDB: total, soma, ticket médio
    /// e a série diária dos últimos <paramref name="days"/> dias.
    /// </summary>
    Task<DonationStats> GetStatsAsync(int days);
}