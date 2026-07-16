namespace Solidarity.Domain.Validation;

public static class PasswordPolicy
{
    public const int MinimumLength = 8;

    /// <summary>
    /// Regras minimas de senha. Retorna a lista de exigencias nao atendidas
    /// (vazia quando a senha e valida), para que a API possa dizer ao usuario
    /// exatamente o que corrigir.
    /// </summary>
    public static IReadOnlyList<string> Validate(string? password)
    {
        var violations = new List<string>();

        if (string.IsNullOrWhiteSpace(password))
        {
            violations.Add("A senha é obrigatória.");

            return violations;
        }

        if (password.Length < MinimumLength)
            violations.Add(
                $"A senha deve ter no mínimo {MinimumLength} caracteres.");

        if (!password.Any(char.IsLetter))
            violations.Add("A senha deve conter ao menos uma letra.");

        if (!password.Any(char.IsDigit))
            violations.Add("A senha deve conter ao menos um número.");

        if (!password.Any(IsSpecial))
            violations.Add(
                "A senha deve conter ao menos um caractere especial.");

        return violations;
    }

    public static bool IsValid(string? password)
    {
        return Validate(password).Count == 0;
    }

    private static bool IsSpecial(char character)
    {
        return !char.IsLetterOrDigit(character)
            && !char.IsWhiteSpace(character);
    }
}
