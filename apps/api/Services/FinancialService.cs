using KipuFinanzas.SharedContracts;

namespace KipuFinanzas.Api.Services;

public interface IFinancialService
{
    CurrencyExchangeOperation ExecuteCurrencyExchange(
        Guid familyId,
        Account originAccount,
        Account destinationAccount,
        decimal deliveredAmount,
        Currency deliveredCurrency,
        decimal receivedAmount,
        Currency receivedCurrency,
        decimal sunatRate,
        string provider);

    Transfer ExecuteOwnAccountTransfer(
        Guid familyId,
        Account originAccount,
        Account destinationAccount,
        decimal amount,
        decimal feeAmount);

    Transaction ExecuteCreditCardPayment(
        Guid familyId,
        Account bankAccount,
        CreditCard creditCard,
        decimal paymentAmount);
}

public class FinancialService : IFinancialService
{
    public CurrencyExchangeOperation ExecuteCurrencyExchange(
        Guid familyId,
        Account originAccount,
        Account destinationAccount,
        decimal deliveredAmount,
        Currency deliveredCurrency,
        decimal receivedAmount,
        Currency receivedCurrency,
        decimal sunatRate,
        string provider)
    {
        // Regla no negociable: Compra o Venta de Dólares NO es un gasto ni ingreso de capital.
        // Calcular Tipo de Cambio Efectivo Real
        decimal effectiveRate;
        if (deliveredCurrency == Currency.USD && receivedCurrency == Currency.PEN)
        {
            // Venta de Dólares: PEN recibidos / USD entregados
            effectiveRate = Math.Round(receivedAmount / deliveredAmount, 4);
        }
        else
        {
            // Compra de Dólares: PEN entregados / USD recibidos
            effectiveRate = Math.Round(deliveredAmount / receivedAmount, 4);
        }

        // Actualizar Saldos de Cuentas
        originAccount.BalanceAvailable -= deliveredAmount;
        originAccount.BalanceBook -= deliveredAmount;

        destinationAccount.BalanceAvailable += receivedAmount;
        destinationAccount.BalanceBook += receivedAmount;

        var operation = new CurrencyExchangeOperation
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            OriginAccountId = originAccount.Id,
            DestinationAccountId = destinationAccount.Id,
            DeliveredAmount = deliveredAmount,
            DeliveredCurrency = deliveredCurrency,
            ReceivedAmount = receivedAmount,
            ReceivedCurrency = receivedCurrency,
            EffectiveExchangeRate = effectiveRate,
            SunatReferenceRate = sunatRate,
            Provider = provider,
            Date = DateTime.UtcNow
        };

        return operation;
    }

    public Transfer ExecuteOwnAccountTransfer(
        Guid familyId,
        Account originAccount,
        Account destinationAccount,
        decimal amount,
        decimal feeAmount)
    {
        // Regla no negociable: Transferencias entre cuentas propias NO afectan presupuesto ni son gastos.
        // Únicamente las comisiones cobradas constituyen un gasto.
        originAccount.BalanceAvailable -= (amount + feeAmount);
        originAccount.BalanceBook -= (amount + feeAmount);

        destinationAccount.BalanceAvailable += amount;
        destinationAccount.BalanceBook += amount;

        var transfer = new Transfer
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            OriginAccountId = originAccount.Id,
            DestinationAccountId = destinationAccount.Id,
            SendDate = DateTime.UtcNow,
            SentAmount = amount,
            SentCurrency = originAccount.Currency,
            ReceivedAmount = amount,
            ReceivedCurrency = destinationAccount.Currency,
            FeeAmount = feeAmount,
            Status = "Conciliated"
        };

        return transfer;
    }

    public Transaction ExecuteCreditCardPayment(
        Guid familyId,
        Account bankAccount,
        CreditCard creditCard,
        decimal paymentAmount)
    {
        // Regla no negociable: El pago de la tarjeta desde la cuenta bancaria es un pago de pasivo/transferencia, NO un gasto adicional.
        bankAccount.BalanceAvailable -= paymentAmount;
        bankAccount.BalanceBook -= paymentAmount;

        creditCard.AvailableLimit += paymentAmount;
        if (creditCard.AvailableLimit > creditCard.CreditLimit)
        {
            creditCard.AvailableLimit = creditCard.CreditLimit;
        }

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            AccountId = bankAccount.Id,
            CreditCardId = creditCard.Id,
            OperationDate = DateTime.UtcNow,
            DescriptionOriginal = $"PAGO TARJETA DE CRÉDITO {creditCard.Name}",
            DescriptionNormalized = $"Pago Tarjeta {creditCard.Name}",
            Amount = paymentAmount,
            Currency = bankAccount.Currency,
            Type = TransactionType.CardPayment,
            Status = TransactionStatus.Confirmed,
            Category = "Pago de Tarjeta"
        };

        return transaction;
    }
}
