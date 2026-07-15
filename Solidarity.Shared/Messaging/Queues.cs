namespace Solidarity.Shared.Messaging;

/// <summary>
/// Nomes das filas em um único lugar: quem publica e quem consome referenciam
/// a mesma constante, evitando divergência de strings mágicas.
/// </summary>
public static class Queues
{
    /// <summary>Doação recebida — consumida pelo worker de domínio.</summary>
    public const string DonationReceived = "donation-received";

    /// <summary>Cadastro concluído — e-mail de boas-vindas.</summary>
    public const string EmailUserRegistered = "email.user-registered";

    /// <summary>Doação registrada — e-mail de confirmação.</summary>
    public const string EmailDonationConfirmed = "email.donation-confirmed";
}
