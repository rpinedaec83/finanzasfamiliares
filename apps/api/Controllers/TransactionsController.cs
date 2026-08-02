using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly KipuDbContext? _context;

    private static readonly List<Transaction> InMemoryTransactions = new();

    public TransactionsController(KipuDbContext? context = null)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions()
    {
        if (_context != null)
        {
            try
            {
                var dbTx = await _context.Transactions.OrderByDescending(t => t.OperationDate).ToListAsync();
                return Ok(dbTx);
            }
            catch { }
        }
        return Ok(InMemoryTransactions);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] Transaction transaction)
    {
        transaction.Id = Guid.NewGuid();
        transaction.OperationDate = DateTime.SpecifyKind(transaction.OperationDate, DateTimeKind.Utc);

        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (Guid.TryParse(familyIdClaim, out var familyId))
        {
            transaction.FamilyId = familyId;
        }

        if (_context != null)
        {
            try
            {
                await _context.Transactions.AddAsync(transaction);
                await _context.SaveChangesAsync();
            }
            catch { }
        }

        InMemoryTransactions.Add(transaction);
        return Ok(transaction);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateTransactionsBulk([FromBody] List<Transaction> transactions)
    {
        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        Guid.TryParse(familyIdClaim, out var familyId);

        foreach (var transaction in transactions)
        {
            transaction.Id = Guid.NewGuid();
            transaction.FamilyId = familyId;
            transaction.OperationDate = DateTime.SpecifyKind(transaction.OperationDate, DateTimeKind.Utc);
            
            if (_context != null)
            {
                await _context.Transactions.AddAsync(transaction);
            }
            else
            {
                InMemoryTransactions.Add(transaction);
            }
        }

        if (_context != null)
        {
            await _context.SaveChangesAsync();
        }

        return Ok(transactions);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearAllTransactions()
    {
        if (_context != null)
        {
            try
            {
                _context.Transactions.RemoveRange(_context.Transactions);
                await _context.SaveChangesAsync();
            }
            catch { }
        }

        InMemoryTransactions.Clear();
        return Ok(new { message = "Todos los movimientos han sido eliminados de la base de datos." });
    }
}
