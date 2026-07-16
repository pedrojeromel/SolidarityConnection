using System.Globalization;
using Solidarity.EmailWorker.Email;
using Solidarity.Shared.Events;

namespace Solidarity.EmailWorker.Composers;

/// <summary>E-mail de confirmação, enviado quando o doador registra uma doação.</summary>
public sealed class DonationReceiptComposer : IEmailComposer<DonationConfirmedEvent>
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    public EmailMessage Compose(DonationConfirmedEvent message)
    {
        var firstName = FirstName(message.DonorName);
        var amount = message.Amount.ToString("C", PtBr);
        var date = message.OccurredAt.ToString("dd/MM/yyyy 'às' HH:mm", PtBr);

        const string subject = "Recebemos a sua doação — Conexão Solidária";

        var preheader =
            $"Confirmação da sua doação para {message.CampaignTitle}.";

        var inner =
            EmailLayout.Paragraph($"Olá, {EmailLayout.Encode(firstName)}.") +
            EmailLayout.Paragraph(
                "Recebemos a sua doação e ela está sendo processada. " +
                "Assim que a confirmação for concluída, o valor passa a compor " +
                "o total arrecadado da campanha no painel de transparência.") +
            EmailLayout.Highlight("Valor da doação", amount) +
            EmailLayout.Paragraph(
                $"Campanha: {EmailLayout.Encode(message.CampaignTitle)}<br>" +
                $"Data do registro: {EmailLayout.Encode(date)}") +
            EmailLayout.Paragraph(
                "Guarde este e-mail como comprovante. Obrigado pela sua " +
                "contribuição.");

        var html = EmailLayout.Wrap(preheader, "Doação recebida", inner);

        var text =
            $"""
            Ola, {firstName}.

            Recebemos a sua doacao e ela esta sendo processada. Assim que a
            confirmacao for concluida, o valor passa a compor o total arrecadado
            da campanha no painel de transparencia.

            Valor da doacao: {amount}
            Campanha: {message.CampaignTitle}
            Data do registro: {date}

            Guarde este e-mail como comprovante. Obrigado pela sua contribuicao.

            --
            ONG Esperanca Solidaria — CNPJ 12.345.678/0001-90
            E-mail automatico de confirmacao. Nao e necessario responder.
            """;

        return new EmailMessage(
            message.DonorName,
            message.DonorEmail,
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
