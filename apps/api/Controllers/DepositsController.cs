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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDeposit(Guid id, [FromBody] FixedTermDeposit updated)
    {
        var deposit = await _context.FixedTermDeposits.FirstOrDefaultAsync(d => d.Id == id);
        if (deposit == null) return NotFound();

        deposit.BankName = updated.BankName;
        deposit.AccountHolder = updated.AccountHolder;
        deposit.InitialPrincipal = updated.InitialPrincipal;
        deposit.Currency = updated.Currency;
        deposit.AnnualRate = updated.AnnualRate;
        deposit.OpeningDate = DateTime.SpecifyKind(updated.OpeningDate, DateTimeKind.Utc);
        deposit.MaturityDate = DateTime.SpecifyKind(updated.MaturityDate, DateTimeKind.Utc);
        deposit.Status = updated.Status;

        await _context.SaveChangesAsync();
        return Ok(deposit);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeposit(Guid id)
    {
        var deposit = await _context.FixedTermDeposits.FirstOrDefaultAsync(d => d.Id == id);
        if (deposit == null) return NotFound();

        _context.FixedTermDeposits.Remove(deposit);
        await _context.SaveChangesAsync();
        return NoContent();
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
