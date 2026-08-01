using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelegramController : ControllerBase
{
    private static TelegramLink ActiveLink = new()
    {
        Id = Guid.NewGuid(),
        UserId = Guid.NewGuid(),
        TelegramUsername = "@rpinedaec83",
        BindingCode = "482910",
        BindingExpiresAt = DateTime.UtcNow.AddMinutes(10),
        IsBound = true
    };

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        return Ok(ActiveLink);
    }

    [HttpPost("generate-code")]
    public IActionResult GenerateCode()
    {
        var randomCode = new Random().Next(100000, 999999).ToString();
        ActiveLink.BindingCode = randomCode;
        ActiveLink.BindingExpiresAt = DateTime.UtcNow.AddMinutes(10);
        ActiveLink.IsBound = false;

        return Ok(new { code = randomCode, expiresAt = ActiveLink.BindingExpiresAt, instructions = "Envía '/start " + randomCode + "' al bot @KipuFinanzasBot en Telegram." });
    }
}
