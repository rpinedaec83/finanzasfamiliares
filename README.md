# Kipu Finanzas (Plataforma de Finanzas Personales y Familiares)

**Kipu Finanzas** es una solución web completa, modular, segura y lista para producción diseñada para consolidar la administración financiera personal y familiar.

## 🚀 Características Principales

* **Cuentas y Tarjetas:** Administración multi-banco (BCP, BBVA, Interbank, Banco Falabella) y soporte multi-moneda (Soles PEN y Dólares USD).
* **Transferencias Internas:** Distinción estricta de transferencias entre cuentas propias (sin duplicar patrimonio ni gastos).
* **Compra y Venta de Dólares:** Registro con tipo de cambio efectivo real y referencia SUNAT.
* **Tarjeta de Crédito y Cuotas:** Gestión de compras en cuotas, fechas de corte y pagos de tarjetas sin duplicar gastos.
* **Depósitos a Plazo Fijo & Metas:** Control de inversiones, recordatorio de vencimientos y aportes a metas de ahorro.
* **Importación Inteligente:** Procesamiento de PDF, CSV, Excel, imágenes e ingesta con OCR e IA (OpenAI GPT-4o).
* **Integraciones:** Ingesta automática via Gmail API, Outlook Graph, IMAP personal, Google Drive, OneDrive, Telegram Bot y sincronización con Google/Microsoft Calendar.
* **Aislamiento y Privacidad:** Privacidad a nivel de item (`Familia`, `Compartido`, `Privado`) y aislamiento estricto por `FamilyId` mediante EF Core Query Filters.

---

## 🛠️ Estructura del Monorepo

* `apps/web`: Frontend React + Vite + TypeScript + Mantine UI.
* `apps/api`: Backend ASP.NET Core Web API (.NET 10 / C#).
* `apps/worker`: Servicio asíncrono Worker para OCR, Ingesta, IA y Jobs.
* `apps/telegram-bot`: Engine del Bot de Telegram.
* `packages/shared-contracts`: DTOs y modelos compartidos en C#.
* `packages/shared-types`: Definiciones de tipos TypeScript para el frontend.
* `packages/ui`: Biblioteca de componentes UI.
* `infrastructure/`: Docker, Docker Compose, Dokploy y Traefik setup.
* `docs/`: Documentación técnica detallada.

---

## 🚦 Despliegue en Desarrollo Local

```bash
docker-compose up --build -d
```

Acceso local:
* **Web App:** http://localhost:3000
* **Swagger API:** http://localhost:5000/swagger
* **MinIO Console:** http://localhost:9001

---

## 📄 Licencia

MIT License.
