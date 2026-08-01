using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly KipuDbContext _context;

    public GoalsController(KipuDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetGoals()
    {
        var goals = await _context.SavingsGoals.ToListAsync();
        return Ok(goals);
    }

    [HttpPost]
    public async Task<IActionResult> CreateGoal([FromBody] SavingsGoal goal)
    {
        goal.Id = Guid.NewGuid();
        if (goal.TargetDate == default)
        {
            goal.TargetDate = DateTime.UtcNow.AddMonths(6);
        }
        // Asegurar que la fecha de la meta esté marcada como UTC para postgres
        goal.TargetDate = DateTime.SpecifyKind(goal.TargetDate, DateTimeKind.Utc);
        
        await _context.SavingsGoals.AddAsync(goal);
        await _context.SaveChangesAsync();
        return Ok(goal);
    }
}
