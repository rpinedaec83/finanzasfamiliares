using KipuFinanzas.Api.Data;
using KipuFinanzas.Api.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Cargar variables del archivo .env si existe (desarrollo local sin Docker)
var envFile = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#')) continue;
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
    }
}

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// Configuración de Entity Framework Core con PostgreSQL
var connectionString = 
    Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING") ??
    builder.Configuration["POSTGRES_CONNECTION_STRING"] ??
    "Host=localhost;Database=kipufinanzas;Username=postgres;Password=KipuFinanzasSecurePass123!";

// Si estamos corriendo localmente fuera de Docker, pero la connection string apunta a 'Host=postgres',
// la cambiamos a 'Host=localhost' para poder conectar al puerto expuesto de Docker.
var isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
if (!isDocker && connectionString.Contains("Host=postgres"))
{
    connectionString = connectionString.Replace("Host=postgres", "Host=localhost");
}

// Convertir formato de URI postgresql:// (usado por Dokploy/Railway/Heroku) al formato compatible con EF Core
if (connectionString.StartsWith("postgresql://") || connectionString.StartsWith("postgres://"))
{
    try
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        // Construir string compatible con Npgsql
        connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};Include Error Detail=true;";
    }
    catch (Exception ex)
    {
        Log.Warning("[DB] Error al parsear URI de conexión Postgres: {Msg}", ex.Message);
    }
}

Log.Information("[DB] Conectando a: {CS}", connectionString.Split(';')[0]); // Solo muestra el Host

builder.Services.AddDbContext<KipuFinanzas.Api.Data.KipuDbContext>(options =>
    options.UseNpgsql(connectionString));

// Servicios de Dominio Financiero & Seguridad
builder.Services.AddSingleton<IAuthService>(new AuthService("SuperSecretKeyKipuFinanzasMin64CharsLengthMustBeRandomAndSecure123456!"));
builder.Services.AddScoped<IFinancialService, FinancialService>();
builder.Services.AddScoped<ISunatExchangeRateService, SunatExchangeRateService>();
builder.Services.AddScoped<IDeduplicationEngine, DeduplicationEngine>();
builder.Services.AddScoped<IAlertEngineService, AlertEngineService>();
builder.Services.AddScoped<IEmailIngestionService, EmailIngestionService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IOpenAiService>(sp => new OpenAiService(
    builder.Configuration["OPENAI_API_KEY"] ?? "sk-proj-YOUR_KEY",
    builder.Configuration["OPENAI_MODEL"] ?? "gpt-4o"
));

// Adaptadores Bancarios (BCP, BBVA, Interbank, Falabella)
builder.Services.AddScoped<KipuFinanzas.Api.Services.BankAdapters.IBankAdapter, KipuFinanzas.Api.Services.BankAdapters.BcpBankAdapter>();
builder.Services.AddScoped<KipuFinanzas.Api.Services.BankAdapters.IBankAdapter, KipuFinanzas.Api.Services.BankAdapters.BbvaBankAdapter>();
builder.Services.AddScoped<KipuFinanzas.Api.Services.BankAdapters.IBankAdapter, KipuFinanzas.Api.Services.BankAdapters.InterbankBankAdapter>();
builder.Services.AddScoped<KipuFinanzas.Api.Services.BankAdapters.IBankAdapter, KipuFinanzas.Api.Services.BankAdapters.FalabellaBankAdapter>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://finanzas.x-codec.org")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Sincronización automática del esquema de la BD al arrancar
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KipuDbContext>();
    
    // Intenta crear la base de datos y todo el esquema de tablas si no existe
    await db.Database.EnsureCreatedAsync();
    
    app.Logger.LogInformation("[DB] PostgreSQL conectado y esquema sincronizado.");
}
catch (Exception ex)
{
    app.Logger.LogWarning("[DB] No se pudo conectar a PostgreSQL: {Msg}. Funcionando en modo in-memory.", ex.Message);
}

app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => new { app = "Kipu Finanzas API", status = "Healthy", version = "1.0.0" });

app.MapGet("/api/health/db", async (IServiceProvider sp) =>
{
    try
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<KipuDbContext>();
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
        {
            return Results.Ok(new { connected = true, provider = "PostgreSQL", status = "Online", message = "Base de datos conectada correctamente." });
        }

        // Intento de auto-creación si el servidor está online pero la BD no existe
        await db.Database.EnsureCreatedAsync();
        
        canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
        {
            return Results.Ok(new { connected = true, provider = "PostgreSQL", status = "Online", message = "Base de datos creada e inicializada correctamente." });
        }

        return Results.Ok(new { connected = false, provider = "PostgreSQL", status = "Offline", message = "No se pudo conectar a la base de datos." });
    }
    catch (Exception ex)
    {
        var msg = ex.Message;
        if (ex.InnerException != null)
        {
            msg += " -> " + ex.InnerException.Message;
        }
        return Results.Ok(new { connected = false, provider = "PostgreSQL", status = "Error", message = msg });
    }
});

app.MapFallbackToFile("index.html");

app.Run();
