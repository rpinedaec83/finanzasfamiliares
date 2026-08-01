# PROMPT MAESTRO PARA ANTIGRAVITY
# Plataforma de Finanzas Personales y Familiares

## 0. Instrucción principal

Construye una aplicación web completa, segura, modular, mantenible y preparada para producción para administrar las finanzas personales y familiares.

El sistema debe centralizar cuentas bancarias, tarjetas de crédito, ingresos, gastos, presupuestos, transferencias internas, cambios de moneda, depósitos a plazo fijo, metas de ahorro, estados de cuenta, documentos financieros, reportes, alertas e integraciones con correo electrónico, almacenamiento en la nube, calendario, Telegram y OpenAI.

No construyas solamente un prototipo visual. Debes generar una solución funcional, documentada, probada, dockerizada y lista para desplegarse en Dokploy detrás de Traefik.

Trabaja por fases y mantén el proyecto compilable y ejecutable en todo momento. Antes de escribir código, genera los documentos de arquitectura, dominio, seguridad, integraciones, importación bancaria, despliegue y roadmap.

No solicites confirmación para decisiones técnicas menores. Usa los valores predeterminados descritos en esta especificación, documenta los supuestos y continúa.

---

# 1. Nombre provisional

Usa como nombre provisional:

**Kipu Finanzas**

El nombre debe quedar configurable para poder cambiarse posteriormente.

---

# 2. Objetivo general

La aplicación debe funcionar como un sistema avanzado de administración financiera personal y familiar.

Debe permitir:

- Registrar ingresos y gastos.
- Administrar múltiples cuentas bancarias.
- Administrar cuentas en soles y dólares.
- Administrar tarjetas de crédito.
- Importar estados de cuenta bancarios y de tarjetas.
- Importar PDF, Excel, CSV, OFX, QFX, imágenes, fotografías y capturas.
- Recibir documentos desde Telegram.
- Leer estados de cuenta desde Gmail, Outlook e IMAP.
- Leer documentos desde Google Drive y OneDrive.
- Crear presupuestos mensuales, anuales y por categoría.
- Controlar gastos fijos y variables.
- Registrar ingresos fijos y variables.
- Registrar sueldo, honorarios, bonificaciones, intereses y alquileres.
- Registrar depósitos a plazo fijo.
- Registrar transferencias entre cuentas propias.
- Registrar compra y venta de dólares.
- Distinguir correctamente transferencias, gastos, ingresos y pagos de tarjeta.
- Crear metas de ahorro.
- Calcular patrimonio.
- Mostrar flujo de caja.
- Proyectar saldos futuros.
- Crear escenarios financieros.
- Detectar anomalías y gastos inusuales.
- Detectar cobros duplicados.
- Detectar suscripciones.
- Detectar incrementos de precio.
- Recordar pagos y vencimientos.
- Generar reportes.
- Exportar información.
- Analizar datos mediante OpenAI.
- Permitir el uso de varios integrantes de una familia.
- Mantener auditoría y trazabilidad completa.

---

# 3. Usuarios y alcance familiar

La aplicación será utilizada por una familia.

Cada usuario debe pertenecer a una o varias familias, aunque para la primera versión se puede limitar a una familia principal por usuario.

## 3.1 Roles iniciales

### Administrador familiar

Puede:

- Configurar la familia.
- Invitar miembros.
- Eliminar miembros.
- Crear y modificar cuentas.
- Crear y modificar tarjetas.
- Importar estados de cuenta.
- Configurar integraciones.
- Configurar OpenAI.
- Configurar Telegram.
- Configurar correos.
- Crear presupuestos.
- Crear metas.
- Consultar todos los reportes.
- Revisar auditoría.
- Administrar reglas automáticas.
- Administrar categorías.
- Exportar información.
- Configurar backups.
- Configurar notificaciones.

### Miembro

Puede:

- Registrar movimientos.
- Consultar cuentas autorizadas.
- Consultar tarjetas autorizadas.
- Cargar documentos.
- Registrar comprobantes.
- Consultar presupuestos.
- Consultar sus gastos.
- Crear metas personales.
- Recibir notificaciones.
- Usar el asistente financiero sobre los datos autorizados.

### Solo lectura

Puede:

- Consultar información autorizada.
- Consultar reportes.
- Consultar presupuestos.
- Consultar movimientos.
- No puede modificar datos financieros.

## 3.2 Privacidad dentro de la familia

Permitir marcar cuentas, tarjetas, movimientos, metas, documentos y presupuestos como:

- Familiares.
- Compartidos con miembros seleccionados.
- Privados para un usuario.

Todas las consultas deben respetar estos permisos.

---

# 4. Arquitectura tecnológica

## 4.1 Monorepo

Crear un monorepo con esta estructura aproximada:

```text
kipu-finanzas/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── telegram-bot/
├── packages/
│   ├── shared-contracts/
│   ├── shared-types/
│   └── ui/
├── infrastructure/
│   ├── docker/
│   ├── dokploy/
│   ├── traefik/
│   ├── monitoring/
│   └── backup/
├── database/
│   ├── migrations/
│   ├── seed/
│   └── scripts/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── security.md
│   ├── integrations.md
│   ├── banking-imports.md
│   ├── deployment.md
│   ├── operations.md
│   └── implementation-plan.md
├── docker-compose.yml
├── docker-compose.production.yml
├── .env.example
└── README.md
```

