using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Solidarity.EmailWorker.Email;

namespace Solidarity.EmailWorker.Consumers;

/// <summary>
/// Base de consumo de fila para envio de e-mail: declara a fila, desserializa
/// o evento, delega a composição ao <see cref="IEmailComposer{TEvent}"/> e o
/// envio ao <see cref="IEmailSender"/>. A subclasse só informa a fila —
/// toda a mecânica de mensageria fica aqui (DRY).
/// </summary>
public abstract class EmailConsumer<TEvent> : BackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly IEmailComposer<TEvent> _composer;
    private readonly IEmailSender _sender;
    private readonly ILogger _logger;

    protected abstract string Queue { get; }

    protected EmailConsumer(
        IConfiguration configuration,
        IEmailComposer<TEvent> composer,
        IEmailSender sender,
        ILogger logger)
    {
        _configuration = configuration;
        _composer = composer;
        _sender = sender;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _configuration["RabbitMq:Host"]
        };

        var connection =
            await factory.CreateConnectionAsync(stoppingToken);

        var channel =
            await connection.CreateChannelAsync(
                cancellationToken: stoppingToken);

        await channel.QueueDeclareAsync(
            queue: Queue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: stoppingToken);

        // Um e-mail por vez: evita abrir muitas conexões SMTP simultâneas.
        await channel.BasicQosAsync(0, 1, false, stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += async (_, args) =>
        {
            try
            {
                var json = Encoding.UTF8.GetString(args.Body.ToArray());
                var evt = JsonSerializer.Deserialize<TEvent>(json);

                if (evt is not null)
                {
                    var email = _composer.Compose(evt);

                    await _sender.SendAsync(email, stoppingToken);

                    _logger.LogInformation(
                        "E-mail enviado para {Email} (fila {Queue}).",
                        email.ToEmail,
                        Queue);
                }

                await channel.BasicAckAsync(args.DeliveryTag, false, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Falha ao processar mensagem da fila {Queue}.",
                    Queue);

                // requeue: false — a mensagem problemática não fica em loop.
                await channel.BasicNackAsync(
                    args.DeliveryTag, false, false, stoppingToken);
            }
        };

        await channel.BasicConsumeAsync(
            queue: Queue,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
