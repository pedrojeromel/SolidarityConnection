using Solidarity.Domain.Validation;

namespace Solidarity.Domain.Tests.Validation;

public class CpfValidatorTests
{
    [Theory]
    [InlineData("52998224725")]
    [InlineData("529.982.247-25")]
    [InlineData("11144477735")]
    [InlineData("111.444.777-35")]
    public void IsValid_WhenCpfIsWellFormed_ReturnsTrue(string cpf)
    {
        // Arrange & Act
        var result = CpfValidator.IsValid(cpf);

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData("52998224724")]
    [InlineData("12345678901")]
    public void IsValid_WhenCheckDigitsAreWrong_ReturnsFalse(string cpf)
    {
        // Arrange & Act
        var result = CpfValidator.IsValid(cpf);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("00000000000")]
    [InlineData("11111111111")]
    [InlineData("99999999999")]
    public void IsValid_WhenAllDigitsAreRepeated_ReturnsFalse(string cpf)
    {
        // Arrange & Act
        var result = CpfValidator.IsValid(cpf);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("529982247")]
    [InlineData("529982247250")]
    public void IsValid_WhenLengthIsNotElevenDigits_ReturnsFalse(string cpf)
    {
        // Arrange & Act
        var result = CpfValidator.IsValid(cpf);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("abcdefghijk")]
    [InlineData(null)]
    public void IsValid_WhenCpfHasNoDigits_ReturnsFalse(string? cpf)
    {
        // Arrange & Act
        var result = CpfValidator.IsValid(cpf!);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Normalize_WhenCpfIsMasked_RemovesNonDigitCharacters()
    {
        // Arrange
        const string masked = "529.982.247-25";

        // Act
        var result = CpfValidator.Normalize(masked);

        // Assert
        Assert.Equal("52998224725", result);
    }

    [Fact]
    public void Normalize_WhenCpfIsNull_ReturnsEmptyString()
    {
        // Arrange & Act
        var result = CpfValidator.Normalize(null!);

        // Assert
        Assert.Equal(string.Empty, result);
    }
}
