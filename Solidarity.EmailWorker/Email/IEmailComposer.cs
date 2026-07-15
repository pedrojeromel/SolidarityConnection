namespace Solidarity.EmailWorker.Email;

/// <summary>
/// Transforma um evento em um <see cref="EmailMessage"/> pronto. É uma função
/// pura (sem I/O), fácil de testar. Cada tipo de e-mail tem seu próprio
/// composer — princípio da responsabilidade única e aberto/fechado: um novo
/// e-mail é uma nova implementação, sem tocar nas existentes.
/// </summary>
public interface IEmailComposer<in TEvent>
{
    EmailMessage Compose(TEvent message);
}
