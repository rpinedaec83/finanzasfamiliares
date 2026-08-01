using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogsController : ControllerBase
{
    private readonly KipuDbContext? _context;
    private static List<ExchangeRate> InMemoryExchangeRates = new();

    public CatalogsController(KipuDbContext? context = null)
    {
        _context = context;
    }

    // 1. CATEGORIES CRUD
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        if (_context != null)
        {
            try
            {
                var categories = await _context.Categories.ToListAsync();
                if (categories.Any()) return Ok(categories);
            }
            catch { }
        }

        return Ok(new[]
        {
            new CategoryItem { Name = "Supermercado & Víveres", Type = "Expense", Color = "orange" },
            new CategoryItem { Name = "Combustible & Transporte", Type = "Expense", Color = "teal" },
            new CategoryItem { Name = "Tecnología & Equipos", Type = "Expense", Color = "blue" },
            new CategoryItem { Name = "Streaming & Servicios Digitales", Type = "Expense", Color = "violet" },
            new CategoryItem { Name = "Sueldo & Honorarios", Type = "Income", Color = "green" },
        });
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryItem category)
    {
        category.Id = Guid.NewGuid();
        if (_context != null)
        {
            try
            {
                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();
            }
            catch { }
        }
        return Ok(category);
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        if (_context != null)
        {
            try
            {
                var cat = await _context.Categories.FindAsync(id);
                if (cat != null)
                {
                    _context.Categories.Remove(cat);
                    await _context.SaveChangesAsync();
                }
            }
            catch { }
        }
        return Ok(new { message = "Categoría eliminada correctamente." });
    }

    // 2. BANKS / INSTITUTIONS CRUD
    [HttpGet("banks")]
    public async Task<IActionResult> GetBanks()
    {
        if (_context != null)
        {
            try
            {
                var banks = await _context.FinancialInstitutions.ToListAsync();
                if (banks.Any()) return Ok(banks);
            }
            catch { }
        }

        return Ok(new[]
        {
            new FinancialInstitution { Name = "Banco de Crédito del Perú (BCP)", Code = "BCP" },
            new FinancialInstitution { Name = "BBVA Perú", Code = "BBVA" },
            new FinancialInstitution { Name = "Interbank", Code = "IBK" },
            new FinancialInstitution { Name = "Banco Falabella", Code = "FALABELLA" },
        });
    }

    // 3. EXCHANGE RATES
    [HttpGet("exchange-rates")]
    public async Task<IActionResult> GetExchangeRates([FromQuery] int? month = null, [FromQuery] int? year = null)
    {
        int targetMonth = month ?? DateTime.UtcNow.Month;
        int targetYear = year ?? DateTime.UtcNow.Year;

        if (_context != null)
        {
            try
            {
                var rates = await _context.ExchangeRates
                    .Where(x => x.Date.Year == targetYear && x.Date.Month == targetMonth)
                    .OrderBy(x => x.Date)
                    .ToListAsync();
                return Ok(rates);
            }
            catch { }
        }
        
        var inMem = InMemoryExchangeRates
            .Where(x => x.Date.Year == targetYear && x.Date.Month == targetMonth)
            .OrderBy(x => x.Date)
            .ToList();
        return Ok(inMem);
    }

    [HttpPost("sync-exchange-rates")]
    public async Task<IActionResult> SyncExchangeRates([FromBody] SyncRequest req)
    {
        try
        {
            var rates = new List<ExchangeRate>();

            // 1. Intentar consultar la API interna de SUNAT
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                var payload = new { anio = req.Year, mes = req.Month - 1 };
                var response = await client.PostAsJsonAsync("https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias/listarTipoCambio", payload);
                if (response.IsSuccessStatusCode)
                {
                    var sunatData = await response.Content.ReadFromJsonAsync<List<SunatResponseItem>>();
                    if (sunatData != null)
                    {
                        foreach (var item in sunatData)
                        {
                            if (DateTime.TryParse(item.fecDivisa, out var parsedDate))
                            {
                                rates.Add(new ExchangeRate { Id = Guid.NewGuid(), Date = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc), BuyRate = item.valCompra, SellRate = item.valVenta, Source = "SUNAT", IsEstimated = false });
                            }
                        }
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"[SUNAT] Error: {ex.Message}"); }

            // 2. Intentar API secundaria
            if (!rates.Any())
            {
                try
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                    var response = await client.GetAsync($"https://api.apis.net.pe/v1/tipo-cambio-sunat?month={req.Month}&year={req.Year}");
                    if (response.IsSuccessStatusCode)
                    {
                        var apisData = await response.Content.ReadFromJsonAsync<List<ApisNetResponseItem>>();
                        if (apisData != null)
                        {
                            foreach (var item in apisData)
                            {
                                if (DateTime.TryParse(item.fecha, out var parsedDate))
                                {
                                    rates.Add(new ExchangeRate { Id = Guid.NewGuid(), Date = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc), BuyRate = item.compra, SellRate = item.venta, Source = "APIs.net.pe", IsEstimated = false });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex) { Console.WriteLine($"[APIs.net] Error: {ex.Message}"); }
            }

            // Rellenar en base de datos si obtuvimos tasas reales
            if (rates.Any())
            {
                if (_context != null)
                {
                    var existing = await _context.ExchangeRates.Where(x => x.Date.Year == req.Year && x.Date.Month == req.Month).ToListAsync();
                    _context.ExchangeRates.RemoveRange(existing);
                    await _context.ExchangeRates.AddRangeAsync(rates);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    InMemoryExchangeRates.RemoveAll(x => x.Date.Year == req.Year && x.Date.Month == req.Month);
                    InMemoryExchangeRates.AddRange(rates);
                }
            }

            return Ok(new { message = $"Sincronizados {rates.Count} días de SUNAT para {req.Month}/{req.Year}.", count = rates.Count });
        }
        catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    [HttpPost("exchange-rate")]
    public async Task<IActionResult> SaveExchangeRate([FromBody] ExchangeRate rate)
    {
        if (rate.Id == Guid.Empty)
        {
            rate.Id = Guid.NewGuid();
        }
        
        // Forzar UTC para evitar problemas de zona horaria
        rate.Date = DateTime.SpecifyKind(rate.Date.Date, DateTimeKind.Utc);
        rate.Source = "Manual";
        rate.IsEstimated = false;

        if (_context != null)
        {
            try
            {
                var existing = await _context.ExchangeRates.FirstOrDefaultAsync(x => x.Date.Date == rate.Date.Date);
                if (existing != null)
                {
                    existing.BuyRate = rate.BuyRate;
                    existing.SellRate = rate.SellRate;
                    existing.Source = "Manual";
                    existing.IsEstimated = false;
                }
                else
                {
                    await _context.ExchangeRates.AddAsync(rate);
                }
                await _context.SaveChangesAsync();
                return Ok(rate);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        
        InMemoryExchangeRates.RemoveAll(x => x.Date.Date == rate.Date.Date);
        InMemoryExchangeRates.Add(rate);
        return Ok(rate);
    }

    [HttpPost("banks")]
    public async Task<IActionResult> CreateBank([FromBody] FinancialInstitution bank)
    {
        bank.Id = Guid.NewGuid();
        if (_context != null)
        {
            try
            {
                await _context.FinancialInstitutions.AddAsync(bank);
                await _context.SaveChangesAsync();
            }
            catch { }
        }
        return Ok(bank);
    }

    // 3. AI RULES CRUD
    [HttpGet("airules")]
    public async Task<IActionResult> GetAiRules()
    {
        if (_context != null)
        {
            try
            {
                var rules = await _context.AiRules.ToListAsync();
                if (rules.Any()) return Ok(rules);
            }
            catch { }
        }

        return Ok(new[]
        {
            new AiClassificationRule { Pattern = "PLAYSTATION", NormalizedMerchant = "PlayStation Store", Category = "Streaming & Servicios Digitales" },
            new AiClassificationRule { Pattern = "SPOTIFY", NormalizedMerchant = "Spotify Premium", Category = "Streaming & Servicios Digitales" },
            new AiClassificationRule { Pattern = "OPENAI", NormalizedMerchant = "OpenAI ChatGPT Subscription", Category = "Tecnología & Equipos" },
        });
    }

    [HttpPost("airules")]
    public async Task<IActionResult> CreateAiRule([FromBody] AiClassificationRule rule)
    {
        rule.Id = Guid.NewGuid();
        if (_context != null)
        {
            try
            {
                await _context.AiRules.AddAsync(rule);
                await _context.SaveChangesAsync();
            }
            catch { }
        }
        return Ok(rule);
    }
}

public class SyncRequest
{
    public int Month { get; set; }
    public int Year { get; set; }
}

public class SunatResponseItem
{
    public string fecDivisa { get; set; } = "";
    public decimal valCompra { get; set; }
    public decimal valVenta { get; set; }
}

public class ApisNetResponseItem
{
    public string fecha { get; set; } = "";
    public decimal compra { get; set; }
    public decimal venta { get; set; }
}
