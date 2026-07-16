namespace Solidarity.Domain.Payments;

/// <summary>
/// Abstração do provedor de pagamento. Trocar o gateway falso por um real
/// (Stripe, Pagar.me, ...) é uma nova implementação, sem alterar quem consome.
/// </summary>
public interface IPaymentGateway
{
    PaymentResult Authorize(CardData card, decimal amount);
}
