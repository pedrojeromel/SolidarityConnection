using Microsoft.EntityFrameworkCore;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Tests.Infrastructure;

/// <summary>
/// O AppDbContext é uma classe concreta do EF Core: fazer mock de DbSet/IQueryable
/// é frágil e não executa as queries de verdade. Por isso o banco é substituído pelo
/// provider InMemory, enquanto as dependências que possuem contrato próprio
/// (IMessagePublisher, IDonationRepository, IJwtTokenService) são mockadas com Moq.
/// </summary>
public static class TestDbContextFactory
{
    public static AppDbContext Create()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase($"solidarity-tests-{Guid.NewGuid()}")
                .Options;

        return new AppDbContext(options);
    }
}
