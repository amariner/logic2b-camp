# Prompt para la siguiente sesión — carril no temático cerrado

> Reescrito el 2026-08-17 tras cerrar la conversión real de solicitudes sin
> desarrollar temas.

## Estado en una línea

El defecto reproducible de solicitudes queda cerrado: convertir una solicitud
presupuestada crea y enlaza una reserva real. El candidato sigue local, sin
desplegar, y H1–H3 de temas/media continúan fuera del encargo.

## Evidencia de cierre

- `pnpm check`: 71/71; dashboard: 69/69; API: 284/284;
- reserva + enlace + estado se escriben en un batch idempotente y una segunda
  clave responde 409 sin duplicar;
- el cambio de estado aislado a `converted` responde 409;
- QA Worker+D1 a 375/1366: precarga, cotización en servidor, foco, objetivos
  táctiles, overflow y consola verificados;
- candidato local, sin deploy ni datos remotos.

## Qué puede reabrir trabajo no temático

- **Cliente real:** proceso observado, roles, retención, identidad, inventario,
  precios, aceptación, dominio y destino;
- **Proveedor:** cuenta/sandbox y credenciales autorizadas para correo, pagos,
  observabilidad, Analytics, OTA, fiscal/SES o IA;
- **Producción:** destino, diff, rollback y autorización explícita para publicar;
- **Camp Motor:** pago o decisión comercial que levante el veto de `CLAUDE.md`;
- **Producto local:** un defecto reproducible, una métrica o una decisión nueva.

No convertir las fichas provisionales de Control total en tablas, API o permisos
sin el gate de cliente del ADR 0048. Los `converted_booking_id` heredados del
seed son fixtures antiguas y siguen sin acreditar correspondencia comercial; no
confundirlos con conversiones nuevas. No abrir temas, fotografía ni media
mientras el encargo los excluya. Antes de cualquier activación, releer R12–R14
y su runbook.
