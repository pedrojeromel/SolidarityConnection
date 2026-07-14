using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;

namespace Solidarity.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            FullName = "NGO Manager",
            Email = "manager@solidarity.com",
            Cpf = "52998224725",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), 
            Role = UserRole.NgoManager,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }
}