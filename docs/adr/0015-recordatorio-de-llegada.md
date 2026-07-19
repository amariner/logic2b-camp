# 0015 — Recordatorio de llegada

- **Fecha**: 2026-07-19
- **Fase**: BACKLOG 7.x (transversal a la Fase 7 · notificaciones)
- **Estado**: **aceptado por delegación explícita en sesión cloud**, mismo régimen que ADR 0009–0014.

## Contexto

BACKLOG lo señalaba desde el cierre de la Fase 7: *"Recordatorio de llegada (cron diario sobre `arrivalsOn`) cuando haya API key de Resend"* — aplazado en su momento porque parecía necesitar un envío real para verificarse. ADR 0014 (esta misma sesión cloud) ya demostró que no hace falta: cualquier notificación se verifica igual de bien en estado `disabled` (sin `RESEND_API_KEY`) que enviada de verdad — el motor, el `notifications_log` y los tests no dependen de la credencial, solo el envío efectivo. Con la infraestructura de cron+`notify` que ADR 0014 acaba de dejar lista (`notifyNow`, deps planas sin `Context` de Hono), este recordatorio deja de estar bloqueado.

## Decisión

### 1. Reutiliza el mismo cron de 15 min — "diario" se cumple por deduplicación, no por un trigger nuevo

El BACKLOG pedía un "cron diario". Un `cron` de Cloudflare nuevo (`0 9 * * *`, por ejemplo) exigiría tocar `triggers.crons` en el `wrangler.jsonc` de CADA tenant — más superficie que mantener por camping, en contra de la restricción que gobierna todo el proyecto (`CLAUDE.md` §0). En su lugar, `notifyArrivalReminders` se engancha al MISMO `scheduled()` que ya corre cada 15 minutos para la purga de holds (ADR 0007) y el aviso de `pending` colgadas (ADR 0014), con una comprobación en `notifications_log` antes de repetir — igual que el aviso de `pending`. El resultado es, de hecho, MEJOR que un cron diario a hora fija: el huésped recibe el recordatorio dentro de los primeros 15 minutos desde que su llegada pasa a ser "mañana", no hasta 24 h más tarde si el cron diario cae después de esa medianoche.

### 2. Se manda el día antes exacto: `date_from = hoy + 1`

Ni "dos días antes" ni "una semana antes" — un recordatorio con antelación de sobra para que sea información útil ("mañana llegas") y no ruido. Reutiliza el mismo criterio de "hoy" que ya usa el dashboard (`Llegadas`, Fase 6): la fecha real del reloj del Worker, no ninguna fecha ficticia de demo.

### 3. Solo reservas `confirmed`; se manda al huésped principal, y SOLO si tiene email

A diferencia del aviso de `pending` colgadas (interno, va siempre a `notifyTo`), este es un email al huésped — el nombre y el contacto salen de `booking_guests`/`guests` (`isLead:true`), igual que ya resuelve `/admin/bookings`. Si esa fila no tiene `email` (un alta manual por teléfono a veces no lo pide), **se omite sin más**: NO cae al buzón interno del camping como sustituto — avisar a recepción de la llegada de un huésped que ya está en su propio dashboard no aporta nada, y sería fácil de confundir con un fallo real. Aplica a cualquier canal (`web`, `phone`, `walkin`): quien tenga confirmada su llegada mañana y haya dejado un email, lo recibe.

### 4. Contenido mínimo, sin desglose ni botón de gestión

Mismo criterio que el aviso de `pending` (ADR 0014 §con formato compartido en `templates.ts`): código, estancia, tipo, personas. No repite el desglose de precio (ya lo tiene del email de confirmación) ni añade un enlace de gestión — es un recordatorio, no una acción pendiente.

## Consecuencias

- Segundo uso de `notifyNow` (la variante de `notifyAfter` sin `Context`, extraída en ADR 0014) — confirma que la extracción fue la abstracción correcta, no una anticipación de más: el segundo caso de uso ya estaba esperando.
- `EVENTOS` en `apps/dashboard/src/pages/Ajustes.tsx` gana `booking_pending_stuck` (ADR 0014, se quedó fuera por descuido en esa sesión) y `booking_reminder` — recepción puede apagar cualquiera de los dos sin deploy, cumpliendo la promesa de ADR 0010.
- Riesgo aceptado: sin `RESEND_API_KEY` real (como en la demo hoy) el recordatorio queda `disabled` en el log, igual que el resto — comportamiento ya establecido, no uno nuevo.
