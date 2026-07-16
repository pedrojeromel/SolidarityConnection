using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;

namespace Solidarity.Api.Tests.Builders;

public class UserBuilder
{
    private Guid _id = Guid.NewGuid();
    private string _fullName = "Doador de Teste";
    private string _email = "doador@solidarity.com";
    private string _cpf = "52998224725";
    private string _password = "123456";
    private UserRole _role = UserRole.Donor;

    public UserBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UserBuilder WithPassword(string password)
    {
        _password = password;
        return this;
    }

    public UserBuilder WithRole(UserRole role)
    {
        _role = role;
        return this;
    }

    public User Build()
    {
        return new User
        {
            Id = _id,
            FullName = _fullName,
            Email = _email,
            Cpf = _cpf,
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(_password),
            Role = _role,
            CreatedAt = DateTime.UtcNow
        };
    }
}
