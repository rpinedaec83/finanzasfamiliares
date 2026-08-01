using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private static readonly List<CreditCard> SampleCards = new()
    {
        new CreditCard
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "BCP Visa Signature",
            LastFourDigits = "8812",
            MainCurrency = Currency.PEN,
            CreditLimit = 15000.00m,
            AvailableLimit = 11200.00m,
            ClosingDay = 20,
            DueDay = 10
        },
        new CreditCard
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "Interbank Mastercard Black",
            LastFourDigits = "3391",
            MainCurrency = Currency.USD,
            CreditLimit = 5000.00m,
            AvailableLimit = 4250.00m,
            ClosingDay = 15,
            DueDay = 5
        }
    };

    [HttpGet]
    public IActionResult GetCards()
    {
        return Ok(SampleCards);
    }

    [HttpPost]
    public IActionResult CreateCard([FromBody] CreditCard card)
    {
        card.Id = Guid.NewGuid();
        SampleCards.Add(card);
        return CreatedAtAction(nameof(GetCards), new { id = card.Id }, card);
    }
}
