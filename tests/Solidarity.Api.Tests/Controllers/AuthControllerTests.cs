using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Solidarity.Api.Tests.Builders;
using Solidarity.Api.Tests.Infrastructure;
using Solidarity.Application.DTOs.Auth;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;
using Solidarity.Infrastructure.Data;

namespace Solidarity.Api.Tests.Controllers;

public class AuthControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IJwtTokenService> _jwt;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _context = TestDbContextFactory.Create();
        _jwt = new Mock<IJwtTokenService>();

        _controller = new AuthController(
            _context,
            _jwt.Object);
    }

    [Theory]
    [InlineData("12345678901")]
    [InlineData("00000000000")]
    [InlineData("123")]
    [InlineData("")]
    public async Task Register_WhenCpfIsInvalid_ReturnsBadRequestAndDoesNotPersistUser(
        string cpf)
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Doador Teste",
            Email = "doador@solidarity.com",
            Cpf = cpf,
            Password = "123456"
        };

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);

        Assert.False(await _context.Users.AnyAsync());
    }

    [Fact]
    public async Task Register_WhenCpfIsMasked_PersistsOnlyDigits()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Doador Teste",
            Email = "doador@solidarity.com",
            Cpf = "529.982.247-25",
            Password = "123456"
        };

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<OkResult>(result);

        var user = await _context.Users.SingleAsync();

        Assert.Equal("52998224725", user.Cpf);
    }

    [Fact]
    public async Task Register_WhenRequestIsValid_StoresHashedPassword()
    {
        // Arrange
        const string password = "123456";

        var request = new RegisterRequest
        {
            FullName = "Doador Teste",
            Email = "doador@solidarity.com",
            Cpf = "52998224725",
            Password = password
        };

        // Act
        await _controller.Register(request);

        // Assert
        var user = await _context.Users.SingleAsync();

        Assert.NotEqual(password, user.PasswordHash);

        Assert.True(
            BCrypt.Net.BCrypt.Verify(password, user.PasswordHash));
    }

    [Fact]
    public async Task Register_WhenRequestIsValid_AssignsDonorRole()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Doador Teste",
            Email = "doador@solidarity.com",
            Cpf = "52998224725",
            Password = "123456"
        };

        // Act
        await _controller.Register(request);

        // Assert
        var user = await _context.Users.SingleAsync();

        Assert.Equal(UserRole.Donor, user.Role);
    }

    [Fact]
    public async Task Register_WhenEmailAlreadyExists_ReturnsBadRequest()
    {
        // Arrange
        await GivenUser(
            new UserBuilder()
                .WithEmail("doador@solidarity.com")
                .Build());

        var request = new RegisterRequest
        {
            FullName = "Outro Doador",
            Email = "doador@solidarity.com",
            Cpf = "11144477735",
            Password = "123456"
        };

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(1, await _context.Users.CountAsync());
    }

    [Fact]
    public async Task Login_WhenCredentialsAreValid_ReturnsGeneratedToken()
    {
        // Arrange
        const string expectedToken = "jwt-token";

        await GivenUser(
            new UserBuilder()
                .WithEmail("doador@solidarity.com")
                .WithPassword("123456")
                .Build());

        _jwt.Setup(x => x.Generate(It.IsAny<User>()))
            .Returns(expectedToken);

        var request = new LoginRequest
        {
            Email = "doador@solidarity.com",
            Password = "123456"
        };

        // Act
        var result = await _controller.Login(request);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result);

        var response = Assert.IsType<LoginResponse>(ok.Value);

        Assert.Equal(expectedToken, response.Token);

        _jwt.Verify(
            x => x.Generate(It.IsAny<User>()),
            Times.Once);
    }

    [Fact]
    public async Task Login_WhenPasswordIsWrong_ReturnsUnauthorizedAndDoesNotGenerateToken()
    {
        // Arrange
        await GivenUser(
            new UserBuilder()
                .WithEmail("doador@solidarity.com")
                .WithPassword("123456")
                .Build());

        var request = new LoginRequest
        {
            Email = "doador@solidarity.com",
            Password = "senha-errada"
        };

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);

        _jwt.Verify(
            x => x.Generate(It.IsAny<User>()),
            Times.Never);
    }

    [Fact]
    public async Task Login_WhenEmailDoesNotExist_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "inexistente@solidarity.com",
            Password = "123456"
        };

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    private async Task GivenUser(User user)
    {
        _context.Users.Add(user);

        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();

        GC.SuppressFinalize(this);
    }
}
