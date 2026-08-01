namespace KipuFinanzas.SharedContracts;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // LOGIN, CREATE_TRANSACTION, CURRENCY_EXCHANGE, IMPORT_STATEMENT
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = "127.0.0.1";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Details { get; set; } = string.Empty;
}
