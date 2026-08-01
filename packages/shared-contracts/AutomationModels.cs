namespace KipuFinanzas.SharedContracts;

public enum AlertSeverity
{
    Info,
    Warning,
    Critical
}

public enum RecurringFrequency
{
    Weekly,
    BiWeekly,
    Monthly,
    Quarterly,
    Annual
}

public class RecurringTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal ExpectedAmount { get; set; }
    public Currency Currency { get; set; } = Currency.PEN;
    public RecurringFrequency Frequency { get; set; } = RecurringFrequency.Monthly;
    public int ExpectedDayOfMonth { get; set; } = 28;
    public Guid SourceAccountId { get; set; }
    public string Category { get; set; } = string.Empty;
    public int ToleranceDays { get; set; } = 3;
    public DateTime? LastProcessedDate { get; set; }
    public bool IsIncome { get; set; } = false;
}

public class FixedTermDeposit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public decimal InitialPrincipal { get; set; }
    public Currency Currency { get; set; } = Currency.PEN;
    public decimal AnnualRate { get; set; }
    public DateTime OpeningDate { get; set; }
    public DateTime MaturityDate { get; set; }
    public Guid? DestinationAccountId { get; set; }
    
    // Regla no negociable: Ingreso manual de intereses esperados y cobrados (sin cálculo contractual automático)
    public decimal? ExpectedInterestManual { get; set; }
    public decimal? ReceivedInterestManual { get; set; }
    public string Status { get; set; } = "Active"; // Active, Matured, Settled
}

public class FinancialAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; } = AlertSeverity.Info;
    public string Category { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? TargetDate { get; set; }
    public bool IsRead { get; set; } = false;
}
