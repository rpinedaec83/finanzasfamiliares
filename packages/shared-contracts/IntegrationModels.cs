namespace KipuFinanzas.SharedContracts;

public enum IntegrationProvider
{
    Gmail,
    Outlook,
    CustomImap,
    GoogleDrive,
    OneDrive,
    Telegram,
    GoogleCalendar,
    MicrosoftCalendar
}

public class IntegrationToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public IntegrationProvider Provider { get; set; }
    public string EncryptedAccessToken { get; set; } = string.Empty;
    public string EncryptedRefreshToken { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public bool IsConnected { get; set; } = true;
}

public class EmailAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public string EmailAddress { get; set; } = string.Empty;
    public IntegrationProvider Provider { get; set; } = IntegrationProvider.CustomImap;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 993;
    public bool UseTls { get; set; } = true;
    public string EncryptedPassword { get; set; } = string.Empty;
    public DateTime? LastSyncedAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class TelegramLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public long TelegramChatId { get; set; }
    public string TelegramUsername { get; set; } = string.Empty;
    public string BindingCode { get; set; } = string.Empty;
    public DateTime BindingExpiresAt { get; set; }
    public bool IsBound { get; set; } = false;
}

public class CalendarLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public IntegrationProvider Provider { get; set; }
    public string CalendarId { get; set; } = "primary";
    public bool SyncPaymentDueDates { get; set; } = true;
    public bool SyncDepositMaturities { get; set; } = true;
}
