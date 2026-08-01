using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private static readonly List<SavingsGoal> SampleGoals = new()
    {
        new SavingsGoal
        {
            Id = Guid.NewGuid(),
            Name = "Lente Fotográfico Sony 24-70mm GM II",
            TargetAmount = 7000.00m,
            SavedAmount = 4300.00m,
            Currency = Currency.PEN,
            TargetDate = DateTime.UtcNow.AddMonths(4)
        },
        new SavingsGoal
        {
            Id = Guid.NewGuid(),
            Name = "Fondo de Emergencia Familiar",
            TargetAmount = 10000.00m,
            SavedAmount = 8500.00m,
            Currency = Currency.USD,
            TargetDate = DateTime.UtcNow.AddMonths(12)
        }
    };

    [HttpGet]
    public IActionResult GetGoals()
    {
        return Ok(SampleGoals);
    }

    [HttpPost]
    public IActionResult CreateGoal([FromBody] SavingsGoal goal)
    {
        goal.Id = Guid.NewGuid();
        SampleGoals.Add(goal);
        return Ok(goal);
    }
}
