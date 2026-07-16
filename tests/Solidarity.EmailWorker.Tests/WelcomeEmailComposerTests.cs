using Solidarity.EmailWorker.Composers;
using Solidarity.Shared.Events;

namespace Solidarity.EmailWorker.Tests;

public class WelcomeEmailComposerTests
{
    private readonly WelcomeEmailComposer _composer = new();

    private static UserRegisteredEvent Event(string name = "Maria Silva Santos") =>
        new() { FullName = name, Email = "maria@exemplo.com" };

    [Fact]
    public void Compose_UsesRecipientFromEvent()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.Equal("maria@exemplo.com", email.ToEmail)
            ;
        Assert.Equal("Maria Silva Santos", email.ToName);
    }

    [Fact]
    public void Compose_GreetsByFirstName()
    {
        // Act
        var email = _composer.Compose(Event("Maria Silva Santos"));

        // Assert
        Assert.Contains("Maria", email.HtmlBody);
        Assert.Contains("Maria", email.TextBody);
        Assert.DoesNotContain("Silva Santos", email.TextBody);
    }

    [Fact]
    public void Compose_HasNonEmptySubjectAndBothBodies()
    {
        // Act
        var email = _composer.Compose(Event());

        // Assert
        Assert.False(string.IsNullOrWhiteSpace(email.Subject));
        Assert.False(string.IsNullOrWhiteSpace(email.HtmlBody));
        Assert.False(string.IsNullOrWhiteSpace(email.TextBody));
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
    public void Compose_WhenNameIsEmpty_FallsBackToGenericGreeting()
    {
        // Act
        var email = _composer.Compose(Event("   "));

        // Assert
        Assert.Contains("doador", email.TextBody);
    }
}
