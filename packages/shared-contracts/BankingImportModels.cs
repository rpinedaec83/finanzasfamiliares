namespace KipuFinanzas.SharedContracts;

public enum ImportStatus
{
    Uploaded,
    Processing,
    PreviewReady,
    RequiresReview,
    Confirmed,
    Failed
}

public class DocumentImport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string BankName { get; set; } = string.Empty; // BCP, BBVA, Interbank, Falabella
    public string ProductName { get; set; } = string.Empty;
    public Currency Currency { get; set; } = Currency.PEN;
    public string Period { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal FinalBalance { get; set; }
    public decimal CalculatedFinalBalance { get; set; }
    public bool IsMathematicallyBalanced { get; set; } = true;
    public ImportStatus Status { get; set; } = ImportStatus.PreviewReady;
    public string OriginalFileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<ImportRow> Rows { get; set; } = new();
}

public class ImportRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentImportId { get; set; }
    public DateTime Date { get; set; }
    public string OriginalDescription { get; set; } = string.Empty;
    public string NormalizedDescription { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Currency Currency { get; set; }
    public bool IsDebit { get; set; }
    public string SuggestedCategory { get; set; } = string.Empty;
    public string SuggestedMerchant { get; set; } = string.Empty;
    public string DeduplicationHash { get; set; } = string.Empty;
    public bool IsDuplicate { get; set; } = false;
    public double ConfidenceScore { get; set; } = 0.95;
    public bool IsConfirmed { get; set; } = true;
}

public class ReconciliationSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid AccountId { get; set; }
    public DateTime PeriodDate { get; set; }
    public decimal BookBalance { get; set; }
    public decimal StatementBalance { get; set; }
    public decimal Difference { get; set; }
    public string Status { get; set; } = "Balanced";
}

public class BankAdapterResult
{
    public string BankName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public Currency Currency { get; set; } = Currency.PEN;
    public decimal InitialBalance { get; set; }
    public decimal FinalBalance { get; set; }
    public List<ImportRow> ExtractedRows { get; set; } = new();
    public bool IsMathematicallyBalanced =>
        InitialBalance + ExtractedRows.Where(r => !r.IsDebit).Sum(r => r.Amount) - ExtractedRows.Where(r => r.IsDebit).Sum(r => r.Amount) == FinalBalance;
}
