namespace Solidarity.Shared.Events;

/// <summary>
/// Publicado quando um doador registra uma doação. Diferente do
/// <see cref="DonationReceivedEvent"/> (consumido pelo worker de domínio para
/// atualizar o valor arrecadado), este evento existe apenas para o e-mail:
/// traz nome, e-mail e os dados da doação já resolvidos.
/// </summary>
public class DonationConfirmedEvent
{
    public string DonorName { get; set; } = string.Empty;

    public string DonorEmail { get; set; } = string.Empty;

    public string CampaignTitle { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