## 4.2 Frontend

Usar:

- React.
- TypeScript.
- Vite.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Material UI, Mantine o shadcn/ui.
- Recharts o Apache ECharts.
- PWA.
- Diseño responsive.
- Tema claro y oscuro.
- Idioma inicial: español.
- Región: Perú.
- Zona horaria: `America/Lima`.
- Moneda base predeterminada: PEN.
- Soporte adicional: USD.

## 4.3 Backend

Usar:

- ASP.NET Core Web API.
- .NET 10 LTS.
- C#.
- Entity Framework Core.
- PostgreSQL.
- Arquitectura modular o Clean Architecture pragmática.
- FluentValidation.
- OpenAPI y Swagger.
- Serilog.
- OpenTelemetry.
- Quartz.NET o Hangfire.
- SignalR para notificaciones en tiempo real.
- Redis para caché, trabajos y bloqueos distribuidos.
- MinIO o almacenamiento compatible con S3.
- ASP.NET Core Identity.
- JWT.
- Refresh tokens rotativos.
- OAuth 2.0 para Google y Microsoft.
- Rate limiting.
- Health checks.

## 4.4 Procesamiento asíncrono

Crear un worker para:

- OCR.
- Importaciones.
- Procesamiento de adjuntos.
- Clasificación mediante IA.
- Detección de duplicados.
- Conciliación.
- Notificaciones.
- Sincronización de correos.
- Sincronización de calendarios.
- Sincronización de Drive y OneDrive.
- Tareas programadas.
- Backups.
- Generación de reportes pesados.

## 4.5 Infraestructura

Crear contenedores para:

- frontend
- api
- worker
- telegram-bot
- PostgreSQL
- Redis
- MinIO
- OCR opcional
- Prometheus opcional
- Grafana opcional

Preparar despliegue para Dokploy detrás de Traefik.

---

# 5. Instituciones financieras

Crear soporte inicial para:

- BCP.
- BBVA.
- Interbank.
- Banco Falabella.
- Otros bancos configurables.

Cada institución debe tener:

- Nombre.
- Código.
- País.
- Monedas soportadas.
- Logo.
- Sitio web.
- Dominios de correo conocidos.
- Remitentes conocidos.
- Importadores disponibles.
- Estado.
- Notas.

---

# 6. Cuentas financieras

Tipos de cuenta:

- Cuenta sueldo.
- Cuenta de ahorros.
- Cuenta corriente.
- Cuenta CTS.
- Cuenta de inversión.
- Cuenta de efectivo.
- Billetera digital.
- Cuenta por cobrar.
- Cuenta por pagar.
- Cuenta virtual.
- Otra.

Campos:

- Nombre.
- Institución financiera.
- Tipo.
- Moneda.
- Últimos dígitos.
- Alias.
- Saldo disponible.
- Saldo contable.
- Fecha del saldo.
- Propietario.
- Familia.
- Estado.
- Color.
- Icono.
- Incluida en patrimonio.
- Incluida en presupuesto.
- Privacidad.
- Notas.
- Fecha de creación.
- Fecha de cierre.

Nunca almacenar:

- Clave bancaria.
- PIN.
- CVV.
- Token bancario.
- Contraseña de banca por internet.

---

# 7. Tarjetas de crédito

Crear un módulo completo.

Campos:

- Banco.
- Nombre personalizado.
- Marca.
- Últimos cuatro dígitos.
- Moneda principal.
- Moneda secundaria.
- Línea de crédito.
- Línea disponible.
- Fecha de corte.
- Fecha de pago.
- Propietario.
- Estado.
- Tasa de interés opcional.
- Cuenta habitual de pago.
- Pago mínimo.
- Pago total.
- Membresía.
- Seguro.
- Alertas.
- Notas.

Registrar:

- Compras.
- Devoluciones.
- Pagos.
- Intereses.
- Membresías.
- Comisiones.
- Seguros.
- Disposiciones de efectivo.
- Cuotas.
- Ajustes.
- Compras internacionales.

## 7.1 Compras en cuotas

Campos:

- Compra original.
- Monto total.
- Moneda.
- Número total de cuotas.
- Cuota actual.
- Monto por cuota.
- Interés.
- Fecha inicial.
- Fecha final.
- Comercio.
- Categoría.
- Estado.
- Próximo vencimiento.

## 7.2 Regla crítica

Una compra de tarjeta es un gasto.

El pago posterior de la tarjeta desde una cuenta bancaria es una transferencia o pago de pasivo, no un gasto adicional.

No duplicar el gasto.

---

# 8. Movimientos financieros

Tipos:

- Ingreso.
- Gasto.
- Transferencia.
- Pago de tarjeta.
- Devolución.
- Interés ganado.
- Interés pagado.
- Comisión.
- Ajuste.
- Inversión.
- Retiro de inversión.
- Préstamo.
- Pago de préstamo.
- Cambio de moneda.
- Aporte a meta.
- Retiro de meta.

Campos:

- Fecha de operación.
- Fecha de procesamiento.
- Descripción original.
- Descripción normalizada.
- Institución.
- Cuenta.
- Tarjeta.
- Monto.
- Moneda.
- Monto convertido.
- Moneda base.
- Tipo de cambio.
- Tipo de cambio de referencia.
- Categoría.
- Subcategoría.
- Comercio.
- Beneficiario.
- Ordenante.
- Responsable.
- Etiquetas.
- Notas.
- Documento de origen.
- Importación de origen.
- Estado de conciliación.
- Identificador externo.
- Hash de deduplicación.
- Clasificación manual o automática.
- Nivel de confianza.
- Gasto fijo.
- Gasto variable.
- Recurrente.
- Excluido del presupuesto.
- Privacidad.
- Comprobante.

