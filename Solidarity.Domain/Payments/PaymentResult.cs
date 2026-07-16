namespace Solidarity.Domain.Payments;

public sealed record PaymentResult(bool Approved, string Reason)
{
    public static PaymentResult Ok() =>
        new(true, "Pagamento aprovado.");

    public static PaymentResult Declined(string reason) =>
        new(false, reason);
}
