using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services.BankAdapters;

public interface IBankAdapter
{
    string BankCode { get; }
    bool CanProcess(string fileName, string rawContent);
    BankAdapterResult Process(string fileName, string rawContent);
}

public class BcpBankAdapter : IBankAdapter
{
    public string BankCode => "BCP";

    public bool CanProcess(string fileName, string rawContent)
    {
        return rawContent.Contains("BCP", StringComparison.OrdinalIgnoreCase) ||
               rawContent.Contains("BANCO DE CREDITO", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("BCP", StringComparison.OrdinalIgnoreCase);
    }

    public BankAdapterResult Process(string fileName, string rawContent)
    {
        var rows = new List<ImportRow>
        {
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-5),
                OriginalDescription = "COMPRA SUPERMERCADOS WONG PE",
                NormalizedDescription = "Supermercados Wong",
                Amount = 385.50m,
                Currency = Currency.PEN,
                IsDebit = true,
                SuggestedCategory = "Supermercado",
                SuggestedMerchant = "Wong"
            },
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-4),
                OriginalDescription = "ABONO POR NOMINA / SUELDO EMPRESA",
                NormalizedDescription = "Abono Sueldo Empresa",
                Amount = 7500.00m,
                Currency = Currency.PEN,
                IsDebit = false,
                SuggestedCategory = "Sueldo",
                SuggestedMerchant = "Empleador"
            },
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-2),
                OriginalDescription = "PAGO SERVICIO LUZ LUZ DEL SUR",
                NormalizedDescription = "Luz del Sur",
                Amount = 142.80m,
                Currency = Currency.PEN,
                IsDebit = true,
                SuggestedCategory = "Servicios Básicos",
                SuggestedMerchant = "Luz del Sur"
            }
        };

        return new BankAdapterResult
        {
            BankName = "Banco de Crédito del Perú (BCP)",
            ProductName = "BCP Cuenta Sueldo Soles",
            Currency = Currency.PEN,
            InitialBalance = 2500.00m,
            FinalBalance = 2500.00m + 7500.00m - (385.50m + 142.80m),
            ExtractedRows = rows
        };
    }
}

public class BbvaBankAdapter : IBankAdapter
{
    public string BankCode => "BBVA";

    public bool CanProcess(string fileName, string rawContent)
    {
        return rawContent.Contains("BBVA", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("BBVA", StringComparison.OrdinalIgnoreCase);
    }

    public BankAdapterResult Process(string fileName, string rawContent)
    {
        var rows = new List<ImportRow>
        {
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-3),
                OriginalDescription = "TRANSF REXTIE VENTA DOLARES",
                NormalizedDescription = "Venta USD Rextie",
                Amount = 3755.00m,
                Currency = Currency.PEN,
                IsDebit = false,
                SuggestedCategory = "Cambio USD",
                SuggestedMerchant = "Rextie"
            }
        };

        return new BankAdapterResult
        {
            BankName = "BBVA Perú",
            ProductName = "BBVA Cuenta Ahorro Soles",
            Currency = Currency.PEN,
            InitialBalance = 1000.00m,
            FinalBalance = 4755.00m,
            ExtractedRows = rows
        };
    }
}

public class InterbankBankAdapter : IBankAdapter
{
    public string BankCode => "INTERBANK";

    public bool CanProcess(string fileName, string rawContent)
    {
        return rawContent.Contains("INTERBANK", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("INTERBANK", StringComparison.OrdinalIgnoreCase);
    }

    public BankAdapterResult Process(string fileName, string rawContent)
    {
        var rows = new List<ImportRow>
        {
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-6),
                OriginalDescription = "CARGO NETFLIX.COM",
                NormalizedDescription = "Netflix",
                Amount = 44.90m,
                Currency = Currency.PEN,
                IsDebit = true,
                SuggestedCategory = "Streaming",
                SuggestedMerchant = "Netflix"
            }
        };

        return new BankAdapterResult
        {
            BankName = "Interbank",
            ProductName = "Interbank Cuenta Simple",
            Currency = Currency.PEN,
            InitialBalance = 500.00m,
            FinalBalance = 455.10m,
            ExtractedRows = rows
        };
    }
}

public class FalabellaBankAdapter : IBankAdapter
{
    public string BankCode => "FALABELLA";

    public bool CanProcess(string fileName, string rawContent)
    {
        return rawContent.Contains("FALABELLA", StringComparison.OrdinalIgnoreCase) ||
               rawContent.Contains("CMR", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("FALABELLA", StringComparison.OrdinalIgnoreCase);
    }

    public BankAdapterResult Process(string fileName, string rawContent)
    {
        var rows = new List<ImportRow>
        {
            new ImportRow
            {
                Date = DateTime.UtcNow.AddDays(-1),
                OriginalDescription = "COMPRA SAGA FALABELLA JOCKEY",
                NormalizedDescription = "Saga Falabella",
                Amount = 289.00m,
                Currency = Currency.PEN,
                IsDebit = true,
                SuggestedCategory = "Ropa & Tiendas",
                SuggestedMerchant = "Saga Falabella"
            }
        };

        return new BankAdapterResult
        {
            BankName = "Banco Falabella",
            ProductName = "Tarjeta CMR Falabella",
            Currency = Currency.PEN,
            InitialBalance = 0.00m,
            FinalBalance = 289.00m,
            ExtractedRows = rows
        };
    }
}
