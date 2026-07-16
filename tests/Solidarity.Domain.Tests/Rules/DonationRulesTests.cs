using Solidarity.Domain.Rules;

namespace Solidarity.Domain.Tests.Rules;

public class DonationRulesTests
{
    [Theory]
    [InlineData(5.00)]
    [InlineData(5.01)]
    [InlineData(1000)]
    public void IsAmountValid_AtOrAboveMinimum_ReturnsTrue(decimal amount)
    {
        Assert.True(DonationRules.IsAmountValid(amount));
    }

    [Theory]
    [InlineData(4.99)]
    [InlineData(0)]
    [InlineData(-1)]
    public void IsAmountValid_BelowMinimum_ReturnsFalse(decimal amount)
    {
        Assert.False(DonationRules.IsAmountValid(amount));
    }
}
