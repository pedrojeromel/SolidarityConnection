using Microsoft.Extensions.Configuration;
using Solidarity.EmailWorker.Email;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.EmailWorker.Consumers;

public sealed class WelcomeEmailConsumer : EmailConsumer<UserRegisteredEvent>
{
    protected override string Queue => Queues.EmailUserRegistered;

    public WelcomeEmailConsumer(
        IConfiguration configuration,
        IEmailComposer<UserRegisteredEvent> composer,
        IEmailSender sender,
        ILogger<WelcomeEmailConsumer> logger)
        : base(configuration, composer, sender, logger)
    {
    }
}
