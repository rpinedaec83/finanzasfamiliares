namespace KipuFinanzas.TelegramBot;

public class TelegramBotEngine
{
    public static string ProcessCommand(string commandText)
    {
        var cmd = commandText.Trim().ToLowerInvariant();
        if (cmd.StartsWith("/saldo"))
        {
            return "💰 *Resumen de Saldos Kipu Finanzas*\n\n" +
                   "• BCP Cuenta Sueldo: S/ 4,520.50\n" +
                   "• BBVA Ahorro USD: $ 12,450.00\n" +
                   "• Efectivo Soles: S/ 350.00\n\n" +
                   "*Patrimonio Neto:* S/ 84,520.00 | $ 12,450.00 USD";
        }
        if (cmd.StartsWith("/gastos"))
        {
            return "📊 *Gastos del Mes (Agosto 2026)*\n\n" +
                   "• Supermercado: S/ 1,200.00\n" +
                   "• Combustible: S/ 270.00\n" +
                   "• Tecnología: S/ 350.00\n" +
                   "• Streaming: S/ 89.80\n\n" +
                   "*Total Gastado:* S/ 6,840.00";
        }
        if (cmd.StartsWith("/presupuesto"))
        {
            return "🎯 *Estado de Presupuestos*\n\n" +
                   "• Supermercado: 80% (S/ 1,200 / S/ 1,500)\n" +
                   "• Combustible: 45% (S/ 270 / S/ 600)\n" +
                   "• Tecnología: 43% (S/ 350 / S/ 800)\n\n" +
                   "⚠️ *Alerta:* Supermercado próximo al límite.";
        }
        if (cmd.StartsWith("/pagos"))
        {
            return "📅 *Próximos Vencimientos*\n\n" +
                   "• Tarjeta BCP Signature: 10/08/2026 (S/ 1,840.00)\n" +
                   "• Luz del Sur: 12/08/2026 (S/ 142.80)\n" +
                   "• Depósito BCP Vence: 15/08/2026";
        }
        if (cmd.StartsWith("/tarjetas"))
        {
            return "💳 *Tarjetas de Crédito*\n\n" +
                   "• BCP Signature: Disponible S/ 11,200 / Línea S/ 15,000 (Corte: 20)\n" +
                   "• Interbank Black: Disponible $ 4,250 / Línea $ 5,000 (Corte: 15)";
        }
        if (cmd.StartsWith("/metas"))
        {
            return "🏆 *Metas de Ahorro*\n\n" +
                   "• Lente Sony 24-70mm: 61% (S/ 4,300 / S/ 7,000)\n" +
                   "• Fondo Emergencia USD: 85% ($ 8,500 / $ 10,000)";
        }

        return "🤖 *Bot Kipu Finanzas*\n\n" +
               "Comandos disponibles:\n" +
               "/saldo - Consulta saldos por cuenta\n" +
               "/gastos - Gastos acumulados por categoría\n" +
               "/presupuesto - Avance de presupuestos\n" +
               "/pagos - Próximos vencimientos\n" +
               "/tarjetas - Líneas y cortes de tarjetas\n" +
               "/metas - Avance de metas de ahorro\n\n" +
               "📷 *Tip:* Puedes enviar una foto de un recibo para procesar con OCR.";
    }
}
