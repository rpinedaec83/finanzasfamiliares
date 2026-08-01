using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertEngineService _alertEngine;
    private static readonly List<FinancialAlert> SampleAlerts = new()
    {
        new FinancialAlert
        {
            Id = Guid.NewGuid(),
            Title = "Presupuesto de Supermercado al 80%",
            Message = "Has consumido S/ 1,200 de S/ 1,500 en la categoría Supermercado.",
            Severity = AlertSeverity.Warning,
            Category = "Presupuesto",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        },
        new FinancialAlert
        {
            Id = Guid.NewGuid(),
            Title = "Vencimiento Tarjeta BCP Signature",
            Message = "El pago de tu tarjeta BCP vence en 5 días (10 de Agosto).",
            Severity = AlertSeverity.Info,
            Category = "Tarjeta",
            CreatedAt = DateTime.UtcNow.AddHours(-5)
        }
    };

    public AlertsController(IAlertEngineService alertEngine)
    {
        _alertEngine = alertEngine;
    }

    [HttpGet]
    public IActionResult GetAlerts()
    {
        return Ok(SampleAlerts);
    }

    [HttpPost("{id}/dismiss")]
    public IActionResult DismissAlert(Guid id)
    {
        var alert = SampleAlerts.FirstOrDefault(a => a.Id == id);
        if (alert != null)
        {
            alert.IsRead = true;
        }
        return Ok(new { message = "Alerta marcada como leída." });
    }
}
