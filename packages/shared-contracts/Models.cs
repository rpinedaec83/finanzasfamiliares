namespace KipuFinanzas.SharedContracts;

public enum TransactionType
{
    Income,
    Expense,
    Transfer,
    CardPayment,
    CurrencyExchange,
    Refund,
    InterestEarned,
    Fee
}

public enum TransactionStatus
{
    Pending,
    Confirmed,
    Reconciled,
    Duplicate,
    Ignored,
    RequiresReview
}

public enum AccountType
{
    Salary,
    Savings,
    Checking,
    CTS,
    Investment,
    CashPEN,
    CashUSD,
    DigitalWallet,
    Virtual
}

public enum Currency
{
    PEN,
    USD
}

public enum PrivacyLevel
{
    Family,
    Shared,
    Private
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Family
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public Currency BaseCurrency { get; set; } = Currency.PEN;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FamilyMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member"; // Admin, Member, ReadOnly
}

public class FinancialInstitution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty; // BCP, BBVA, Interbank, Banco Falabella
    public string Code { get; set; } = string.Empty;
    public string Country { get; set; } = "PE";
    public string LogoUrl { get; set; } = string.Empty;
}

public class CategoryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Expense"; // Expense, Income, Transfer
    public string Icon { get; set; } = "Folder";
    public string Color { get; set; } = "blue";
    public bool IsActive { get; set; } = true;
}

public class AiClassificationRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Pattern { get; set; } = string.Empty;
    public string NormalizedMerchant { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid OwnerUserId { get; set; }
    public Guid? InstitutionId { get; set; }
    public string BankName { get; set; } = string.Empty; // BCP, BBVA, Interbank, Banco Falabella, Scotiabank, BanBif, Pichincha, Efectivo
    public string Name { get; set; } = string.Empty;
    public string CciNumber { get; set; } = string.Empty; // Número de Cuenta o CCI (ej. 002-191-002849182012-52)
    public AccountType Type { get; set; }
    public Currency Currency { get; set; }
    public decimal BalanceAvailable { get; set; }
    public decimal BalanceBook { get; set; }
    public string LastFourDigits { get; set; } = string.Empty;
    public bool IsIncludedInNetWorth { get; set; } = true;
    public PrivacyLevel PrivacyLevel { get; set; } = PrivacyLevel.Family;
}

public class CreditCard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid OwnerUserId { get; set; }
    public Guid InstitutionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public Currency MainCurrency { get; set; } = Currency.PEN;
    public decimal CreditLimit { get; set; }
    public decimal AvailableLimit { get; set; }
    public int ClosingDay { get; set; }
    public int DueDay { get; set; }
}

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? CreditCardId { get; set; }
    public DateTime OperationDate { get; set; }
    public string DescriptionOriginal { get; set; } = string.Empty;
    public string DescriptionNormalized { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Currency Currency { get; set; }
    public decimal ConvertedAmount { get; set; }
    public decimal ExchangeRate { get; set; } = 1.0m;
    public TransactionType Type { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Confirmed;
    public string? Category { get; set; }
    public string? Merchant { get; set; }
    public string DeduplicationHash { get; set; } = string.Empty;
}

public class Transfer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid OriginAccountId { get; set; }
    public Guid DestinationAccountId { get; set; }
    public DateTime SendDate { get; set; }
    public decimal SentAmount { get; set; }
    public Currency SentCurrency { get; set; }
    public decimal ReceivedAmount { get; set; }
    public Currency ReceivedCurrency { get; set; }
    public decimal FeeAmount { get; set; } = 0m;
    public string Status { get; set; } = "Conciliated";
}

public class CurrencyExchangeOperation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid OriginAccountId { get; set; }
    public Guid DestinationAccountId { get; set; }
    public decimal DeliveredAmount { get; set; }
    public Currency DeliveredCurrency { get; set; }
    public decimal ReceivedAmount { get; set; }
    public Currency ReceivedCurrency { get; set; }
    public decimal EffectiveExchangeRate { get; set; }
    public decimal SunatReferenceRate { get; set; }
    public string Provider { get; set; } = string.Empty; // Rextie, Bank, Cambista
    public DateTime Date { get; set; } = DateTime.UtcNow;
}

public class Budget
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    public decimal ExecutedAmount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}

public class SavingsGoal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal SavedAmount { get; set; }
    public Currency Currency { get; set; } = Currency.PEN;
    public DateTime TargetDate { get; set; }
}

public class ExchangeRate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Date { get; set; }
    public decimal BuyRate { get; set; }
    public decimal SellRate { get; set; }
    public string Source { get; set; } = "SUNAT";
    public bool IsEstimated { get; set; } = false;
}
