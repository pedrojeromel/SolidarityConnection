namespace Solidarity.EmailWorker.Email;

/// <summary>
/// Abstração de transporte de e-mail. Isola o worker do provedor concreto
/// (SMTP hoje; poderia ser um provedor de API amanhã) — princípio da inversão
/// de dependência.
/// </summary>
public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
}
