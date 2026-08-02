using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepositsController : ControllerBase
{
    private readonly KipuDbContext _context;

    public DepositsController(KipuDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDeposits()
    {
        var deposits = await _context.FixedTermDeposits.ToListAsync();
        return Ok(deposits);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDeposit([FromBody] FixedTermDeposit deposit)
    {
        deposit.Id = Guid.NewGuid();
        deposit.Status = "Active";

        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (Guid.TryParse(familyIdClaim, out var familyId))
        {
            deposit.FamilyId = familyId;
        }

        await _context.FixedTermDeposits.AddAsync(deposit);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDeposits), new { id = deposit.Id }, deposit);
    }

    public record SettleDepositRequest(decimal ReceivedInterestManual);

    [HttpPost("{id}/settle")]
    public async Task<IActionResult> SettleDeposit(Guid id, [FromBody] SettleDepositRequest request)
    {
        var deposit = await _context.FixedTermDeposits.FirstOrDefaultAsync(d => d.Id == id);
        if (deposit == null)
        {
            return NotFound("Depósito a plazo no encontrado.");
        }

        deposit.ReceivedInterestManual = request.ReceivedInterestManual;
        deposit.Status = "Settled";
        await _context.SaveChangesAsync();
        return Ok(deposit);
    }
}
