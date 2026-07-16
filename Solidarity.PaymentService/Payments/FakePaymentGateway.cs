using Microsoft.Extensions.Options;
using Solidarity.Domain.Payments;
using Solidarity.Domain.Rules;

namespace Solidarity.PaymentService.Payments;

/// <summary>
/// Gateway simulado para fins didáticos: aprova apenas o cartão de teste
/// configurado; qualquer outro é recusado. Não realiza cobrança real nem
/// armazena dados de cartão.
/// </summary>
public sealed class FakePaymentGateway : IPaymentGateway
{
    private readonly string _testCard;

    public FakePaymentGateway(IOptions<PaymentOptions> options)
        : this(options.Value.TestCardNumber)
    {
    }

    // Sobrecarga usada nos testes: injeta o cartão de teste diretamente.
    public FakePaymentGateway(string testCardNumber)
    {
        _testCard = OnlyDigits(testCardNumber);
    }

    public PaymentResult Authorize(CardData card, decimal amount)
    {
        if (!DonationRules.IsAmountValid(amount))
            return PaymentResult.Declined(
                $"Valor mínimo para doação é R$ {DonationRules.MinimumAmount:0.00}.");

        var number = OnlyDigits(card.Number);

        if (number.Length is < 13 or > 19)
            return PaymentResult.Declined("Número de cartão inválido.");

        if (string.IsNullOrWhiteSpace(card.Cvv) ||
            OnlyDigits(card.Cvv).Length is < 3 or > 4)
            return PaymentResult.Declined("CVV inválido.");

        if (number != _testCard)
            return PaymentResult.Declined(
                "Pagamento recusado pela operadora do cartão.");

        return PaymentResult.Ok();
    }

    private static string OnlyDigits(string value) =>
        new(value.Where(char.IsDigit).ToArray());
}