Estados:

- Pendiente.
- Confirmado.
- Conciliado.
- Duplicado.
- Ignorado.
- Requiere revisión.
- Anulado.

---

# 9. Transferencias entre cuentas propias

Las transferencias entre cuentas propias no son ingresos ni gastos.

Ejemplos:

- BCP PEN a Interbank PEN.
- BBVA USD a BCP USD.
- Cuenta sueldo a cuenta de ahorro.
- Cuenta bancaria a efectivo.
- Efectivo a cuenta bancaria.
- Cuenta bancaria a meta de ahorro.
- Cuenta bancaria a depósito a plazo.
- Cuenta bancaria a inversión.

Cada transferencia debe representarse con:

- Entidad transferencia.
- Movimiento de salida.
- Movimiento de entrada.
- Identificador común.
- Estado de conciliación.

Campos:

- Cuenta origen.
- Cuenta destino.
- Fecha de envío.
- Fecha de recepción.
- Monto enviado.
- Moneda enviada.
- Monto recibido.
- Moneda recibida.
- Comisión.
- Impuesto.
- Tipo de transferencia.
- Referencia.
- Estado.
- Documento.
- Usuario.
- Notas.

Estados:

- Pendiente.
- Procesada.
- Parcialmente conciliada.
- Conciliada.
- Cancelada.
- Rechazada.

## 9.1 Detección automática

Comparar:

- Monto.
- Moneda.
- Fecha.
- Hora.
- Descripción.
- Referencia bancaria.
- Cuenta origen.
- Cuenta destino.
- Titular.
- Nombre del beneficiario.

Permitir tolerancia de hasta tres días.

No vincular automáticamente coincidencias dudosas.

Mostrar:

- Coincidencia propuesta.
- Nivel de confianza.
- Motivos.
- Opción de confirmar.
- Opción de rechazar.

## 9.2 Comisiones

Ejemplo:

- Salen S/ 1,010.
- Llegan S/ 1,000.
- S/ 10 de comisión.

Solo S/ 10 son gasto.

El capital transferido no afecta el presupuesto.

---

# 10. Compra y venta de dólares

El sistema debe registrar cambios entre PEN y USD como transferencias internas con conversión de moneda.

## 10.1 Venta de dólares

El usuario entrega dólares y recibe soles.

Ejemplo:

- Salen USD 1,000.
- Ingresan PEN 3,750.
- Tipo de cambio efectivo: 3.75.

## 10.2 Compra de dólares

El usuario entrega soles y recibe dólares.

Ejemplo:

- Salen PEN 3,800.
- Ingresan USD 1,000.
- Tipo de cambio efectivo: 3.80.

## 10.3 Campos

- Cuenta origen.
- Cuenta destino.
- Monto entregado.
- Moneda entregada.
- Monto recibido.
- Moneda recibida.
- Tipo de operación.
- Tipo de cambio nominal.
- Tipo de cambio efectivo.
- Tipo de cambio incluyendo comisión.
- Tipo de cambio SUNAT.
- Diferencia absoluta.
- Diferencia porcentual.
- Proveedor.
- Comisión.
- Impuesto.
- Fecha.
- Hora.
- Número de operación.
- Documento.
- Notas.

## 10.4 Reglas

- No considerar los soles recibidos como ingreso.
- No considerar los dólares entregados como gasto.
- No considerar los soles entregados como gasto.
- No considerar los dólares recibidos como ingreso.
- Solo las comisiones son gasto.
- Conservar los montos originales.
- No reemplazar el tipo real por el tipo SUNAT.
- SUNAT es referencia.
- Permitir operación aunque SUNAT no esté disponible.
- No incluir diferencia cambiaria en presupuesto por defecto.

## 10.5 Tipo de cambio efectivo

Venta de dólares:

`PEN recibidos / USD entregados`

Compra de dólares:

`PEN entregados / USD recibidos`

Mostrar también costo efectivo incluyendo comisión.

## 10.6 Efectivo

Crear cuentas virtuales:

- Efectivo PEN.
- Efectivo USD.

Permitir:

- Retirar dólares.
- Cambiar dólares en efectivo.
- Depositar soles.
- Comprar dólares en efectivo.
- Guardar dólares fuera del banco.

---

# 11. Tipo de cambio

Monedas iniciales:

- PEN.
- USD.

Fuente principal:

- SUNAT.

Proveedores alternativos:

- API configurable.
- Registro manual.

Guardar:

- Fecha.
- Compra.
- Venta.
- Promedio.
- Fuente.
- Estado.
- Fecha de consulta.
- Indicador de valor estimado.
- Corrección manual.
- Auditoría.

Si no existe tipo para una fecha:

- Usar el último valor anterior.
- Marcarlo como estimado.
- No sobrescribir datos originales.

---

# 12. Ingresos

Tipos:

- Sueldo.
- Bonificación.
- Honorarios.
- Dividendos.
- Intereses.
- Alquileres.
- Venta.
- Reembolso.
- Ingreso extraordinario.
- Otros.

Estados:

