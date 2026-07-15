using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Solidarity.Infrastructure.Data;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.Worker;

public class Worker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;

    public Worker(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
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
            queue: Queues.DonationReceived,
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: stoppingToken);

        var consumer =
            new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += async (sender, args) =>
        {
            var json =
                Encoding.UTF8.GetString(args.Body.ToArray());

            var donationEvent =
                JsonSerializer.Deserialize<
                    DonationReceivedEvent>(json);

            if (donationEvent is not null)
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var db =
                    scope.ServiceProvider
                        .GetRequiredService<AppDbContext>();

                var campaign =
                    await db.Campaigns
                        .FirstOrDefaultAsync(x =>
                            x.Id ==
                            donationEvent.CampaignId);

                if (campaign is not null)
                {
                    campaign.TotalRaised +=
                        donationEvent.Amount;

                    campaign.UpdatedAt =
                        DateTime.UtcNow;

                    await db.SaveChangesAsync();
                }
            }

            await channel.BasicAckAsync(
                args.DeliveryTag,
                false,
                stoppingToken);
        };

        await channel.BasicConsumeAsync(
            queue: Queues.DonationReceived,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        await Task.Delay(
            Timeout.Infinite,
            stoppingToken);
    }
}