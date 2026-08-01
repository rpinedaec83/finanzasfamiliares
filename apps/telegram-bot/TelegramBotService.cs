using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KipuFinanzas.TelegramBot;

public class TelegramBotService : BackgroundService
{
    private readonly ILogger<TelegramBotService> _logger;

    public TelegramBotService(ILogger<TelegramBotService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Kipu Finanzas Telegram Bot Engine iniciado con Token configurado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