- Esperado.
- Recibido.
- Parcial.
- Retrasado.
- Cancelado.

Campos para ingresos recurrentes:

- Monto esperado.
- Moneda.
- Frecuencia.
- Día estimado.
- Cuenta receptora.
- Fecha inicial.
- Fecha final.
- Tolerancia.
- Origen.
- Categoría.
- Alertas.

Detectar ingresos esperados que no llegaron.

---

# 13. Gastos

## 13.1 Gastos fijos

- Suscripciones.
  - Netflix.
  - Spotify.
  - Disney+.
  - Prime Video.
  - Otras.
- Alquileres.
- Salud.
- Servicios básicos.
  - Internet.
  - Electricidad.
  - Agua.
  - Gas.
  - Telefonía.
- Educación.
- Seguros.

## 13.2 Gastos variables

- Supermercado.
- Restaurantes.
- Transporte.
- Combustible.
- Uber y taxis.
- Compras.
- Amazon.
- Fotografía.
- Tecnología.
- Viajes.

## 13.3 Categorías adicionales

- Mascotas.
- Ropa.
- Entretenimiento.
- Regalos.
- Impuestos.
- Comisiones bancarias.
- Hogar.
- Mantenimiento.
- Deudas.
- Ahorro.
- Inversiones.
- Otros.

Las categorías deben ser configurables.

---

# 14. Presupuestos

Tipos:

- Mensual.
- Anual.
- Familiar.
- Personal.
- Por categoría.
- Por subcategoría.
- Por persona.
- Por cuenta.
- Por proyecto.

Ejemplo:

- Comida: S/ 1,500.
- Gasolina: S/ 600.
- Fotografía: S/ 700.
- Streaming: S/ 120.
- Tecnología: S/ 800.

Mostrar:

- Presupuesto.
- Ejecutado.
- Comprometido.
- Disponible.
- Porcentaje.
- Proyección al cierre.
- Comparación con mes anterior.
- Promedio tres meses.
- Promedio seis meses.

Alertas:

- 50 %.
- 80 %.
- 100 %.
- Sobrepresupuesto.

Permitir rollover opcional.

---

# 15. Metas de ahorro

Campos:

- Nombre.
- Descripción.
- Monto objetivo.
- Moneda.
- Fecha objetivo.
- Monto ahorrado.
- Cuenta vinculada.
- Aporte mensual.
- Prioridad.
- Estado.
- Imagen.
- Propietario.
- Privacidad.

Ejemplo:

- Meta: lente Sony.
- Objetivo: S/ 7,000.
- Ahorrado: S/ 4,300.
- Pendiente: S/ 2,700.

Permitir aportes manuales y vinculados a transferencias.

---

# 16. Depósitos a plazo fijo

Campos:

- Banco.
- Titular.
- Capital inicial.
- Moneda.
- Tasa anual.
- Tipo de tasa.
- Fecha apertura.
- Fecha vencimiento.
- Modalidad.
- Frecuencia de pago.
- Renovación automática.
- Cuenta origen.
- Cuenta destino.
- Estado.
- Documento.
- Notas.

Modalidades:

- Interés mensual.
- Interés al vencimiento.
- Renovación de capital.
- Renovación de capital e intereses.
- Sin renovación.

Regla crítica:

No calcular automáticamente el rendimiento contractual.

Permitir registrar manualmente:

- Interés esperado.
- Interés recibido.
- Retenciones.
- Monto final.
- Fecha de cobro.

Mostrar vencimientos y recordatorios.

---

# 17. Importación bancaria

Formatos:

- PDF con texto.
- PDF escaneado.
- Excel.
- CSV.
- OFX.
- QFX.
- Imagen.
- Captura.
- Fotografía.

Bancos iniciales:

- BCP.
- BBVA.
- Interbank.
- Banco Falabella.

Crear adaptadores por banco y formato.

## 17.1 Flujo

1. Recibir documento.
2. Detectar banco.
3. Detectar producto.
4. Detectar moneda.
5. Detectar periodo.
6. Extraer texto.
7. Usar OCR si es necesario.
8. Identificar encabezados.
9. Identificar saldos.
10. Extraer movimientos.
11. Normalizar fechas.
12. Normalizar montos.
13. Detectar débitos y créditos.
14. Detectar duplicados.
15. Clasificar.
16. Mostrar vista previa.
17. Solicitar confirmación.
18. Importar.
19. Conciliar.
20. Generar resumen.

## 17.2 Validaciones

- Total de débitos.
- Total de créditos.
- Saldo inicial.
- Saldo final.
- Diferencia.
- Fechas válidas.
- Moneda.
- Cuenta.
- Duplicados.
- Registros incompletos.
- Líneas no interpretadas.

No confiar exclusivamente en IA.

Usar validaciones determinísticas.

---

# 18. OCR

Usar OCR solo cuando:

- El PDF no tenga texto.
- Sea una fotografía.
- Sea una captura.
- Sea un documento escaneado.

Permitir:

- Rotación automática.
- Corrección de perspectiva.
- Mejora de contraste.
- Detección de tabla.
- Extracción de comercio.
- Extracción de fecha.
- Extracción de monto.
- Extracción de moneda.
- Extracción de impuestos.
- Extracción de número de operación.

Mantener imagen original y resultado OCR.

---

# 19. Correo electrónico

El sistema debe leer estados de cuenta desde varias cuentas de correo.

## 19.1 Gmail

