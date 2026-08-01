using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditCardsController : ControllerBase
{
    private readonly KipuDbContext? _context;

    // Fallback in-memory mientras no hay DB conectada
    private static readonly List<CreditCard> InMemoryCards = new()
    {
        new CreditCard
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Name = "BBVA Mastercard Soles",
            LastFourDigits = "5437",
            MainCurrency = Currency.PEN,
            CreditLimit = 8000m,
            AvailableLimit = 6500m,
            ClosingDay = 20,
            DueDay = 10
        },
        new CreditCard
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Name = "BBVA Sueldo Dólares",
            LastFourDigits = "0139",
            MainCurrency = Currency.USD,
            CreditLimit = 5000m,
            AvailableLimit = 4200m,
            ClosingDay = 15,
            DueDay = 5
        }
    };

    public CreditCardsController(KipuDbContext? context = null)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCreditCards()
    {
        if (_context != null)
        {
            try
            {
                var dbCards = await _context.CreditCards.ToListAsync();
                return Ok(dbCards);
            }
            catch { }
        }
        return Ok(InMemoryCards);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCreditCard([FromBody] CreditCard card)
    {
        card.Id = Guid.NewGuid();
        if (_context != null)
        {
            try
            {
                await _context.CreditCards.AddAsync(card);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetCreditCards), new { id = card.Id }, card);
            }
            catch { }
        }

        InMemoryCards.Add(card);
        return CreatedAtAction(nameof(GetCreditCards), new { id = card.Id }, card);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCreditCard(Guid id, [FromBody] CreditCard card)
    {
        if (_context != null)
        {
            try
            {
                var existing = await _context.CreditCards.FindAsync(id);
                if (existing != null)
                {
                    existing.Name = card.Name;
                    existing.LastFourDigits = card.LastFourDigits;
                    existing.MainCurrency = card.MainCurrency;
                    existing.CreditLimit = card.CreditLimit;
                    existing.AvailableLimit = card.AvailableLimit;
                    existing.ClosingDay = card.ClosingDay;
                    existing.DueDay = card.DueDay;
                    await _context.SaveChangesAsync();
                    return Ok(existing);
                }
            }
            catch { }
        }

        var inMem = InMemoryCards.FirstOrDefault(c => c.Id == id);
        if (inMem != null)
        {
            inMem.Name = card.Name;
            inMem.LastFourDigits = card.LastFourDigits;
            inMem.MainCurrency = card.MainCurrency;
            inMem.CreditLimit = card.CreditLimit;
            inMem.AvailableLimit = card.AvailableLimit;
            inMem.ClosingDay = card.ClosingDay;
            inMem.DueDay = card.DueDay;
        }

        return Ok(card);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCreditCard(Guid id)
    {
        if (_context != null)
        {
            try
            {
                var existing = await _context.CreditCards.FindAsync(id);
                if (existing != null)
                {
                    _context.CreditCards.Remove(existing);
                    await _context.SaveChangesAsync();
                }
            }
            catch { }
        }

        InMemoryCards.RemoveAll(c => c.Id == id);
        return Ok(new { message = "Tarjeta de crédito eliminada correctamente." });
    }
}
