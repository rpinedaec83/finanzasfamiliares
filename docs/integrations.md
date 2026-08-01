# Kipu Finanzas - Documento de Integraciones Externas

## 1. Visión General de Integraciones

**Kipu Finanzas** integra múltiples servicios de correo, almacenamiento en la nube, mensajería, calendarios y proveedores de Inteligencia Artificial para automatizar la captura de información financiera y mantener al usuario notificado.

---

## 2. Integraciones de Correo Electrónico

### 2.1 Gmail API (`rpinedaec83@gmail.com`)
* **Protocolo:** REST API a través de Google OAuth 2.0.
* **Permisos (Scopes):** `https://www.googleapis.com/auth/gmail.readonly`.
* **Filtros de Búsqueda Automaticos:**
  * Remitentes bancarios: `@bcp.com.pe`, `@bbva.com`, `@interbank.com.pe`, `@bancofalabella.com.pe`.
  * Asuntos claves: "Estado de cuenta", "Resumen de movimientos", "Aviso de pago".
* **Deduplicación:** Registro de `MessageId` y hash de adjuntos en `EmailMessages` y `EmailAttachments`.

### 2.2 Microsoft Outlook / Hotmail (`robertdpl_ec@hotmail.com`)
* **Protocolo:** Microsoft Graph API via OAuth 2.0.
* **Permisos (Scopes):** `Mail.Read`.
* **Procesamiento:** Descarga en segundo plano de adjuntos (PDF, Excel) y envío a la cola de procesamiento del Worker.

### 2.3 Correo Personalizado IMAP / SMTP (`rpineda@x-codec.net`)
* **Lectura (IMAP):** Servidor IMAP sobre TLS (`port 993`). Autenticación mediante usuario y contraseña cifrada (App Password).
* **Envío (SMTP):** Servidor SMTP sobre TLS (`port 587` o `465`) para notificaciones salientes.
* **Aclaración Técnica:** SMTP es un protocolo exclusivo de *envío* de correo. Para la ingesta de extractos bancarios se utiliza estrictamente IMAP.

---

## 3. Integraciones de Almacenamiento en la Nube

### 3.1 Google Drive y Microsoft OneDrive
* Permite al usuario autorizar y seleccionar una carpeta específica (ej. `/Finanzas/EstadosDeCuenta`).
* **Sincronización:** Tarea programada en el Worker Service (cada 60 minutos) para detectar archivos nuevos o modificados.
* **Formatos Soportados:** `.pdf`, `.xlsx`, `.xls`, `.csv`, `.jpg`, `.png`.

---

## 4. Bot Interactivo de Telegram

### 4.1 Vinculación Segura de Usuarios
1. El usuario solicita un código de vinculación temporal de 6 dígitos en la Web App (expira en 10 minutos).
2. En Telegram, el usuario envía `/start <CODIGO>` al bot `@KipuFinanzasBot`.
3. El bot valida el token y registra la relación en la tabla `TelegramLinks`.

### 4.2 Comandos Soportados
* `/saldo`: Muestra el resumen de saldos por cuenta y efectivo (PEN y USD).
* `/gastos`: Muestra los gastos acumulados del mes actual por categoría.
* `/presupuesto`: Estado de ejecución de los presupuestos activos.
* `/pagos`: Próximos vencimientos de tarjetas de crédito y servicios.
* `/pendientes`: Documentos o importaciones que requieren revisión manual.
* `/tarjetas`: Resumen de líneas y pagos de tarjetas de crédito.
* `/metas`: Avance de metas de ahorro.
* `/ayuda`: Guía de uso y comandos.

### 4.3 Ingesta Directa de Documentos y Fotos
* El usuario puede enviar una fotografía de un recibo o un archivo PDF directamente al chat de Telegram.
* El bot reenvía el archivo al Worker para OCR/IA, clasifica el gasto y responde con un mensaje interactivo (Inline Keyboards) para que el usuario confirme o modifique el registro con un clic.

---

## 5. Calendarios (Google Calendar & Microsoft Calendar)

Sincronización en tiempo real o programada para crear eventos y recordatorios de:
* Fecha de corte y fecha límite de pago de tarjetas de crédito.
* Vencimiento de servicios públicos, alquileres y suscripciones.
* Vencimiento de depósitos a plazo fijo.

---

## 6. Inteligencia Artificial con OpenAI

### 6.1 Configuración de API Key Cifrada
* Cada administrador de familia puede registrar su propia `OPENAI_API_KEY`.
* Guardada con cifrado AES-256-GCM. El modelo por defecto es `gpt-4o` / `gpt-4o-mini`.

### 6.2 Asistente Conversacional y Herramientas (Tool Calling)
El asistente financiero utiliza llamadas a funciones estructuradas (Tool Calling / Function Calling):
* `GetAccountBalances()`: Consulta de saldos por cuenta.
* `GetMonthlyExpenses(category, month)`: Consulta de gastos filtrados.
* `GetUpcomingPayments()`: Próximos compromisos financieros.
* `ProjectCashFlow(months)`: Proyección de flujo de caja.

### 6.3 Descargo de Responsabilidad (Disclaimer)
> **Aviso Importante:** Las recomendaciones generadas por la IA son estrictamente informativas y analíticas. No constituyen asesoría financiera profesional ni legal.

---

## 7. Tipo de Cambio SUNAT y Fuentes Alternativas

### 7.1 Obtención del Tipo de Cambio Oficial
* Tarea diaria a las 09:00 AM (Hora Lima) que consulta la API / Scraper oficial de la SUNAT.
* Si el tipo de cambio del día no está disponible (fines de semana o feriados), se utiliza el valor del día hábil anterior inmediato marcando la casilla `IsEstimated = true`.
* Permitir sobreescritura manual por parte del usuario.
