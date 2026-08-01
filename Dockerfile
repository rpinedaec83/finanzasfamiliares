# Root Dockerfile fallback for Dokploy single Dockerfile build mode

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build-backend
WORKDIR /src

COPY ["apps/api/KipuFinanzas.Api.csproj", "apps/api/"]
COPY ["packages/shared-contracts/KipuFinanzas.SharedContracts.csproj", "packages/shared-contracts/"]

RUN dotnet restore "apps/api/KipuFinanzas.Api.csproj"

COPY . .
WORKDIR "/src/apps/api"
RUN dotnet build "KipuFinanzas.Api.csproj" -c Release -o /app/build
RUN dotnet publish "KipuFinanzas.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build-backend /app/publish .
ENTRYPOINT ["dotnet", "KipuFinanzas.Api.dll"]
