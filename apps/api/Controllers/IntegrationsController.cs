using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly IEmailIngestionService _emailService;

    private static readonly List<EmailAccount> SampleEmailAccounts = new()
    {
        new EmailAccount
        {
            Id = Guid.NewGuid(),
            EmailAddress = "rpinedaec83@gmail.com",
            Provider = IntegrationProvider.Gmail,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow.AddHours(-1)
        },
        new EmailAccount
        {
            Id = Guid.NewGuid(),
            EmailAddress = "robertdpl_ec@hotmail.com",
            Provider = IntegrationProvider.Outlook,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow.AddHours(-3)
        },
        new EmailAccount
        {
            Id = Guid.NewGuid(),
            EmailAddress = "rpineda@x-codec.net",
            Provider = IntegrationProvider.CustomImap,
            Host = "mail.x-codec.net",
            Port = 993,
            UseTls = true,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow.AddHours(-2)
        }
    };

    public IntegrationsController(IEmailIngestionService emailService)
    {
        _emailService = emailService;
    }

    [HttpGet("emails")]
    public IActionResult GetEmailAccounts()
    {
        return Ok(SampleEmailAccounts);
    }

    [HttpPost("emails/sync")]
    public async Task<IActionResult> SyncEmailAccount([FromBody] Guid accountId)
    {
        var account = SampleEmailAccounts.FirstOrDefault(a => a.Id == accountId) ?? SampleEmailAccounts.First();
        var processed = await _emailService.SyncEmailAccountAsync(account);
        return Ok(new { message = "Sincronización de correo completada.", processedStatements = processed });
    }
}
