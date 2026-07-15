namespace Solidarity.EmailWorker.Email;

/// <summary>
/// Um e-mail pronto para envio. Sempre traz corpo em texto puro E em HTML:
/// a versão multipart/alternative melhora a entregabilidade e reduz a chance
/// de ser classificado como spam.
/// </summary>
public sealed record EmailMessage(
    string ToName,
    string ToEmail,
    string Subject,
    string HtmlBody,
    string TextBody);
