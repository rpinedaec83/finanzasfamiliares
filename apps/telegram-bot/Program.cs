using KipuFinanzas.TelegramBot;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<TelegramBotService>();

var host = builder.Build();
host.Run();
