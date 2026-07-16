using Microsoft.Extensions.Configuration;
using Solidarity.EmailWorker.Email;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

namespace Solidarity.EmailWorker.Consumers;

public sealed class DonationReceiptConsumer : EmailConsumer<DonationConfirmedEvent>
{
    protected override string Queue => Queues.EmailDonationConfirmed;

    public DonationReceiptConsumer(
        IConfiguration configuration,
        IEmailComposer<DonationConfirmedEvent> composer,
        IEmailSender sender,
        ILogger<DonationReceiptConsumer> logger)
        : base(configuration, composer, sender, logger)
    {
    }
}
