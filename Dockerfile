# Stage 1: Build React Frontend App
FROM node:20-alpine AS build-web
WORKDIR /web
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web/ ./
RUN npm run build

# Stage 2: Build C# Backend Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build-backend
WORKDIR /src

COPY ["apps/api/KipuFinanzas.Api.csproj", "apps/api/"]
COPY ["packages/shared-contracts/KipuFinanzas.SharedContracts.csproj", "packages/shared-contracts/"]

RUN dotnet restore "apps/api/KipuFinanzas.Api.csproj"

COPY . .
WORKDIR "/src/apps/api"
RUN dotnet build "KipuFinanzas.Api.csproj" -c Release -o /app/build
RUN dotnet publish "KipuFinanzas.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Unified Production Container serving React UI + C# API
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080;http://+:80
EXPOSE 8080
EXPOSE 80

COPY --from=build-backend /app/publish .
COPY --from=build-web /web/dist ./wwwroot

ENTRYPOINT ["dotnet", "KipuFinanzas.Api.dll"]
