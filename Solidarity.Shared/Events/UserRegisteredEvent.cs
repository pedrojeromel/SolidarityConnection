namespace Solidarity.Shared.Events;

/// <summary>
/// Publicado quando um novo doador se cadastra. Carrega tudo o que o serviço
/// de e-mail precisa, para que ele não dependa de banco de dados.
/// </summary>
public class UserRegisteredEvent
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
