using KipuFinanzas.Api.Services;
using KipuFinanzas.Api.Services.BankAdapters;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportsController : ControllerBase
{
    private readonly IDeduplicationEngine _deduplicationEngine;
    private readonly IEnumerable<IBankAdapter> _bankAdapters;
    private static readonly List<DocumentImport> SampleImports = new();

    public ImportsController(IDeduplicationEngine deduplicationEngine, IEnumerable<IBankAdapter> bankAdapters)
    {
        _deduplicationEngine = deduplicationEngine;
        _bankAdapters = bankAdapters;
    }

    [HttpGet]
    public IActionResult GetImports()
    {
        return Ok(SampleImports);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Debe proporcionar un archivo válido (PDF, Excel, CSV o Imagen).");
        }

        using var reader = new StreamReader(file.OpenReadStream());
        var rawText = await reader.ReadToEndAsync();
        var fileName = file.FileName;

        // Seleccionar Adaptador Bancario
        var adapter = _bankAdapters.FirstOrDefault(a => a.CanProcess(fileName, rawText)) ?? _bankAdapters.First();
        var result = adapter.Process(fileName, rawText);

        // Deduplicación con movimientos existentes
        var existingTransactions = new List<Transaction>();
        _deduplicationEngine.FlagDuplicates(result.ExtractedRows, existingTransactions, Guid.NewGuid(), Guid.NewGuid());

        var documentImport = new DocumentImport
        {
            Id = Guid.NewGuid(),
            FamilyId = Guid.NewGuid(),
            BankName = result.BankName,
            ProductName = result.ProductName,
            Currency = result.Currency,
            InitialBalance = result.InitialBalance,
            FinalBalance = result.FinalBalance,
            CalculatedFinalBalance = result.InitialBalance + result.ExtractedRows.Where(r => !r.IsDebit).Sum(r => r.Amount) - result.ExtractedRows.Where(r => r.IsDebit).Sum(r => r.Amount),
            IsMathematicallyBalanced = result.IsMathematicallyBalanced,
            Status = result.IsMathematicallyBalanced ? ImportStatus.PreviewReady : ImportStatus.RequiresReview,
            OriginalFileName = fileName,
            CreatedAt = DateTime.UtcNow,
            Rows = result.ExtractedRows
        };

        SampleImports.Add(documentImport);
        return Ok(documentImport);
    }

    [HttpPost("{id}/confirm")]
    public IActionResult ConfirmImport(Guid id)
    {
        var importSession = SampleImports.FirstOrDefault(i => i.Id == id);
        if (importSession == null)
        {
            return NotFound("Sesión de importación no encontrada.");
        }

        importSession.Status = ImportStatus.Confirmed;
        return Ok(new { message = "Movimientos confirmados e importados exitosamente.", confirmedRows = importSession.Rows.Count(r => r.IsConfirmed) });
    }
}
