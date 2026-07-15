using Solidarity.Domain.Payments;
using Solidarity.PaymentService.Payments;

namespace Solidarity.PaymentService.Tests;

public class FakePaymentGatewayTests
{
    private const string TestCard = "4242424242424242";

    private readonly FakePaymentGateway _gateway = new(TestCard);

    private static CardData Card(string number, string cvv = "123") =>
        new(number, "Fulano de Tal", "12", "2030", cvv);

    [Fact]
    public void Authorize_WithTestCardAndValidAmount_Approves()
    {
        // Act
        var result = _gateway.Authorize(Card(TestCard), 50m);

        // Assert
        Assert.True(result.Approved);
    }

    [Fact]
    public void Authorize_AcceptsTestCardWithSpaces()
    {
        // Act
        var result = _gateway.Authorize(Card("4242 4242 4242 4242"), 50m);

        // Assert
        Assert.True(result.Approved);
    }

    [Fact]
    public void Authorize_WithDifferentCard_Declines()
    {
        // Act
        var result = _gateway.Authorize(Card("5555555555554444"), 50m);

        // Assert
        Assert.False(result.Approved);
        Assert.Contains("recusado", result.Reason);
    }

    [Theory]
    [InlineData(4.99)]
    [InlineData(0)]
    [InlineData(-10)]
    public void Authorize_BelowMinimumAmount_Declines(decimal amount)
    {
        // Act
        var result = _gateway.Authorize(Card(TestCard), amount);

        // Assert
        Assert.False(result.Approved);
        Assert.Contains("mínimo", result.Reason);
    }

    [Fact]
    public void Authorize_AtExactMinimum_Approves()
    {
        // Act
        var result = _gateway.Authorize(Card(TestCard), 5.00m);

        // Assert
        Assert.True(result.Approved);
    }

    [Theory]
    [InlineData("42")]
    [InlineData("42424242424242424242424")]
    public void Authorize_WithInvalidCardLength_Declines(string number)
    {
        // Act
        var result = _gateway.Authorize(Card(number), 50m);

        // Assert
        Assert.False(result.Approved);
    }

    [Theory]
    [InlineData("1")]
    [InlineData("")]
    public void Authorize_WithInvalidCvv_Declines(string cvv)
    {
        // Act
        var result = _gateway.Authorize(Card(TestCard, cvv), 50m);

        // Assert
        Assert.False(result.Approved);
    }
}
