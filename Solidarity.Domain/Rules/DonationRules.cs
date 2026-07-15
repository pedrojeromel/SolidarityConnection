namespace Solidarity.Domain.Rules;

public static class DonationRules
{
    /// <summary>Valor mínimo aceito para uma doação com pagamento.</summary>
    public const decimal MinimumAmount = 5.00m;

    public static bool IsAmountValid(decimal amount) =>
        amount >= MinimumAmount;
}
