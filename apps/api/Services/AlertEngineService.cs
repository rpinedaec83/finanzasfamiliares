using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IAlertEngineService
{
    List<FinancialAlert> EvaluateAlerts(
        Guid familyId,
        List<Budget> budgets,
        List<CreditCard> cards,
        List<FixedTermDeposit> deposits,
        List<RecurringTransaction> recurringIncomes);
}

public class AlertEngineService : IAlertEngineService
{
    public List<FinancialAlert> EvaluateAlerts(
        Guid familyId,
        List<Budget> budgets,
        List<CreditCard> cards,
        List<FixedTermDeposit> deposits,
        List<RecurringTransaction> recurringIncomes)
    {
        var alerts = new List<FinancialAlert>();
        var now = DateTime.UtcNow;

        // 1. Evaluación de Alertas de Presupuesto (80%, 100%, Excedido)
        foreach (var b in budgets)
        {
            var pct = b.LimitAmount > 0 ? (b.ExecutedAmount / b.LimitAmount) * 100 : 0;
            if (pct >= 100)
            {
                alerts.Add(new FinancialAlert
                {
                    FamilyId = familyId,
                    Title = $"Presupuesto Excedido: {b.CategoryName}",
                    Message = $"Se ha superado el presupuesto de {b.CategoryName}. Ejecutado: S/ {b.ExecutedAmount:F2} de S/ {b.LimitAmount:F2} ({pct:F0}%).",
                    Severity = AlertSeverity.Critical,
                    Category = "Presupuesto"
                });
            }
            else if (pct >= 80)
            {
                alerts.Add(new FinancialAlert
                {
                    FamilyId = familyId,
                    Title = $"Alerta de Presupuesto Al 80%: {b.CategoryName}",
                    Message = $"El presupuesto de {b.CategoryName} ha alcanzado el {pct:F0}%. Quedan S/ {(b.LimitAmount - b.ExecutedAmount):F2} disponibles.",
                    Severity = AlertSeverity.Warning,
                    Category = "Presupuesto"
                });
            }
        }

        // 2. Alertas de Uso de Tarjeta de Crédito (>70% de la línea utilizada)
        foreach (var c in cards)
        {
            var usedLimit = c.CreditLimit - c.AvailableLimit;
            var pctUsed = c.CreditLimit > 0 ? (usedLimit / c.CreditLimit) * 100 : 0;
            if (pctUsed >= 70)
            {
                alerts.Add(new FinancialAlert
                {
                    FamilyId = familyId,
                    Title = $"Uso Elevado de Tarjeta: {c.Name}",
                    Message = $"La tarjeta {c.Name} tiene un {pctUsed:F0}% de la línea de crédito utilizada. Saldo ocupado: S/ {usedLimit:F2}.",
                    Severity = AlertSeverity.Warning,
                    Category = "Tarjeta"
                });
            }
        }

        // 3. Vencimientos de Depósitos a Plazo Fijo
        foreach (var d in deposits)
        {
            var daysToMaturity = (d.MaturityDate - now).TotalDays;
            if (daysToMaturity >= 0 && daysToMaturity <= 7)
            {
                alerts.Add(new FinancialAlert
                {
                    FamilyId = familyId,
                    Title = $"Vencimiento Próximo: Depósito a Plazo {d.BankName}",
                    Message = $"El depósito a plazo de {d.Currency} {d.InitialPrincipal:N2} en {d.BankName} vence en {Math.Ceiling(daysToMaturity)} días ({d.MaturityDate:dd/MM/yyyy}).",
                    Severity = AlertSeverity.Info,
                    Category = "Depósito a Plazo",
                    TargetDate = d.MaturityDate
                });
            }
        }

        // 4. Detección de Ingresos Esperados Faltantes
        foreach (var inc in recurringIncomes.Where(i => i.IsIncome))
        {
            var expectedDate = new DateTime(now.Year, now.Month, Math.Min(inc.ExpectedDayOfMonth, DateTime.DaysInMonth(now.Year, now.Month)));
            if (now > expectedDate.AddDays(inc.ToleranceDays) && (inc.LastProcessedDate == null || inc.LastProcessedDate < expectedDate))
            {
                alerts.Add(new FinancialAlert
                {
                    FamilyId = familyId,
                    Title = $"Ingreso Esperado No Recibido: {inc.Description}",
                    Message = $"No se ha detectado el ingreso esperado de {inc.Currency} {inc.ExpectedAmount:N2} correspondiente a {inc.Description} (Fecha esperada: {expectedDate:dd/MM/yyyy}).",
                    Severity = AlertSeverity.Critical,
                    Category = "Ingresos"
                });
            }
        }

        return alerts;
    }
}
