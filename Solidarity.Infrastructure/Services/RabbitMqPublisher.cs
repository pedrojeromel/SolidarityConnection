using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

public class RabbitMqPublisher : IMessagePublisher
{
    private readonly IConfiguration _configuration;

    public RabbitMqPublisher(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task PublishAsync<T>(T message, string queue)
    {
        var factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMq:Host"]
        };

        using var connection =
            await factory.CreateConnectionAsync();

        using var channel =
            await connection.CreateChannelAsync();

        await channel.QueueDeclareAsync(
            queue: queue,
            durable: true,
            exclusive: false,
            autoDelete: false);

        var body =
            Encoding.UTF8.GetBytes(
                JsonSerializer.Serialize(message));

        // Persistente: a mensagem sobrevive a um restart do broker.
        var properties = new BasicProperties
        {
            Persistent = true
        };

        await channel.BasicPublishAsync(
            exchange: string.Empty,
            routingKey: queue,
            mandatory: false,
            basicProperties: properties,
            body: body);
    }
}