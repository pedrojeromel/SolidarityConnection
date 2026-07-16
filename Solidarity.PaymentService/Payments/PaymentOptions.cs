namespace Solidarity.PaymentService.Payments;

public sealed class PaymentOptions
{
    public const string Section = "Payment";

    /// <summary>
    /// Cartão de teste que resulta em aprovação. Qualquer outro é recusado.
    /// Padrão: o número de teste "4242 4242 4242 4242".
    /// </summary>
    public string TestCardNumber { get; set; } = "4242424242424242";
}
