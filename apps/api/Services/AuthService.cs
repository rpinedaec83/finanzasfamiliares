using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KipuFinanzas.SharedContracts;
using Microsoft.IdentityModel.Tokens;

namespace KipuFinanzas.Api.Services;

public interface IAuthService
{
    string GenerateJwtToken(User user, Guid familyId, string role);
    string GenerateRefreshToken();
}

public class AuthService : IAuthService
{
    private readonly string _jwtSecret;

    public AuthService(string jwtSecret)
    {
        _jwtSecret = jwtSecret;
    }

    public string GenerateJwtToken(User user, Guid familyId, string role)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("FamilyId", familyId.ToString()),
                new Claim(ClaimTypes.Role, role)
            }),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
    }
}
