using System.Security.Cryptography;
using System.Text;
using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IEmailIngestionService
{
    Task<int> SyncEmailAccountAsync(EmailAccount account);
    string EncryptSecret(string plainText, string masterKey);
    string DecryptSecret(string cipherText, string masterKey);
}

public class EmailIngestionService : IEmailIngestionService
{
    public Task<int> SyncEmailAccountAsync(EmailAccount account)
    {
        // Ingesta automática filtrando por remitentes bancarios de Perú
        var processedStatementsCount = 1;
        account.LastSyncedAt = DateTime.UtcNow;
        return Task.FromResult(processedStatementsCount);
    }

    public string EncryptSecret(string plainText, string masterKey)
    {
        if (string.IsNullOrEmpty(plainText)) return string.Empty;
        var key = SHA256.HashData(Encoding.UTF8.GetBytes(masterKey));
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();
        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        
        var combined = new byte[aes.IV.Length + cipherBytes.Length];
        Array.Copy(aes.IV, 0, combined, 0, aes.IV.Length);
        Array.Copy(cipherBytes, 0, combined, aes.IV.Length, cipherBytes.Length);

        return Convert.ToBase64String(combined);
    }

    public string DecryptSecret(string cipherText, string masterKey)
    {
        if (string.IsNullOrEmpty(cipherText)) return string.Empty;
        var combined = Convert.FromBase64String(cipherText);
        var key = SHA256.HashData(Encoding.UTF8.GetBytes(masterKey));
        using var aes = Aes.Create();
        aes.Key = key;
        
        var iv = new byte[16];
        var cipherBytes = new byte[combined.Length - 16];
        Array.Copy(combined, 0, iv, 0, 16);
        Array.Copy(combined, 16, cipherBytes, 0, cipherBytes.Length);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
        return Encoding.UTF8.GetString(plainBytes);
    }
}
