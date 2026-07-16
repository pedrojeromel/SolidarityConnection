using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Solidarity.EmailWorker.Email;

/// <summary>
/// Envio via SMTP com MimeKit. Monta a mensagem como multipart/alternative
/// (texto + HTML) e preenche cabeçalhos padrão — Message-Id, Date, MIME —
/// que os filtros de spam esperam de um remetente legítimo.
/// </summary>
public sealed class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;

    public SmtpEmailSender(IOptions<SmtpOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(
        EmailMessage message,
        CancellationToken cancellationToken)
    {
        var mime = new MimeMessage();

        mime.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        mime.To.Add(new MailboxAddress(message.ToName, message.ToEmail));
        mime.Subject = message.Subject;

        var body = new BodyBuilder
        {
            TextBody = message.TextBody,
            HtmlBody = message.HtmlBody
        };

        mime.Body = body.ToMessageBody();

        using var client = new SmtpClient();

        var security = _options.UseSsl
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;

        await client.ConnectAsync(
            _options.Host,
            _options.Port,
            security,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            await client.AuthenticateAsync(
                _options.Username,
                _options.Password,
                cancellationToken);
        }

        await client.SendAsync(mime, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
