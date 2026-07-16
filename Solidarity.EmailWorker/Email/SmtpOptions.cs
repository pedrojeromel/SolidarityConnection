namespace Solidarity.EmailWorker.Email;

public sealed class SmtpOptions
{
    public const string Section = "Smtp";

    public string Host { get; set; } = "localhost";

    public int Port { get; set; } = 1025;

    public bool UseSsl { get; set; }

    public string? Username { get; set; }

    public string? Password { get; set; }

    /// <summary>Nome exibido no remetente — parte da identidade que evita spam.</summary>
    public string FromName { get; set; } = "Conexão Solidária";

    public string FromEmail { get; set; } = "nao-responda@conexaosolidaria.org";
}
