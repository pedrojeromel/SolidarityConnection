using System.Net;

namespace Solidarity.EmailWorker.Email;

/// <summary>
/// Casca HTML compartilhada, aproximando o visual do sistema (fundo escuro,
/// acento índigo, números monoespaçados). Usa tabelas e estilos inline —
/// o único formato que renderiza de forma consistente entre clientes de e-mail.
/// Sem imagens externas e sem links, tanto por requisito quanto por
/// entregabilidade.
/// </summary>
public static class EmailLayout
{
    private const string Bg = "#08090c";
    private const string Panel = "#0f1218";
    private const string Line = "#262c38";
    private const string Text = "#f2f4f8";
    private const string Muted = "#9aa3b2";
    private const string Dim = "#616b7c";
    private const string Brand = "#6366f1";

    public static string Encode(string value) => WebUtility.HtmlEncode(value);

    /// <summary>Destaque monoespaçado, usado para o valor da doação.</summary>
    public static string Highlight(string label, string value) =>
        $"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid {Line};border-radius:10px;background:{Bg};">
          <tr><td style="padding:18px 20px;">
            <div style="font-size:12px;color:{Dim};margin-bottom:6px;">{Encode(label)}</div>
            <div style="font-family:'Courier New',monospace;font-size:26px;color:{Text};letter-spacing:-0.5px;">{Encode(value)}</div>
          </td></tr>
        </table>
        """;

    public static string Paragraph(string text) =>
        $"""<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:{Muted};">{text}</p>""";

    /// <summary>Monta o e-mail HTML completo em torno do conteúdo do miolo.</summary>
    public static string Wrap(string preheader, string heading, string innerHtml) =>
        $"""
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="dark">
        </head>
        <body style="margin:0;padding:0;background:{Bg};">
          <span style="display:none;max-height:0;overflow:hidden;opacity:0;">{Encode(preheader)}</span>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{Bg};padding:32px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:{Panel};border:1px solid {Line};border-radius:16px;overflow:hidden;">
                <tr><td style="padding:24px 28px;border-bottom:1px solid {Line};">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="width:26px;height:26px;background:{Brand};border-radius:7px;text-align:center;vertical-align:middle;font-size:15px;">&#9829;</td>
                    <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:{Text};">Conexão Solidária</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
                  <h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;color:{Text};font-weight:bold;">{Encode(heading)}</h1>
                  {innerHtml}
                </td></tr>
                <tr><td style="padding:20px 28px;border-top:1px solid {Line};font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 4px;font-size:12px;color:{Dim};">ONG Esperança Solidária — CNPJ 12.345.678/0001-90</p>
                  <p style="margin:0;font-size:12px;color:{Dim};">Você recebeu esta mensagem porque possui um cadastro na plataforma. Este é um e-mail automático de confirmação; não é necessário responder.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}
