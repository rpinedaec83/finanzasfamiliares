namespace KipuFinanzas.SharedContracts;

public class AiMessage
{
    public string Role { get; set; } = "user"; // user, assistant, system
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class AiChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<AiMessage> History { get; set; } = new();
}

public class AiChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public string Disclaimer { get; set; } = "Aviso: Las sugerencias del asistente son de carácter estrictamente analítico e informativo. No constituyen asesoría financiera o profesional.";
    public List<string> FunctionCallsExecuted { get; set; } = new();
}

public class MerchantClassification
{
    public string RawDescription { get; set; } = string.Empty;
    public string NormalizedMerchant { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Confidence { get; set; } = 0.95;
}

public class AnomalyReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ImpactAmount { get; set; }
    public string Type { get; set; } = "UnusualExpense"; // UnusualExpense, SubscriptionPriceIncrease, DuplicateSuspect
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}
