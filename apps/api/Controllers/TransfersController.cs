using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransfersController : ControllerBase
{
    private static readonly List<Transfer> SampleTransfers = new()
    {
        new Transfer
        {
            Id = Guid.NewGuid(),
            OriginAccountId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            DestinationAccountId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            SendDate = DateTime.UtcNow.AddDays(-3),
            SentAmount = 1500.00m,
            SentCurrency = Currency.PEN,
            ReceivedAmount = 1500.00m,
            ReceivedCurrency = Currency.PEN,
            FeeAmount = 0m,
            Status = "Conciliated"
        }
    };

    [HttpGet]
    public IActionResult GetTransfers()
    {
        return Ok(SampleTransfers);
    }

    [HttpPost]
    public IActionResult CreateTransfer([FromBody] Transfer transfer)
    {
        transfer.Id = Guid.NewGuid();
        SampleTransfers.Add(transfer);
        return Ok(transfer);
    }
}
