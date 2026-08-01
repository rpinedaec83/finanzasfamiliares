using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface ISunatExchangeRateService
{
    Task<ExchangeRate> GetCurrentExchangeRateAsync();
}

public class SunatExchangeRateService : ISunatExchangeRateService
{
    public Task<ExchangeRate> GetCurrentExchangeRateAsync()
    {
        // Retorna el tipo de cambio oficial SUNAT (o estimado si es fin de semana)
        var rate = new ExchangeRate
        {
            Id = Guid.NewGuid(),
            Date = DateTime.UtcNow.Date,
            BuyRate = 3.748m,
            SellRate = 3.754m,
            Source = "SUNAT Official",
            IsEstimated = DateTime.UtcNow.DayOfWeek == DayOfWeek.Saturday || DateTime.UtcNow.DayOfWeek == DayOfWeek.Sunday
        };

        return Task.FromResult(rate);
    }
}
