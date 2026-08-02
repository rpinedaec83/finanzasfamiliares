using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly KipuDbContext _context;

    public BudgetsController(KipuDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets()
    {
        var budgets = await _context.Budgets.ToListAsync();
        return Ok(budgets);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] Budget budget)
    {
        budget.Id = Guid.NewGuid();

        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (Guid.TryParse(familyIdClaim, out var familyId))
        {
            budget.FamilyId = familyId;
        }

        await _context.Budgets.AddAsync(budget);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBudgets), new { id = budget.Id }, budget);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBudget(Guid id, [FromBody] Budget updated)
    {
        var budget = await _context.Budgets.FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null) return NotFound();

        budget.CategoryName = updated.CategoryName;
        budget.LimitAmount = updated.LimitAmount;
        budget.Month = updated.Month;
        budget.Year = updated.Year;
        budget.IsAnnual = updated.IsAnnual;

        await _context.SaveChangesAsync();
        return Ok(budget);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        var budget = await _context.Budgets.FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null) return NotFound();

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
