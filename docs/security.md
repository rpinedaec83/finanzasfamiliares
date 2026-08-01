# Kipu Finanzas - Documento de Seguridad y Privacidad

## 1. Principios Generales de Seguridad

La seguridad y la privacidad de la información financiera son pilares fundamentales de **Kipu Finanzas**. El diseño del sistema cumple con los estándares de la industria para aplicaciones financieras personales y familiares, garantizando confidencialidad, integridad, disponibilidad y auditoría completa.

---

## 2. Autenticación y Gestión de Sesiones

### 2.1 Autenticación de Usuarios
* **Mecanismo:** ASP.NET Core Identity con hash de contraseñas de alta seguridad (`PBKDF2` con HMAC-SHA256 y salt de 128 bits).
* **Autenticación de Dos Factores (MFA):** Soporte opcional para aplicaciones Authenticator (TOTP - RFC 6238).

### 2.2 Tokens JWT y Refresh Tokens Rotativos
* **Access Tokens:** JWT de corta duración (expiración de 15 minutos) firmado con clave simétrica de 512 bits (HMAC-SHA512).
* **Refresh Tokens:**
  * Almacenados en base de datos cifrados y asociados a la sesión/dispositivo del usuario.
  * Duración máxima: 7 días.
  * **Rotación obligatoria:** Cada uso del refresh token emite un nuevo par (Access + Refresh) e invalida el anterior.
  * **Detección de Reuso:** Si se intenta utilizar un refresh token revocado o ya consumido, se revocan automáticamente *todas* las sesiones activas del usuario por sospecha de compromiso.

### 2.3 Proveedores OAuth 2.0
* Soporte para Inicio de Sesión Único (SSO) con **Google** y **Microsoft**.
* Implementación del flujo de código de autorización PKCE (Proof Key for Code Exchange).

---

## 3. Aislamiento Multi-inquilino y Privacidad Familiar

### 3.1 Filtros Globales de Consulta (EF Core Global Query Filters)
Todas las entidades asociadas a la familia (`Account`, `CreditCard`, `Transaction`, `Budget`, `SavingsGoal`, etc.) incluyen una propiedad `FamilyId`. En el `DbContext` de EF Core, se aplica automáticamente el siguiente filtro:

```csharp
builder.Entity<Transaction>().HasQueryFilter(t => t.FamilyId == _currentUserService.FamilyId);
```

Esto previene cualquier fuga involuntaria de datos entre familias diferentes a nivel de motor ORM.

### 3.2 Privacidad Dentro de la Familia
Cada registro o recurso financiero puede configurarse con un nivel de visibilidad:
1. **`Family` (Familiar):** Visible para todos los miembros de la familia.
2. **`Shared` (Compartido):** Visible para el propietario y miembros específicamente autorizados.
3. **`Private` (Privado):** Visible **únicamente** para el usuario creador (incluso dentro de la misma familia).

Las APIs backend validan estas restricciones antes de retornar cualquier entidad.

---

## 4. Cifrado de Secretos y Datos Sensibles

### 4.1 Cifrado en Reposo para Credenciales e Integraciones
* **Master Key de Cifrado:** Definida mediante la variable de entorno `ENCRYPTION_MASTER_KEY` (AES-256).
* **Algoritmo:** **AES-256-GCM** (Galois/Counter Mode) que proporciona cifrado autenticado.
* **Campos Cifrados:**
  * API Key de OpenAI (`AiConfigurations.ApiKey`).
  * Contraseñas de correo IMAP/SMTP (`EmailAccounts.Password`).
  * Tokens de integración OAuth Refresh Tokens (`IntegrationTokens.RefreshToken`).
  * Tokens del Bot de Telegram.

> **Regla de Oro:** Ninguna API Key o contraseña de integración es devuelta jamás al cliente frontend ni expuesta en los logs de la aplicación.

### 4.2 Prohibición Estricta de Almacenamiento Bancario
El sistema **NUNCA** solicita, procesa ni almacena:
* Contraseñas de banca por internet.
* Claves de acceso (PIN de 4 o 6 dígitos).
* Códigos de seguridad CVV / CVC de tarjetas.
* Tokens de seguridad físicos o digitales de bancos.
* Números completos de tarjetas de crédito o cuentas bancarias (solo se guardan los **últimos 4 dígitos**).

---

## 5. Seguridad en la Red e Infraestructura

### 5.1 Enrutamiento y TLS
* Todo el tráfico web se sirve obligatoriamente sobre **HTTPS** (TLS 1.3 / TLS 1.2) gestionado dinámicamente por **Traefik** con certificados Let's Encrypt.
* Encabezados de seguridad HTTP obligatorios:
  * `Strict-Transport-Security` (HSTS).
  * `X-Content-Type-Options: nosniff`.
  * `X-Frame-Options: DENY`.
  * `Content-Security-Policy` (CSP).

### 5.2 Limitación de Tasa (Rate Limiting) y CORS
* **CORS:** Restringido explícitamente a los dominios configurados en `FRONTEND_BASE_URL`.
* **Rate Limiting:** Implementado mediante ASP.NET Core Rate Limiting / Redis Rate Limiter:
  * Endpoints de Autenticación (`/api/auth/*`): Máximo 5 intentos por minuto.
  * APIs Estándar (`/api/*`): Máximo 100 peticiones por minuto por usuario.
  * Endpoints de IA y Webhooks (`/api/ai/*`, `/api/telegram/*`): Límites específicos ajustados.

### 5.3 Validación de Archivos e Ingesta
* Validación estricta de extensiones y tipos MIME (`application/pdf`, `image/jpeg`, `image/png`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
* Tamaño máximo de archivo por carga: 15 MB.
* Almacenamiento aislado en MinIO con nombres de objeto UUID sin exponer rutas del sistema de archivos host.

---

## 6. Auditoría y Trazabilidad Completa

Se mantiene un registro inmutable en la tabla `AuditLogs` que almacena:
* `Timestamp` (UTC).
* `UserId` y `FamilyId`.
* `IpAddress` y `UserAgent`.
* `Action` (ej. `USER_LOGIN`, `TRANSACTION_CREATE`, `EXCHANGE_RATE_UPDATE`, `AI_QUERY`).
* `EntityName` y `EntityId`.
* `OldValues` y `NewValues` (JSON sanitizado sin campos sensibles).
