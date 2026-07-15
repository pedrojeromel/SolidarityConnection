using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Application.DTOs.Auth;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;
using Solidarity.Domain.Validation;
using Solidarity.Infrastructure.Data;
using Solidarity.Shared.Events;
using Solidarity.Shared.Messaging;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenService _jwt;
    private readonly IMessagePublisher _publisher;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        IJwtTokenService jwt,
        IMessagePublisher publisher,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwt = jwt;
        _publisher = publisher;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        if (!CpfValidator.IsValid(request.Cpf))
            return BadRequest("Invalid CPF.");

        var passwordViolations =
            PasswordPolicy.Validate(request.Password);

        if (passwordViolations.Count > 0)
            return BadRequest(
                string.Join(" ", passwordViolations));

        if (await _context.Users
            .AnyAsync(x => x.Email == request.Email))
        {
            return BadRequest("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            Cpf = CpfValidator.Normalize(request.Cpf),
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password),
            Role = UserRole.Donor,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        // O e-mail é um efeito colateral: uma falha ao publicar não deve
        // impedir o cadastro, que já está persistido.
        try
        {
            await _publisher.PublishAsync(
                new UserRegisteredEvent
                {
                    FullName = user.FullName,
                    Email = user.Email
                },
                Queues.EmailUserRegistered);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Falha ao publicar e-mail de boas-vindas para {Email}.",
                user.Email);
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Email == request.Email);

        if (user == null)
            return Unauthorized();

        var valid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!valid)
            return Unauthorized();

        return Ok(new LoginResponse
        {
            Token = _jwt.Generate(user)
        });
    }
}