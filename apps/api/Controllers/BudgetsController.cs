using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private static readonly List<Budget> SampleBudgets = new()
    {
        new Budget { Id = Guid.NewGuid(), CategoryName = "Supermercado", LimitAmount = 1500.00m, ExecutedAmount = 1200.00m, Month = 8, Year = 2026 },
        new Budget { Id = Guid.NewGuid(), CategoryName = "Combustible & Transporte", LimitAmount = 600.00m, ExecutedAmount = 270.00m, Month = 8, Year = 2026 },
        new Budget { Id = Guid.NewGuid(), CategoryName = "Fotografía & Tecnología", LimitAmount = 800.00m, ExecutedAmount = 350.00m, Month = 8, Year = 2026 },
        new Budget { Id = Guid.NewGuid(), CategoryName = "Streaming & Entretenimiento", LimitAmount = 150.00m, ExecutedAmount = 89.80m, Month = 8, Year = 2026 }
    };

    [HttpGet]
    public IActionResult GetBudgets()
    {
        return Ok(SampleBudgets);
    }

    [HttpPost]
    public IActionResult CreateBudget([FromBody] Budget budget)
    {
        budget.Id = Guid.NewGuid();
        SampleBudgets.Add(budget);
        return Ok(budget);
    }
}
