using KipuFinanzas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditLogService _auditService;

    public AuditController(IAuditLogService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public IActionResult GetAuditLogs()
    {
        var logs = _auditService.GetLogs(Guid.NewGuid());
        return Ok(logs);
    }
}
