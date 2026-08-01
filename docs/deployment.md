# Kipu Finanzas - Documento de Despliegue e Infraestructura Dokploy

## 1. Visión General de Infraestructura

El despliegue de **Kipu Finanzas** está completamente contenedorizado utilizando **Docker** y administrado a través de **Dokploy** como plataforma de orquestación PaaS, ubicado detrás de **Traefik Proxy** para terminación SSL automática y enrutamiento seguro.

---

## 2. Definición de Servicios y Contenedores

La arquitectura de infraestructura consta de los siguientes contenedores interconectados en una red privada de Docker (`kipu-network`):

1. **`frontend` (`apps/web`):** Servidor Nginx liviano que sirve los archivos estáticos optimizados de React + Vite.
2. **`api` (`apps/api`):** Backend ASP.NET Core .NET 10 Web API.
3. **`worker` (`apps/worker`):** Servicio de procesamiento asíncrono en C#.
4. **`telegram-bot` (`apps/telegram-bot`):** Servicio de bot de Telegram.
5. **`postgres`:** Base de datos PostgreSQL 16 con volumen persistente.
6. **`redis`:** Servidor Redis 7 con almacenamiento AOF para sesiones y colas.
7. **`minio`:** Almacenamiento S3 de archivos e imágenes.
8. **`prometheus` & `grafana` (Opcionales):** Métricas y observabilidad del sistema.

---

## 3. Configuración de Subdominios y Labels en Traefik

Traefik gestiona el tráfico entrante hacia la red de Dokploy. Ninguna base de datos ni servicio de almacenamiento (PostgreSQL, Redis, MinIO) expone sus puertos públicamente a internet.

| Servicio | Subdominio Sugerido | Enrutamiento Traefik | Puerto Interno |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | `finanzas.x-codec.net` | `Host(\`finanzas.x-codec.net\`)` | 80 |
| **Backend REST API** | `api-finanzas.x-codec.net` | `Host(\`api-finanzas.x-codec.net\`)` | 8080 |
| **Consola MinIO** | `minio-finanzas.x-codec.net` | `Host(\`minio-finanzas.x-codec.net\`)` | 9001 |
| **Dashboard Grafana** | `grafana-finanzas.x-codec.net` | `Host(\`grafana-finanzas.x-codec.net\`)` | 3000 |

### Ejemplo de Labels de Traefik para `api` en `docker-compose.production.yml`
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.kipu-api.rule=Host(`api-finanzas.x-codec.net`)"
  - "traefik.http.routers.kipu-api.entrypoints=websecure"
  - "traefik.http.routers.kipu-api.tls.certresolver=letsencrypt"
  - "traefik.http.services.kipu-api.loadbalancer.server.port=8080"
```

---

## 4. Estrategia de Migraciones de Base de Datos

Las migraciones de Entity Framework Core se aplican durante el arranque del contenedor `api` o mediante una tarea previa (init-container) ejecutable:

```bash
dotnet ef database update --project database/migrations
```

---

## 5. Estrategia de Respaldos (Backups) y Restauración

### 5.1 Respaldos de PostgreSQL (`pg_dump`)
* Script ejecutado diariamente a las 02:00 AM UTC via Cron Job.
* Genera un archivo `.sql.gz` cifrado con la clave maestra de respaldos y lo almacena localmente y en un bucket secundario en MinIO.

```bash
# Comando de Backup
docker exec -t kipu-postgres pg_dump -U postgres -d kipufinanzas | gzip > /backups/kipu_db_$(date +%Y%m%m_%H%M%S).sql.gz

# Comando de Restauración
gunzip -c /backups/kipu_db_20260801_020000.sql.gz | docker exec -i kipu-postgres psql -U postgres -d kipufinanzas
```

### 5.2 Respaldos de Archivos en MinIO
* Sincronización continua o periódica de los volúmenes del bucket de MinIO (`kipu-documents`) hacia un destino de almacenamiento externo mediante el cliente `mc` de MinIO (`mc mirror`).

---

## 6. Variables de Entorno de Producción Checklist

```text
POSTGRES_CONNECTION_STRING=Host=postgres;Database=kipufinanzas;Username=postgres;Password=...
REDIS_CONNECTION_STRING=redis:6379,password=...
JWT_SECRET=... (mínimo 64 caracteres)
JWT_ISSUER=https://api-finanzas.x-codec.net
JWT_AUDIENCE=https://finanzas.x-codec.net
ENCRYPTION_MASTER_KEY=... (32 bytes base64)

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=kipu-documents

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

TELEGRAM_BOT_TOKEN=...
APPLICATION_BASE_URL=https://api-finanzas.x-codec.net
FRONTEND_BASE_URL=https://finanzas.x-codec.net
```
