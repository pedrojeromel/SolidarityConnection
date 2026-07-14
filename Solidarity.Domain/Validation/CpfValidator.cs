namespace Solidarity.Domain.Validation;

public static class CpfValidator
{
    public static bool IsValid(string cpf)
    {
        var digits = Normalize(cpf);

        if (digits.Length != 11)
            return false;

        if (digits.All(x => x == digits[0]))
            return false;

        return digits[9] == CheckDigit(digits, 9)
            && digits[10] == CheckDigit(digits, 10);
    }

    public static string Normalize(string cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf))
            return string.Empty;

        return new string(
            cpf.Where(char.IsDigit).ToArray());
    }

    private static char CheckDigit(
        string digits,
        int length)
    {
        var sum = 0;
        var weight = length + 1;

        for (var i = 0; i < length; i++)
        {
            sum += (digits[i] - '0') * weight;
            weight--;
        }

        var remainder = sum % 11;

        var digit = remainder < 2
            ? 0
            : 11 - remainder;

        return (char)('0' + digit);
    }
}
