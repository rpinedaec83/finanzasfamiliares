using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private static readonly List<Transaction> SampleTransactions = new()
    {
        new Transaction
        {
            Id = Guid.NewGuid(),
            OperationDate = DateTime.UtcNow.AddDays(-1),
            DescriptionOriginal = "SUPERMERCADOS WONG BCP",
            DescriptionNormalized = "Supermercados Wong",
            Amount = 385.50m,
            Currency = Currency.PEN,
            Type = TransactionType.Expense,
            Category = "Supermercado",
            Merchant = "Wong",
            Status = TransactionStatus.Confirmed
        },
        new Transaction
        {
            Id = Guid.NewGuid(),
            OperationDate = DateTime.UtcNow.AddDays(-2),
            DescriptionOriginal = "REXTIE VENTA USD",
            DescriptionNormalized = "Venta de Dólares Rextie",
            Amount = 3755.00m,
            Currency = Currency.PEN,
            Type = TransactionType.CurrencyExchange,
            Category = "Cambio de Moneda",
            Merchant = "Rextie",
            Status = TransactionStatus.Confirmed
        }
    };

    [HttpGet]
    public IActionResult GetTransactions()
    {
        return Ok(SampleTransactions);
    }

    [HttpPost]
    public IActionResult CreateTransaction([FromBody] Transaction transaction)
    {
        transaction.Id = Guid.NewGuid();
        SampleTransactions.Add(transaction);
        return Ok(transaction);
    }
}
