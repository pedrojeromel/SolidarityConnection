using Solidarity.EmailWorker.Composers;
using Solidarity.Shared.Events;

namespace Solidarity.EmailWorker.Tests;

public class DonationReceiptComposerTests
{
    private readonly DonationReceiptComposer _composer = new();

    private static DonationConfirmedEvent Event() =>
        new()
        {
            DonorName = "Carlos Menezes",
            DonorEmail = "carlos@exemplo.com",
            CampaignTitle = "Reforço escolar 2026",
            Amount = 150.90m,
            OccurredAt = new DateTime(2026, 7, 15, 14, 30, 0, DateTimeKind.Utc)
        };

    [Fact]
    public void Compose_IncludesFormattedAmountInBrazilianCurrency()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.Contains("150,90", email.HtmlBody);
        Assert.Contains("150,90", email.TextBody);
    }

    [Fact]
    public void Compose_IncludesCampaignTitle()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        // No texto puro o título aparece como está; no HTML os acentos são
        // codificados como entidades (bom para e-mail), então checamos a parte
        // sem acento.
        Assert.Contains("Reforço escolar 2026", email.TextBody);
        Assert.Contains("escolar 2026", email.HtmlBody);
    }

    [Fact]
    public void Compose_GreetsDonorByFirstName()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.Contains("Carlos", email.TextBody);
        Assert.DoesNotContain("Menezes", email.TextBody);
    }

    [Theory]
    [InlineData("http://")]
    [InlineData("https://")]
    [InlineData("www.")]
    [InlineData("<a ")]
    public void Compose_ContainsNoLinks(string forbidden)
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.DoesNotContain(forbidden, email.HtmlBody, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(forbidden, email.TextBody, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Compose_TargetsTheDonorEmail()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.Equal("carlos@exemplo.com", email.ToEmail);
        Assert.False(string.IsNullOrWhiteSpace(email.Subject));
    }
}
