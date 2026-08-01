using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KipuFinanzas.Worker;

public class WorkerService : BackgroundService
{
    private readonly ILogger<WorkerService> _logger;

    public WorkerService(ILogger<WorkerService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Kipu Finanzas Worker Service iniciado en {Time}", DateTimeOffset.Now);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Ejecutando tareas en segundo plano (OCR, Ingesta Mail, Sync SUNAT)...");
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