Cuenta inicial:

- `rpinedaec83@gmail.com`

Usar:

- OAuth 2.0.
- Gmail API.
- Permisos mínimos.
- Filtros por remitente.
- Filtros por asunto.
- Filtros por tipo de adjunto.
- Etiquetas configurables.
- Evitar duplicados.
- Guardar identificador del mensaje.
- Guardar identificador del adjunto.
- No almacenar contraseña.

## 19.2 Outlook

Cuenta inicial:

- `robertdpl_ec@hotmail.com`

Usar:

- OAuth 2.0.
- Microsoft Graph.
- Permisos mínimos.
- Lectura de correo autorizado.
- Filtros.
- Descarga de adjuntos.
- Evitar reprocesamiento.
- Integración opcional con calendario y OneDrive.

## 19.3 Correo personalizado

Cuenta inicial:

- `rpineda@x-codec.net`

Usar:

- IMAP para lectura.
- SMTP para envío.
- TLS obligatorio.
- Host configurable.
- Puerto configurable.
- Usuario configurable.
- Contraseña cifrada.
- App password si está disponible.
- Carpeta configurable.
- Filtros por remitente y asunto.
- Evitar duplicados mediante Message-ID y hash.

Aclaración técnica:

SMTP se usa para enviar correos. IMAP se usa para leer mensajes y descargar adjuntos.

## 19.4 Reglas de procesamiento

Permitir reglas como:

- Si remitente pertenece a BCP y contiene PDF, enviar a importador BCP.
- Si asunto contiene “estado de cuenta”, procesar.
- Si adjunto ya fue importado, ignorar.
- Si el correo no puede clasificarse, enviarlo a revisión.
- Si el adjunto está protegido con contraseña, solicitarla de forma segura.
- Si un banco usa contraseña basada en DNI u otro dato, no guardar ese dato sin cifrado y consentimiento.

## 19.5 Seguridad

- No guardar contraseñas en texto plano.
- No mostrar tokens al frontend.
- Cifrar refresh tokens.
- Permitir desconectar una cuenta.
- Registrar auditoría.
- Permitir modo manual.
- Permitir periodo de sincronización.
- Permitir lista de remitentes autorizados.

---

# 20. Google Drive y OneDrive

Permitir seleccionar carpetas.

Funciones:

- Sincronización manual.
- Sincronización programada.
- Detección de archivos nuevos.
- Evitar duplicados.
- Importar PDF, Excel, CSV e imágenes.
- Guardar origen.
- Registrar fecha.
- Registrar ID externo.
- Permitir desconexión.
- Permitir filtros por carpeta.
- Permitir reglas por nombre.

---

# 21. Telegram

Crear un bot.

Funciones:

- Vincular usuario.
- Recibir PDF.
- Recibir Excel.
- Recibir CSV.
- Recibir fotografías.
- Recibir capturas.
- Detectar cuenta.
- Detectar tarjeta.
- Detectar banco.
- Detectar monto.
- Detectar comercio.
- Detectar moneda.
- Proponer categoría.
- Solicitar confirmación.
- Enviar a revisión.
- Informar resultado.
- Notificar pagos.
- Notificar presupuestos.
- Notificar vencimientos.

Comandos:

- `/saldo`
- `/gastos`
- `/presupuesto`
- `/pagos`
- `/pendientes`
- `/tarjetas`
- `/metas`
- `/ayuda`

Seguridad:

- Solo usuarios vinculados.
- Token de vinculación temporal.
- Expiración.
- No mostrar datos sensibles completos.
- No mostrar números de cuenta completos.
- Permitir revocar acceso.

---

# 22. Google Calendar y Microsoft Calendar

Crear eventos para:

- Pago de tarjeta.
- Fecha de corte.
- Servicios.
- Alquiler.
- Seguros.
- Educación.
- Depósitos a plazo.
- Metas.
- Ingresos esperados.
- Pagos programados.

Reglas:

- Evitar duplicados.
- Actualizar eventos.
- Eliminar eventos cancelados.
- Guardar ID externo.
- Configurar anticipación.
- Configurar calendario destino.
- No incluir datos sensibles innecesarios.

---

# 23. Inteligencia artificial con OpenAI

El administrador podrá registrar su propia API key.

## 23.1 Seguridad

- Cifrar API key.
- Nunca devolverla al frontend.
- Nunca mostrarla en logs.
- Permitir reemplazarla.
- Permitir validarla.
- Permitir desactivarla.
- Configurar modelo.
- Configurar límites.
- Registrar uso estimado.
- Limitar llamadas.
- Minimizar datos enviados.

## 23.2 Usos

- Clasificación de movimientos.
- Normalización de comercios.
- Interpretación de descripciones.
- Detección de suscripciones.
- Detección de anomalías.
- Resumen mensual.
- Comparación de periodos.
- Recomendaciones.
- Proyecciones.
- Escenarios.
- Asistente conversacional.
- Explicación de presupuesto.
- Detección de gastos innecesarios.
- Extracción auxiliar de documentos.

## 23.3 Reglas

- Ejecutar reglas determinísticas antes de IA.
- No permitir SQL libre generado por IA.
- Usar herramientas internas controladas.
- Respetar permisos.
- Ocultar números de cuenta.
- Ocultar tarjetas.
- No enviar documentos completos si no es necesario.
- Mostrar periodo analizado.
- Mostrar cuentas incluidas.
- Mostrar advertencias por datos incompletos.
- Indicar que no es asesoría financiera profesional.

