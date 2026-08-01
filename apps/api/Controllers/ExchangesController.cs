using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExchangesController : ControllerBase
{
    private readonly IFinancialService _financialService;
    private static readonly List<CurrencyExchangeOperation> SampleExchanges = new();

    public ExchangesController(IFinancialService financialService)
    {
        _financialService = financialService;
    }

    public record ExecuteExchangeRequest(
        Guid OriginAccountId,
        Guid DestinationAccountId,
        decimal DeliveredAmount,
        Currency DeliveredCurrency,
        decimal ReceivedAmount,
        Currency ReceivedCurrency,
        decimal SunatRate,
        string Provider);

    [HttpGet]
    public IActionResult GetExchanges()
    {
        return Ok(SampleExchanges);
    }

    [HttpPost]
    public IActionResult CreateExchange([FromBody] ExecuteExchangeRequest request)
    {
        var origin = new Account { Id = request.OriginAccountId, Currency = request.DeliveredCurrency, BalanceAvailable = 10000m };
        var dest = new Account { Id = request.DestinationAccountId, Currency = request.ReceivedCurrency, BalanceAvailable = 5000m };

        var operation = _financialService.ExecuteCurrencyExchange(
            Guid.NewGuid(),
            origin,
            dest,
            request.DeliveredAmount,
            request.DeliveredCurrency,
            request.ReceivedAmount,
            request.ReceivedCurrency,
            request.SunatRate,
            request.Provider);

        SampleExchanges.Add(operation);
        return Ok(operation);
    }
}
