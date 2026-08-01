using KipuFinanzas.Api.Data;
using KipuFinanzas.Api.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configuración de Entity Framework Core con PostgreSQL
var connectionString = builder.Configuration["POSTGRES_CONNECTION_STRING"] ?? "Host=localhost;Database=kipufinanzas;Username=postgres;Password=KipuFinanzasSecurePass123!";
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
        policy.WithOrigins("http://localhost:3000", "https://finanzas.x-codec.net")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Aplicar migraciones / crear tablas en PostgreSQL al iniciar
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KipuDbContext>();
    db.Database.EnsureCreated();
    app.Logger.LogInformation("[DB] PostgreSQL conectado y esquema verificado.");
}
catch (Exception ex)
{
    app.Logger.LogWarning("[DB] No se pudo conectar a PostgreSQL: {Msg}. Funcionando en modo in-memory.", ex.Message);
}

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => new { app = "Kipu Finanzas API", status = "Healthy", version = "1.0.0" });
app.MapFallbackToFile("index.html");

app.Run();
