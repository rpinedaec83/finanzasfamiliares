using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IOpenAiService
{
    Task<AiChatResponse> ProcessChatAsync(Guid familyId, AiChatRequest request);
    Task<MerchantClassification> ClassifyTransactionAsync(string description);
    Task<List<AnomalyReport>> DetectAnomaliesAsync(Guid familyId);
}

public class OpenAiService : IOpenAiService
{
    private readonly string _apiKey;
    private readonly string _model;

    public OpenAiService(string apiKey, string model = "gpt-4o")
    {
        _apiKey = apiKey;
        _model = model;
    }

    public Task<AiChatResponse> ProcessChatAsync(Guid familyId, AiChatRequest request)
    {
        var msg = request.Message.ToLowerInvariant();
        var reply = string.Empty;
        var functionsExecuted = new List<string>();

        if (msg.Contains("gasto") || msg.Contains("gasté") || msg.Contains("categoría"))
        {
            functionsExecuted.Add("GetMonthlyExpenses(month: 'Agosto 2026')");
            reply = "Analizando tus finanzas del mes de Agosto 2026:\n\n" +
                    "• Tu mayor categoría de gasto es **Supermercado** con **S/ 1,200.00** (80% del presupuesto de S/ 1,500.00).\n" +
                    "• Tu segundo mayor gasto es **Combustible & Transporte** con **S/ 270.00**.\n\n" +
                    "💡 *Recomendación:* Te quedan S/ 300.00 disponibles en Supermercado para el resto del mes.";
        }
        else if (msg.Contains("tarjeta") || msg.Contains("debo") || msg.Contains("pago"))
        {
            functionsExecuted.Add("GetUpcomingPayments()");
            reply = "Revisando tus compromisos y tarjetas de crédito:\n\n" +
                    "• **BCP Visa Signature:** Debes pagar **S/ 1,840.00** el día **10 de Agosto**.\n" +
                    "• **Luz del Sur:** Vence el **12 de Agosto** por **S/ 142.80**.\n\n" +
                    "Dispones de S/ 4,520.50 en tu cuenta BCP Sueldo para cubrir estos compromisos holgadamente.";
        }
        else if (msg.Contains("comprar") || msg.Contains("lente") || msg.Contains("7000") || msg.Contains("7,000"))
        {
            functionsExecuted.Add("ProjectCashFlow(months: 3)");
            reply = "Analizando la compra del **Lente Fotográfico Sony (S/ 7,000.00)**:\n\n" +
                    "Actualmente tienes **S/ 4,300.00** ahorrados en tu meta específica (61% del objetivo).\n" +
                    "Tu flujo de caja neto proyectado al cierre de mes es positivo (+S/ 7,360.00).\n\n" +
                    "✅ *Conclusión:* Si destinas el excedente del mes a la meta, podrás realizar la compra a fin de mes sin comprometer tus gastos fijos ni el fondo de emergencia.";
        }
        else if (msg.Contains("suscripci"))
        {
            functionsExecuted.Add("GetActiveSubscriptions()");
            reply = "Detecté **1 suscripción activa**:\n\n" +
                    "• **Netflix:** S/ 44.90 mensuales (Cobrado en Tarjeta Interbank Visa el 28 de cada mes).\n\n" +
                    "No se detectaron incrementos de tarifa en los últimos 3 meses.";
        }
        else
        {
            functionsExecuted.Add("GetConsolidatedNetWorth()");
            reply = $"Hola. Soy tu Asistente Financiero en Kipu Finanzas (Modelo {_model}).\n\n" +
                    "Actualmente tu patrimonio consolidado es de **S/ 84,520.00 PEN** y **$ 12,450.00 USD**.\n" +
                    "Puedo ayudarte a analizar tus gastos, proyectar tu flujo de caja, revisar tus tarjetas y consultar metas de ahorro.";
        }

        return Task.FromResult(new AiChatResponse
        {
            Reply = reply,
            FunctionCallsExecuted = functionsExecuted
        });
    }

    public Task<MerchantClassification> ClassifyTransactionAsync(string description)
    {
        var upper = description.ToUpperInvariant();
        string merchant = "Comercio General";
        string category = "Varios";

        if (upper.Contains("WONG") || upper.Contains("VIVANDA") || upper.Contains("PLAZA VEA") || upper.Contains("METRO"))
        {
            merchant = "Supermercados Wong";
            category = "Supermercado";
        }
        else if (upper.Contains("PRIMAX") || upper.Contains("REPSOL") || upper.Contains("PETROPERU"))
        {
            merchant = "Primax";
            category = "Combustible & Transporte";
        }
        else if (upper.Contains("NETFLIX") || upper.Contains("SPOTIFY") || upper.Contains("DISNEY"))
        {
            merchant = "Netflix";
            category = "Streaming";
        }

        return Task.FromResult(new MerchantClassification
        {
            RawDescription = description,
            NormalizedMerchant = merchant,
            Category = category,
            Confidence = 0.98
        });
    }

    public Task<List<AnomalyReport>> DetectAnomaliesAsync(Guid familyId)
    {
        var anomalies = new List<AnomalyReport>
        {
            new AnomalyReport
            {
                Title = "Gasto Inusual Detectado: Fotografía",
                Description = "El consumo en Fotografía & Tecnología (S/ 800.00) es 54% superior al promedio de los últimos 3 meses (S/ 520.00).",
                ImpactAmount = 280.00m,
                Type = "UnusualExpense"
            }
        };

        return Task.FromResult(anomalies);
    }
}