## 23.4 Herramientas internas del asistente

- Obtener saldos.
- Obtener gastos.
- Obtener ingresos.
- Obtener presupuestos.
- Obtener tarjetas.
- Obtener vencimientos.
- Obtener metas.
- Comparar periodos.
- Obtener suscripciones.
- Obtener gastos por comercio.
- Proyectar flujo.
- Simular escenario.

Preguntas soportadas:

- ¿En qué gasté más?
- ¿Cuánto gasté en restaurantes?
- ¿Cuánto debo pagar?
- ¿Qué suscripciones tengo?
- ¿Puedo comprar un lente de S/ 7,000?
- ¿Qué gastos podría reducir?
- ¿Cuánto tendré a fin de mes?
- ¿Cuánto cambié de dólares a soles?
- ¿Qué tipo de cambio promedio obtuve?

---

# 24. Motor de reglas

Ejemplos:

- `NETFLIX` → Suscripciones > Netflix.
- `SPOTIFY` → Suscripciones > Spotify.
- `PRIMAX` → Combustible.
- `UBER` → Uber y taxis.
- `AMAZON` → Amazon.
- Mismo monto, comercio y fecha → posible duplicado.
- Gasto 50 % mayor al promedio → inusual.
- Presupuesto 80 % → alerta.
- Tarjeta 70 % usada → alerta.
- Cinco días antes del pago → recordatorio.
- Ingreso esperado no recibido → alerta.
- Suscripción aumentó → alerta.
- Transferencia entre cuentas propias → excluir del presupuesto.
- Pago de tarjeta → no duplicar gasto.
- Comisión → gasto.

Permitir crear reglas desde la interfaz.

---

# 25. Detección de duplicados

Hash con:

- Familia.
- Cuenta.
- Fecha.
- Monto.
- Moneda.
- Descripción normalizada.
- Identificador externo.

Comparación flexible:

- Fecha ± 2 días.
- Descripción similar.
- Movimiento pendiente y procesado.
- Compra internacional.
- Conversión de moneda.
- Adjunto repetido.
- Correo repetido.

Nunca eliminar automáticamente.

Marcar para revisión.

---

# 26. Conciliación

Conciliar:

- Saldo inicial.
- Débitos.
- Créditos.
- Saldo final.
- Transferencias.
- Pagos de tarjeta.
- Cambios de moneda.
- Devoluciones.
- Comisiones.

Mostrar:

- Diferencia.
- Movimientos no conciliados.
- Transferencias pendientes.
- Duplicados.
- Movimientos sin categoría.
- Movimientos sin cuenta destino.

---

# 27. Dashboard

Mostrar:

- Patrimonio total.
- Patrimonio por moneda.
- Dinero disponible.
- Total en cuentas.
- Total en tarjetas.
- Deuda.
- Gastado este mes.
- Ingresos del mes.
- Balance mensual.
- Flujo de caja.
- Presupuestos.
- Metas.
- Próximos pagos.
- Próximos ingresos.
- Depósitos próximos a vencer.
- Transferencias pendientes.
- Dólares comprados.
- Dólares vendidos.
- Tipo de cambio promedio.
- Comisiones pagadas.
- Gastos por categoría.
- Gastos fijos.
- Gastos variables.
- Patrimonio histórico.
- Alertas.
- Documentos pendientes.

Filtros:

- Periodo.
- Cuenta.
- Tarjeta.
- Banco.
- Miembro.
- Moneda.
- Categoría.
- Comercio.
- Estado.
- Etiqueta.

---

# 28. Reportes

Crear:

- Semanal.
- Mensual.
- Trimestral.
- Anual.
- Comparativo.
- Flujo de caja.
- Balance personal.
- Patrimonio.
- Gastos por categoría.
- Gastos por subcategoría.
- Gastos por banco.
- Gastos por cuenta.
- Gastos por tarjeta.
- Gastos por comercio.
- Gastos por miembro.
- Ingresos.
- Suscripciones.
- Presupuesto frente a ejecución.
- Tarjetas.
- Deudas.
- Metas.
- Depósitos a plazo.
- Transferencias.
- Cambios de moneda.
- Comisiones.
- Tipo de cambio efectivo.
- Comparación con SUNAT.
- Conciliación.
- Importaciones.
- Auditoría.

Exportar:

- Excel.
- CSV.
- PDF.

---

# 29. Notificaciones

Canales:

- Aplicación.
- Correo.
- Telegram.
- Google Calendar.
- Microsoft Calendar.

Eventos:

- Pago próximo.
- Corte próximo.
- Pago vencido.
- Presupuesto al 80 %.
- Presupuesto excedido.
- Saldo bajo.
- Gasto inusual.
- Duplicado.
- Ingreso faltante.
- Suscripción detectada.
- Incremento de suscripción.
- Depósito a plazo próximo a vencer.
- Importación terminada.
- Error de importación.
- Integración desconectada.
- Transferencia no conciliada.

---

# 30. Seguridad

Aplicar:

- HTTPS.
- Contraseñas con hash fuerte.
- MFA opcional.
- Refresh tokens rotativos.
- Revocación de sesiones.
- CORS restrictivo.
- Rate limiting.
- CSRF cuando corresponda.
- Security headers.
- Validación MIME.
- Límite de archivos.
- Antivirus opcional.
- Cifrado de secretos.
- Auditoría.
- Backups cifrados.
- Logs sin secretos.
- Enmascaramiento.
- Política de retención.
- Eliminación de datos.
- Exportación de datos personales.

