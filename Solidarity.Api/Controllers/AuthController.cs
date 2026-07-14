using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Solidarity.Application.DTOs.Auth;
using Solidarity.Domain.Entities;
using Solidarity.Domain.Enums;
using Solidarity.Domain.Validation;
using Solidarity.Infrastructure.Data;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenService _jwt;

    public AuthController(
        AppDbContext context,
        IJwtTokenService jwt)
    {
        _context = context;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        if (!CpfValidator.IsValid(request.Cpf))
            return BadRequest("Invalid CPF.");

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