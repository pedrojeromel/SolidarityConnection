using Solidarity.EmailWorker.Email;
using Solidarity.Shared.Events;

namespace Solidarity.EmailWorker.Composers;

/// <summary>E-mail de boas-vindas, enviado após o cadastro do doador.</summary>
public sealed class WelcomeEmailComposer : IEmailComposer<UserRegisteredEvent>
{
    public EmailMessage Compose(UserRegisteredEvent message)
    {
        var firstName = FirstName(message.FullName);

        const string subject = "Seu cadastro na Conexão Solidária foi concluído";

        const string preheader =
            "Confirmação do seu cadastro de doador na plataforma.";

        var inner =
            EmailLayout.Paragraph($"Olá, {EmailLayout.Encode(firstName)}.") +
            EmailLayout.Paragraph(
                "Seu cadastro de doador na plataforma Conexão Solidária foi " +
                "concluído com sucesso. A partir de agora você pode acompanhar " +
                "as campanhas ativas e registrar suas doações.") +
            EmailLayout.Paragraph(
                "Cada contribuição é registrada de forma individual e o valor " +
                "arrecadado de cada campanha fica disponível no painel de " +
                "transparência, atualizado após a confirmação.") +
            EmailLayout.Paragraph("Obrigado por caminhar com a gente.");

        var html = EmailLayout.Wrap(preheader, "Cadastro concluído", inner);

        var text =
            $"""
            Ola, {firstName}.

            Seu cadastro de doador na plataforma Conexao Solidaria foi concluido
            com sucesso. A partir de agora voce pode acompanhar as campanhas
            ativas e registrar suas doacoes.

            Cada contribuicao e registrada de forma individual e o valor
            arrecadado de cada campanha fica disponivel no painel de
            transparencia, apos a confirmacao.

            Obrigado por caminhar com a gente.

            --
            ONG Esperanca Solidaria — CNPJ 12.345.678/0001-90
            E-mail automatico de confirmacao. Nao e necessario responder.
            """;

        return new EmailMessage(
            message.FullName,
            message.Email,
            subject,
            html,
            text);
    }

    private static string FirstName(string fullName)
    {
        var trimmed = fullName.Trim();

        if (trimmed.Length == 0)
            return "doador";

        var space = trimmed.IndexOf(' ');

        return space > 0 ? trimmed[..space] : trimmed;
    }
}
