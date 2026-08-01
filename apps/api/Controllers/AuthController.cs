using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string Email, string Password, string FullName, string FamilyName);
    public record AuthResponse(string Token, string RefreshToken, User User, Family Family);

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = new User
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Email = request.Email,
            FullName = "Usuario Demo"
        };

        var family = new Family
        {
            Id = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"),
            Name = "Familia Demo",
            BaseCurrency = Currency.PEN
        };

        var token = _authService.GenerateJwtToken(user, family.Id, "Admin");
        var refreshToken = _authService.GenerateRefreshToken();

        return Ok(new AuthResponse(token, refreshToken, user, family));
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName
        };

        var family = new Family
        {
            Id = Guid.NewGuid(),
            Name = request.FamilyName,
            BaseCurrency = Currency.PEN
        };

        var token = _authService.GenerateJwtToken(user, family.Id, "Admin");
        var refreshToken = _authService.GenerateRefreshToken();

        return Ok(new AuthResponse(token, refreshToken, user, family));
    }
}
