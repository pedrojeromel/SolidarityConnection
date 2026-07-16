using Solidarity.Domain.Validation;

namespace Solidarity.Domain.Tests.Validation;

public class PasswordPolicyTests
{
    [Theory]
    [InlineData("Solidaria@2026")]
    [InlineData("abc12345!")]
    [InlineData("P@ssw0rd")]
    public void IsValid_WhenPasswordMeetsAllRules_ReturnsTrue(string password)
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid(password);

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData("Ab1@567")]
    [InlineData("A1@b")]
    public void IsValid_WhenPasswordIsTooShort_ReturnsFalse(string password)
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid(password);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValid_WhenPasswordHasNoDigit_ReturnsFalse()
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid("Solidaria@ong");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValid_WhenPasswordHasNoSpecialCharacter_ReturnsFalse()
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid("Solidaria2026");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValid_WhenPasswordHasNoLetter_ReturnsFalse()
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid("12345678@");

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void IsValid_WhenPasswordIsEmpty_ReturnsFalse(string? password)
    {
        // Arrange & Act
        var result = PasswordPolicy.IsValid(password);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Validate_WhenPasswordBreaksEveryRule_ReturnsAllViolations()
    {
        // Arrange & Act
        var violations = PasswordPolicy.Validate("abc");

        // Assert
        // Curta, sem numero e sem caractere especial: tres exigencias.
        Assert.Equal(3, violations.Count);
    }

    [Fact]
    public void Validate_WhenPasswordIsValid_ReturnsNoViolations()
    {
        // Arrange & Act
        var violations = PasswordPolicy.Validate("Solidaria@2026");

        // Assert
        Assert.Empty(violations);
    }
}
