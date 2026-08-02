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
        return Ok(budget);
    }
}
