using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private static readonly List<Account> SampleAccounts = new()
    {
        new Account
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "BCP Cuenta Sueldo PEN",
            Type = AccountType.Salary,
            Currency = Currency.PEN,
            BalanceAvailable = 4520.50m,
            BalanceBook = 4520.50m,
            LastFourDigits = "4821",
            IsIncludedInNetWorth = true
        },
        new Account
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "BBVA Cuenta Ahorro USD",
            Type = AccountType.Savings,
            Currency = Currency.USD,
            BalanceAvailable = 12450.00m,
            BalanceBook = 12450.00m,
            LastFourDigits = "9102",
            IsIncludedInNetWorth = true
        },
        new Account
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Efectivo Soles",
            Type = AccountType.CashPEN,
            Currency = Currency.PEN,
            BalanceAvailable = 350.00m,
            BalanceBook = 350.00m,
            LastFourDigits = "CASH",
            IsIncludedInNetWorth = true
        }
    };

    [HttpGet]
    public IActionResult GetAccounts()
    {
        return Ok(SampleAccounts);
    }

    [HttpPost]
    public IActionResult CreateAccount([FromBody] Account account)
    {
        account.Id = Guid.NewGuid();
        SampleAccounts.Add(account);
        return CreatedAtAction(nameof(GetAccounts), new { id = account.Id }, account);
    }
}
