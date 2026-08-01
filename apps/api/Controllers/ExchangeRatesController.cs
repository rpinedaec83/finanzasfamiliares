using KipuFinanzas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/exchange-rates")]
public class ExchangeRatesController : ControllerBase
{
    private readonly ISunatExchangeRateService _sunatService;

    public ExchangeRatesController(ISunatExchangeRateService sunatService)
    {
        _sunatService = sunatService;
    }

    [HttpGet("sunat")]
    public async Task<IActionResult> GetSunatRate()
    {
        var rate = await _sunatService.GetCurrentExchangeRateAsync();
        return Ok(rate);
    }
}
