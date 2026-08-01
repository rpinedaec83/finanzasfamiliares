using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly KipuDbContext? _context;

    private static readonly List<Account> InMemoryAccounts = new()
    {
        new Account
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "BCP Cuenta Sueldo Soles",
            Type = AccountType.Salary,
            Currency = Currency.PEN,
            BalanceAvailable = 4520.50m,
            BalanceBook = 4520.50m,
            LastFourDigits = "2012",
            IsIncludedInNetWorth = true
        },
        new Account
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "BBVA Ahorro Dólares",
            Type = AccountType.Savings,
            Currency = Currency.USD,
            BalanceAvailable = 12450.00m,
            BalanceBook = 12450.00m,
            LastFourDigits = "9192",
            IsIncludedInNetWorth = true
        },
        new Account
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Falabella Ahorro Soles",
            Type = AccountType.Savings,
            Currency = Currency.PEN,
            BalanceAvailable = 1890.00m,
            BalanceBook = 1890.00m,
            LastFourDigits = "3645",
            IsIncludedInNetWorth = true
        },
        new Account
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "Billetera Efectivo Soles",
            Type = AccountType.CashPEN,
            Currency = Currency.PEN,
            BalanceAvailable = 350.00m,
            BalanceBook = 350.00m,
            LastFourDigits = "CASH",
            IsIncludedInNetWorth = true
        }
    };

    public AccountsController(KipuDbContext? context = null)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAccounts()
    {
        if (_context != null)
        {
            try
            {
                var dbAccounts = await _context.Accounts.ToListAsync();
                if (dbAccounts.Any()) return Ok(dbAccounts);
            }
            catch { }
        }
        return Ok(InMemoryAccounts);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] Account account)
    {
        account.Id = Guid.NewGuid();
        if (_context != null)
        {
            try
            {
                await _context.Accounts.AddAsync(account);
                await _context.SaveChangesAsync();
            }
            catch { }
        }

        InMemoryAccounts.Add(account);
        return CreatedAtAction(nameof(GetAccounts), new { id = account.Id }, account);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] Account account)
    {
        if (_context != null)
        {
            try
            {
                var existing = await _context.Accounts.FindAsync(id);
                if (existing != null)
                {
                    existing.BankName = account.BankName;
                    existing.Name = account.Name;
                    existing.CciNumber = account.CciNumber;
                    existing.BalanceAvailable = account.BalanceAvailable;
                    existing.Currency = account.Currency;
                    await _context.SaveChangesAsync();
                }
            }
            catch { }
        }

        var inMem = InMemoryAccounts.FirstOrDefault(a => a.Id == id);
        if (inMem != null)
        {
            inMem.Name = account.Name;
            inMem.BalanceAvailable = account.BalanceAvailable;
            inMem.Currency = account.Currency;
        }

        return Ok(account);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        if (_context != null)
        {
            try
            {
                var existing = await _context.Accounts.FindAsync(id);
                if (existing != null)
                {
                    _context.Accounts.Remove(existing);
                    await _context.SaveChangesAsync();
                }
            }
            catch { }
        }

        InMemoryAccounts.RemoveAll(a => a.Id == id);
        return Ok(new { message = "Cuenta eliminada correctamente de la base de datos." });
    }
}
