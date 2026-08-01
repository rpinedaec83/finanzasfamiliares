using System.Security.Cryptography;
using System.Text;
using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IDeduplicationEngine
{
    string GenerateHash(Guid familyId, Guid accountId, DateTime date, decimal amount, Currency currency, string description);
    void FlagDuplicates(List<ImportRow> rows, List<Transaction> existingTransactions, Guid familyId, Guid accountId);
}

public class DeduplicationEngine : IDeduplicationEngine
{
    public string GenerateHash(Guid familyId, Guid accountId, DateTime date, decimal amount, Currency currency, string description)
    {
        var rawKey = $"{familyId}:{accountId}:{date:yyyy-MM-dd}:{amount:F2}:{currency}:{description.Trim().ToUpperInvariant()}";
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawKey));
        return Convert.ToHexString(bytes);
    }

    public void FlagDuplicates(List<ImportRow> rows, List<Transaction> existingTransactions, Guid familyId, Guid accountId)
    {
        var existingHashes = existingTransactions
            .Select(t => t.DeduplicationHash)
            .Where(h => !string.IsNullOrEmpty(h))
            .ToHashSet();

        foreach (var row in rows)
        {
            row.DeduplicationHash = GenerateHash(familyId, accountId, row.Date, row.Amount, row.Currency, row.NormalizedDescription);

            // Regla de duplicados exactos por hash o discrepancia en ventana de 2 días
            if (existingHashes.Contains(row.DeduplicationHash))
            {
                row.IsDuplicate = true;
                row.IsConfirmed = false;
            }
            else
            {
                var potentialDuplicate = existingTransactions.FirstOrDefault(t =>
                    Math.Abs((t.OperationDate - row.Date).TotalDays) <= 2 &&
                    t.Amount == row.Amount &&
                    t.Currency == row.Currency &&
                    t.DescriptionNormalized.Equals(row.NormalizedDescription, StringComparison.OrdinalIgnoreCase));

                if (potentialDuplicate != null)
                {
                    row.IsDuplicate = true;
                    row.IsConfirmed = false;
                    row.ConfidenceScore = 0.60;
                }
            }
        }
    }
}
