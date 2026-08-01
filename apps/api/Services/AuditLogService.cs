using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IAuditLogService
{
    void LogActivity(Guid familyId, Guid userId, string email, string action, string entityName, string entityId, string details);
    List<AuditLog> GetLogs(Guid familyId);
}

public class AuditLogService : IAuditLogService
{
    private static readonly List<AuditLog> SampleAuditLogs = new()
    {
        new AuditLog
        {
            Id = Guid.NewGuid(),
            UserEmail = "rpineda@x-codec.org",
            Action = "LOGIN",
            EntityName = "User",
            EntityId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            Details = "Inicio de sesión exitoso con JWT.",
            Timestamp = DateTime.UtcNow.AddMinutes(-45)
        },
        new AuditLog
        {
            Id = Guid.NewGuid(),
            UserEmail = "rpineda@x-codec.org",
            Action = "CURRENCY_EXCHANGE",
            EntityName = "CurrencyExchangeOperation",
            EntityId = Guid.NewGuid().ToString(),
            Details = "Venta de $1,000 USD a TC efectivo S/ 3.755 (Rextie).",
            Timestamp = DateTime.UtcNow.AddMinutes(-30)
        },
        new AuditLog
        {
            Id = Guid.NewGuid(),
            UserEmail = "rpineda@x-codec.org",
            Action = "BANK_IMPORT",
            EntityName = "DocumentImport",
            EntityId = Guid.NewGuid().ToString(),
            Details = "Importación de PDF BCP Soles con cuadre de saldos 100%.",
            Timestamp = DateTime.UtcNow.AddMinutes(-10)
        }
    };

    public void LogActivity(Guid familyId, Guid userId, string email, string action, string entityName, string entityId, string details)
    {
        SampleAuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            UserId = userId,
            UserEmail = email,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            Timestamp = DateTime.UtcNow
        });
    }

    public List<AuditLog> GetLogs(Guid familyId)
    {
        return SampleAuditLogs;
    }
}
