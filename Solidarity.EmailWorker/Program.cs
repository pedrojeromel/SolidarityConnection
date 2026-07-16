using Solidarity.EmailWorker.Composers;
using Solidarity.EmailWorker.Consumers;
using Solidarity.EmailWorker.Email;
using Solidarity.Shared;
using Solidarity.Shared.Events;

var builder = Host.CreateApplicationBuilder(args);

// Configuração do SMTP (host, remetente e credenciais vêm de variáveis de
// ambiente: Smtp__Host, Smtp__Username, Smtp__Password, ...).
builder.Services
    .AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.Section));

builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();

// Um composer por tipo de e-mail.
builder.Services.AddSingleton<IEmailComposer<UserRegisteredEvent>, WelcomeEmailComposer>();
builder.Services.AddSingleton<IEmailComposer<DonationConfirmedEvent>, DonationReceiptComposer>();

// Um consumidor por fila. Adicionar um novo e-mail = novo evento + composer +
// consumidor, sem alterar os existentes.
builder.Services.AddHostedService<WelcomeEmailConsumer>();
builder.Services.AddHostedService<DonationReceiptConsumer>();

var host = builder.Build();

host.Services
    .GetRequiredService<ILogger<Program>>()
    .LogInformation(
        "Solidarity.EmailWorker versao {Version} iniciado.",
        AppVersion.Current);

host.Run();