No almacenar:

- CVV.
- PIN.
- Contraseña bancaria.
- Token bancario.
- Claves en texto plano.

---

# 31. Auditoría

Registrar:

- Inicio de sesión.
- Cierre de sesión.
- Fallos de autenticación.
- Creación.
- Modificación.
- Eliminación.
- Importación.
- Exportación.
- Conciliación.
- Cambio de categoría.
- Cambio de permisos.
- Integraciones.
- Uso de IA.
- Descarga de documentos.
- Cambio de configuración.
- Modificación de tipo de cambio.
- Confirmación de transferencias.

---

# 32. Modelo de datos mínimo

Crear entidades:

- Users
- Families
- FamilyMembers
- Invitations
- Roles
- Permissions
- FinancialInstitutions
- Accounts
- CreditCards
- CardStatements
- Transactions
- Transfers
- TransferEntries
- TransferMatches
- TransferFees
- CurrencyExchangeOperations
- ExchangeProviders
- ExchangeRates
- InstallmentPurchases
- Categories
- CategoryRules
- Merchants
- Budgets
- BudgetItems
- IncomeSources
- RecurringTransactions
- FixedTermDeposits
- SavingsGoals
- GoalContributions
- Documents
- DocumentImports
- ImportRows
- ReconciliationSessions
- Notifications
- NotificationPreferences
- Integrations
- IntegrationTokens
- EmailAccounts
- EmailMessages
- EmailAttachments
- TelegramLinks
- CalendarLinks
- AiConfigurations
- AiUsageLogs
- AuditLogs
- RefreshTokens
- Jobs
- JobExecutions

Usar UUID.

Agregar índices.

---

# 33. API REST

Endpoints:

- `/api/auth`
- `/api/families`
- `/api/members`
- `/api/accounts`
- `/api/cards`
- `/api/transactions`
- `/api/transfers`
- `/api/currency-exchanges`
- `/api/categories`
- `/api/budgets`
- `/api/incomes`
- `/api/deposits`
- `/api/goals`
- `/api/documents`
- `/api/imports`
- `/api/reconciliation`
- `/api/reports`
- `/api/exchange-rates`
- `/api/notifications`
- `/api/integrations`
- `/api/email-accounts`
- `/api/telegram`
- `/api/calendar`
- `/api/ai`
- `/api/audit`

Aplicar:

- Paginación.
- Filtros.
- Ordenamiento.
- Búsqueda.
- Problem Details.
- Validación.
- Idempotencia.
- Autorización por familia.
- Correlation ID.

---

# 34. UX y pantallas

Menú:

- Inicio.
- Movimientos.
- Cuentas.
- Tarjetas.
- Transferencias.
- Cambio de moneda.
- Presupuestos.
- Ingresos.
- Depósitos a plazo.
- Metas.
- Documentos.
- Importaciones.
- Conciliación.
- Reportes.
- Alertas.
- Asistente IA.
- Integraciones.
- Familia.
- Configuración.
- Auditoría.

Formulario rápido:

- Registrar gasto.
- Registrar ingreso.
- Transferir.
- Comprar dólares.
- Vender dólares.
- Registrar pago de tarjeta.
- Subir documento.
- Crear meta.

---

# 35. Despliegue en Dokploy

Preparar:

- Dockerfiles multi-stage.
- Docker Compose.
- Compose de producción.
- Health checks.
- Volúmenes persistentes.
- Variables de entorno.
- Redes.
- Traefik labels.
- Migraciones controladas.
- Backup de PostgreSQL.
- Backup de MinIO.
- Restore documentado.
- Logs.
- Métricas.

Subdominios sugeridos:

- `finanzas.x-codec.net`
- `api-finanzas.x-codec.net`
- `minio-finanzas.x-codec.net`
- `grafana-finanzas.x-codec.net`

No exponer PostgreSQL, Redis o MinIO públicamente.

---

# 36. Variables de entorno

```text
POSTGRES_CONNECTION_STRING=
REDIS_CONNECTION_STRING=
JWT_SECRET=
JWT_ISSUER=
JWT_AUDIENCE=
ENCRYPTION_MASTER_KEY=

MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

OPENAI_API_KEY=
OPENAI_MODEL=

TELEGRAM_BOT_TOKEN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=

IMAP_HOST=
IMAP_PORT=
IMAP_USE_TLS=
IMAP_USERNAME=
IMAP_PASSWORD=

SMTP_HOST=
SMTP_PORT=
SMTP_USE_TLS=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=

APPLICATION_BASE_URL=
FRONTEND_BASE_URL=

SUNAT_EXCHANGE_RATE_SOURCE=
ALTERNATIVE_EXCHANGE_RATE_API_URL=
ALTERNATIVE_EXCHANGE_RATE_API_KEY=
```

No colocar valores reales en el repositorio.

---

# 37. Pruebas

Crear:

- Unitarias.
- Integración.
- Autorización.
- Importadores.
- OCR.
- Deduplicación.
- Transferencias.
- Cambio de moneda.
- Pagos de tarjeta.
- Presupuestos.
- Metas.
- Depósitos.
- Correos.
- Telegram.
- E2E con Playwright.

