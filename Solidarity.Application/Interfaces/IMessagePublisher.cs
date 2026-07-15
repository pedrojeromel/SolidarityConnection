public interface IMessagePublisher
{
    /// <summary>
    /// Publica uma mensagem na fila informada. O nome da fila vem das constantes
    /// em <c>Solidarity.Shared.Messaging.Queues</c>.
    /// </summary>
    Task PublishAsync<T>(T message, string queue);
}
