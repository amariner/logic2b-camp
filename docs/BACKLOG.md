# BACKLOG

Ideas y peticiones que NO son de la fase en curso. Aquí, no al código. Formato: `- [fase probable] descripción — fecha`.

- ~~[10] `?tema=x` en la URL de la demo~~ → hecho 2026-07-19 (sesión 18: el parámetro valida contra la lista, persiste y gana a localStorage)
- [10] Tematizar también el dashboard de la demo con los temas del ADR 0009 (hoy solo la web pública; los tokens del dashboard se tenant-izan en Fase 9) — 2026-07-19
- [7.x] Migrar plantillas de email a React Email cuando haga falta diseño rico (el contrato render() no cambia — ADR 0010) — 2026-07-19
- [7.x] Cloudflare Queues + reintentos programados para notificaciones cuando el volumen lo pida (hoy waitUntil — ADR 0010) — 2026-07-19
- [7.x] Pantalla de log de notificaciones en el dashboard (la tabla ya se puebla) + reenvío manual de fallidos — 2026-07-19
- [7.x] Recordatorio de llegada (cron diario sobre arrivalsOn) cuando haya API key de Resend — 2026-07-19
- [8.x] Fianza (`deposit_cents`) cobrada vía pasarela: pre-autorización (Stripe `capture_method:manual`, Redsys autorización tipo 1 + confirmación tipo 2) sin mezclarla con `paidCents` — declarado fuera de v1 en ADR 0011 §2 — 2026-07-19
- [8.x] Verificar el adaptador Redsys contra su sandbox real con las credenciales de comercio de Andreu (clave, FUC, terminal) antes del primer cobro real — la firma está verificada por construcción (3DES cruzado contra `node:crypto`, HMAC nativo) pero no contra el TPV real — ADR 0011 §7 — 2026-07-19
- [8.x] Cron de purga/aviso de reservas `pending` colgadas (pago nunca confirmado, ni el cliente ni recepción actúan) — simétrico al cron de holds de la Fase 5 — 2026-07-19
- [8.x] Botón "reintentar el pago" en `/reserva` cuando `pago=cancelado`/queda `pending` mucho tiempo (hoy solo se informa y se remite a recepción) — 2026-07-19
- [8.x] Pantalla de log de pagos en el dashboard (como la de notificaciones ya anotada) — 2026-07-19