Casos obligatorios:

1. Transferencia PEN sin comisión.
2. Transferencia PEN con comisión.
3. Transferencia USD.
4. Venta de USD.
5. Compra de USD.
6. Cambio con comisión.
7. Transferencia detectada en dos estados.
8. Transferencia con fecha distinta.
9. Pago de tarjeta sin duplicar gasto.
10. Importación duplicada.
11. Correo duplicado.
12. PDF escaneado.
13. Documento dudoso.
14. Presupuesto excedido.
15. Ingreso esperado faltante.
16. Usuario sin permiso.
17. Desconexión de integración.
18. API key cifrada.
19. Exportación.
20. Restore de backup.

---

# 38. Observabilidad

Implementar:

- Serilog.
- OpenTelemetry.
- Prometheus.
- Grafana.
- Health checks.
- Correlation ID.
- Métricas.
- Errores de OCR.
- Errores de IA.
- Errores de correo.
- Errores de Telegram.
- Duración de importaciones.
- Cantidad de movimientos.
- Duplicados.
- Coste estimado de IA.
- Estado de workers.

---

# 39. Roadmap

## Fase 0: documentación

- Arquitectura.
- Dominio.
- Seguridad.
- Modelo ER.
- APIs.
- Integraciones.
- Despliegue.
- Riesgos.

## Fase 1: MVP financiero

- Autenticación.
- Familia.
- Cuentas.
- Tarjetas.
- Categorías.
- Movimientos.
- Transferencias.
- Cambio de moneda.
- Presupuestos.
- Dashboard.
- Docker.

## Fase 2: importación

- CSV.
- Excel.
- PDF.
- OCR.
- BCP.
- BBVA.
- Interbank.
- Falabella.
- Duplicados.
- Conciliación.

## Fase 3: automatización

- Recurrentes.
- Alertas.
- Ingresos esperados.
- Metas.
- Depósitos.
- Jobs.

## Fase 4: integraciones

- Gmail.
- Outlook.
- IMAP.
- SMTP.
- Google Drive.
- OneDrive.
- Telegram.
- Calendarios.

## Fase 5: IA

- Clasificación.
- Normalización.
- Anomalías.
- Asistente.
- Recomendaciones.
- Proyecciones.

## Fase 6: producción

- Seguridad.
- Backups.
- Observabilidad.
- E2E.
- Optimización.
- Documentación.
- Dokploy.

---

# 40. Criterios de aceptación del MVP

El MVP debe permitir:

1. Crear usuario.
2. Crear familia.
3. Invitar miembro.
4. Crear cuentas PEN y USD.
5. Crear tarjetas.
6. Registrar ingreso.
7. Registrar gasto.
8. Registrar transferencia.
9. Registrar compra de dólares.
10. Registrar venta de dólares.
11. Registrar comisión.
12. Crear presupuesto.
13. Mostrar ejecución.
14. Crear meta.
15. Registrar depósito a plazo sin cálculo automático.
16. Importar CSV.
17. Detectar duplicados.
18. Clasificar movimientos.
19. Mostrar patrimonio.
20. Exportar movimientos.
21. Ejecutarse con Docker.
22. Desplegarse en Dokploy.

---

# 41. Reglas críticas no negociables

- Transferencias propias no son ingresos.
- Transferencias propias no son gastos.
- Pagos de tarjeta no duplican gastos.
- Compra de dólares no es gasto de capital.
- Venta de dólares no es ingreso de capital.
- Comisiones sí son gastos.
- Mantener montos originales.
- Mantener moneda original.
- Mantener tipo de cambio real.
- SUNAT es referencia.
- No eliminar duplicados automáticamente.
- No confiar solo en IA.
- No guardar secretos en logs.
- No guardar credenciales bancarias.
- No exponer datos de una familia a otra.
- No avanzar dejando el proyecto sin compilar.
- No simular integraciones como completas si faltan credenciales.
- No calcular automáticamente rendimiento contractual de depósitos a plazo.

---

# 42. Primera tarea para Antigravity

Antes de escribir código:

1. Crear `docs/architecture.md`.
2. Crear `docs/domain-model.md`.
3. Crear `docs/security.md`.
4. Crear `docs/integrations.md`.
5. Crear `docs/banking-imports.md`.
6. Crear `docs/deployment.md`.
7. Crear `docs/implementation-plan.md`.
8. Crear diagrama de componentes.
9. Crear modelo entidad-relación.
10. Definir estructura del monorepo.
11. Definir decisiones técnicas.
12. Identificar riesgos.
13. Definir MVP.
14. Crear backlog inicial.
15. Después comenzar la implementación.

Al terminar cada fase:

- Compilar.
- Ejecutar pruebas.
- Corregir errores.
- Actualizar documentación.
- Registrar decisiones.
- Generar lista de pendientes.
- Generar lista de riesgos.
- Mantener Docker funcional.

---

# 43. Resultado esperado

El resultado debe ser una plataforma financiera familiar moderna, segura y extensible, capaz de consolidar información de BCP, BBVA, Interbank y Banco Falabella, procesar documentos recibidos por Gmail, Outlook, IMAP, Drive, OneDrive y Telegram, clasificar movimientos, controlar presupuestos, registrar transferencias y cambios de moneda correctamente, administrar tarjetas, depósitos y metas, y ofrecer análisis mediante OpenAI sin comprometer la privacidad ni la exactitud financiera.
