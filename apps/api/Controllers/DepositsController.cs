using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepositsController : ControllerBase
{
    private static readonly List<FixedTermDeposit> SampleDeposits = new()
    {
        new FixedTermDeposit
        {
            Id = Guid.NewGuid(),
            BankName = "BCP",
            AccountHolder = "Robert Pineda",
            InitialPrincipal = 20000.00m,
            Currency = Currency.PEN,
            AnnualRate = 6.50m,
            OpeningDate = DateTime.UtcNow.AddMonths(-6),
            MaturityDate = DateTime.UtcNow.AddDays(15),
            ExpectedInterestManual = 650.00m, // Registro estrictamente manual
            Status = "Active"
        }
    };

    [HttpGet]
    public IActionResult GetDeposits()
    {
        return Ok(SampleDeposits);
    }

    [HttpPost]
    public IActionResult CreateDeposit([FromBody] FixedTermDeposit deposit)
    {
        deposit.Id = Guid.NewGuid();
        deposit.Status = "Active";
        SampleDeposits.Add(deposit);
        return CreatedAtAction(nameof(GetDeposits), new { id = deposit.Id }, deposit);
    }

    public record SettleDepositRequest(decimal ReceivedInterestManual);

    [HttpPost("{id}/settle")]
    public IActionResult SettleDeposit(Guid id, [FromBody] SettleDepositRequest request)
    {
        var deposit = SampleDeposits.FirstOrDefault(d => d.Id == id);
        if (deposit == null)
        {
            return NotFound("Depósito a plazo no encontrado.");
        }

        deposit.ReceivedInterestManual = request.ReceivedInterestManual;
        deposit.Status = "Settled";
        return Ok(deposit);
    }
}
