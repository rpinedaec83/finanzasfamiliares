using KipuFinanzas.Api.Data;
using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly KipuDbContext _context;

    public AuthController(IAuthService authService, KipuDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string Email, string Password, string FullName, string FamilyName);
    public record AuthResponse(string Token, string RefreshToken, User User, Family Family);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null || user.PasswordHash != HashPassword(request.Password))
        {
            return Unauthorized(new { message = "Correo electrónico o contraseña incorrectos." });
        }

        // Obtener la familia a la que pertenece
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
        Family? family = null;
        if (member != null)
        {
            family = await _context.Families.FindAsync(member.FamilyId);
        }

        if (family == null)
        {
            // Fallback si no tiene familia por alguna razón
            family = new Family { Name = "Familia Demo", BaseCurrency = Currency.PEN };
            await _context.Families.AddAsync(family);
            await _context.FamilyMembers.AddAsync(new FamilyMember { FamilyId = family.Id, UserId = user.Id, Role = "Admin" });
            await _context.SaveChangesAsync();
        }

        var token = _authService.GenerateJwtToken(user, family.Id, member?.Role ?? "Admin");
        var refreshToken = _authService.GenerateRefreshToken();

        return Ok(new AuthResponse(token, refreshToken, user, family));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists)
        {
            return BadRequest(new { message = "El correo electrónico ya está registrado." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = request.FullName,
            PasswordHash = HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        var family = new Family
        {
            Id = Guid.NewGuid(),
            Name = request.FamilyName,
            BaseCurrency = Currency.PEN,
            CreatedAt = DateTime.UtcNow
        };

        var member = new FamilyMember
        {
            Id = Guid.NewGuid(),
            FamilyId = family.Id,
            UserId = user.Id,
            Role = "Admin"
        };

        await _context.Users.AddAsync(user);
        await _context.Families.AddAsync(family);
        await _context.FamilyMembers.AddAsync(member);
        await _context.SaveChangesAsync();

        var token = _authService.GenerateJwtToken(user, family.Id, "Admin");
        var refreshToken = _authService.GenerateRefreshToken();

        return Ok(new AuthResponse(token, refreshToken, user, family));
    }

    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
