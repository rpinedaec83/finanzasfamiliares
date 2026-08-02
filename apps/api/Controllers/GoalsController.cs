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
        goal.TargetDate = DateTime.SpecifyKind(goal.TargetDate, DateTimeKind.Utc);

        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (Guid.TryParse(familyIdClaim, out var familyId))
        {
            goal.FamilyId = familyId;
        }
        
        await _context.SavingsGoals.AddAsync(goal);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, goal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGoal(Guid id, [FromBody] SavingsGoal updated)
    {
        var goal = await _context.SavingsGoals.FirstOrDefaultAsync(g => g.Id == id);
        if (goal == null) return NotFound();

        goal.Name = updated.Name;
        goal.TargetAmount = updated.TargetAmount;
        goal.SavedAmount = updated.SavedAmount;
        goal.Currency = updated.Currency;
        if (updated.TargetDate != default)
        {
            goal.TargetDate = DateTime.SpecifyKind(updated.TargetDate, DateTimeKind.Utc);
        }

        await _context.SaveChangesAsync();
        return Ok(goal);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGoal(Guid id)
    {
        var goal = await _context.SavingsGoals.FirstOrDefaultAsync(g => g.Id == id);
        if (goal == null) return NotFound();

        _context.SavingsGoals.Remove(goal);
        
        // Desvincular cualquier transacción asociada a esta meta
        var txs = await _context.Transactions.Where(t => t.SavingsGoalId == id).ToListAsync();
        foreach (var t in txs)
        {
            t.SavingsGoalId = null;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
