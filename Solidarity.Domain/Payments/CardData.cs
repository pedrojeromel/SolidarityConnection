namespace Solidarity.Domain.Payments;

/// <summary>
/// Dados do cartão usados apenas em memória, durante a autorização.
/// Nunca são persistidos nem registrados em log.
/// </summary>
public sealed record CardData(
    string Number,
    string Holder,
    string ExpiryMonth,
    string ExpiryYear,
    string Cvv);
