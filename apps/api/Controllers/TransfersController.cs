using KipuFinanzas.Api.Data;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransfersController : ControllerBase
{
    private readonly KipuDbContext _context;

    public TransfersController(KipuDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransfers()
    {
        var transfers = await _context.Transfers.ToListAsync();
        
        // Detección automática dinámica según las reglas del Prompt Maestro
        var transactions = await _context.Transactions.ToListAsync();
        
        var outflows = transactions.Where(t => t.Amount < 0).ToList();
        var inflows = transactions.Where(t => t.Amount > 0).ToList();
        
        var detectedTransfers = new List<Transfer>();
        
        foreach (var outflow in outflows)
        {
            // Buscar un inflow coincidente
            var matchingInflow = inflows.FirstOrDefault(inflow => 
                inflow.AccountId != outflow.AccountId && // Cuentas distintas
                inflow.Currency == outflow.Currency && // Misma moneda
                Math.Abs(outflow.Amount) == inflow.Amount && // Mismo monto absoluto
                Math.Abs((outflow.OperationDate - inflow.OperationDate).TotalDays) <= 3 && // Tolerancia <= 3 días
                // Palabras clave de transferencia en la descripción
                (outflow.DescriptionOriginal.Contains("transferencia", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Contains("traspaso", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Contains("propia", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Contains("cci", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Contains("plin", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Contains("yape", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("transferencia", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("traspaso", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("propia", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("cci", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("plin", StringComparison.OrdinalIgnoreCase) ||
                 inflow.DescriptionOriginal.Contains("yape", StringComparison.OrdinalIgnoreCase) ||
                 outflow.DescriptionOriginal.Equals(inflow.DescriptionOriginal, StringComparison.OrdinalIgnoreCase))
            );
            
            if (matchingInflow != null)
            {
                // Generar un ID determinista basado en los dos IDs de transacciones
                var rawId = outflow.Id.ToString() + matchingInflow.Id.ToString();
                using var md5 = System.Security.Cryptography.MD5.Create();
                var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(rawId));
                var deterministGuid = new Guid(hash);
                
                // Evitar duplicar si ya fue registrada de forma manual en la DB o ya detectada en este loop
                if (!transfers.Any(t => t.OriginAccountId == outflow.AccountId && t.DestinationAccountId == matchingInflow.AccountId && Math.Abs(t.SendDate.Date.Subtract(outflow.OperationDate.Date).Days) <= 1) &&
                    !detectedTransfers.Any(t => t.OriginAccountId == outflow.AccountId && t.DestinationAccountId == matchingInflow.AccountId))
                {
                    detectedTransfers.Add(new Transfer
                    {
                        Id = deterministGuid,
                        FamilyId = outflow.FamilyId,
                        OriginAccountId = outflow.AccountId,
                        DestinationAccountId = matchingInflow.AccountId,
                        SendDate = outflow.OperationDate,
                        SentAmount = Math.Abs(outflow.Amount),
                        SentCurrency = outflow.Currency,
                        ReceivedAmount = matchingInflow.Amount,
                        ReceivedCurrency = matchingInflow.Currency,
                        Status = "Conciliated"
                    });
                }
            }
        }
        
        transfers.AddRange(detectedTransfers);
        
        return Ok(transfers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransfer([FromBody] Transfer transfer)
    {
        transfer.Id = Guid.NewGuid();

        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (Guid.TryParse(familyIdClaim, out var familyId))
        {
            transfer.FamilyId = familyId;
        }

        await _context.Transfers.AddAsync(transfer);
        
        // Además, al registrar una transferencia manual entre cuentas propias,
        // debemos crear los correspondientes movimientos de entrada y salida (transacciones)
        // para que afecten correctamente el saldo de las cuentas en tiempo real!
        var outflowTx = new Transaction
        {
            Id = Guid.NewGuid(),
            FamilyId = transfer.FamilyId,
            AccountId = transfer.OriginAccountId,
            OperationDate = DateTime.SpecifyKind(transfer.SendDate, DateTimeKind.Utc),
            DescriptionOriginal = $"Transferencia Propia Enviada (Ref: {transfer.Id})",
            DescriptionNormalized = "TRANSFERENCIA PROPIA ENVIADA",
            Amount = -transfer.SentAmount,
            Currency = transfer.SentCurrency,
            Type = TransactionType.Expense,
            Category = "Transferencia"
        };

        var inflowTx = new Transaction
        {
            Id = Guid.NewGuid(),
            FamilyId = transfer.FamilyId,
            AccountId = transfer.DestinationAccountId,
            OperationDate = DateTime.SpecifyKind(transfer.SendDate, DateTimeKind.Utc),
            DescriptionOriginal = $"Transferencia Propia Recibida (Ref: {transfer.Id})",
            DescriptionNormalized = "TRANSFERENCIA PROPIA RECIBIDA",
            Amount = transfer.ReceivedAmount,
            Currency = transfer.ReceivedCurrency,
            Type = TransactionType.Income,
            Category = "Transferencia"
        };

        await _context.Transactions.AddAsync(outflowTx);
        await _context.Transactions.AddAsync(inflowTx);
        
        await _context.SaveChangesAsync();
        return Ok(transfer);
    }
}
