# Prompt para la siguiente sesión — autogestión segura y H1-V condicionado

> Actualizado el 2026-09-01 durante el cierre de la sesión 152.

## Auditoría posterior del catálogo · 2026-09-05

Cerrada la revisión UI/UX y móvil de los doce temas más Cala Sereno. Evidencias,
correcciones y comandos en [AUDITORIA-TEMAS-2026-09-05.md](AUDITORIA-TEMAS-2026-09-05.md).
Cambios locales, sin publicar; no se ha alterado el estado remoto descrito en
la sesión 153. Se mantiene el siguiente objetivo independiente indicado abajo.

## Estado en una línea

El gestor y la superficie comercial comparten ya `.theme-logic2b` sobre la base
auditable de `ui.logic2b.com`. El modo oscuro usa una escala bosque casi negra y
el claro tiene contraste cruzado para texto secundario, controles y foco. La mejora
fotográfica sigue cerrada en 13/13. H1-V conserva el fallback íntegro y su
aceptación real de navegador, pero no puede generar L'Olivar: hay 1,38 créditos
y el brief aprobado cuesta 21. El siguiente P0 local independiente del proveedor
sigue siendo endurecer la autogestión pública de reservas.

## Evidencia nueva cerrada

- ADR 0050 y variante `.theme-logic2b` compartida por dashboard y sitio;
- snapshot local de los tokens públicos de `ui.logic2b.com` auditados el
  2026-09-01 y contratos AA claro/oscuro;
- QA real del gestor a 1366/375 px en Inicio, Llegadas y Planning, sin overflow;
- `@logic-camp/ui` 203/203, dashboard 70/70, sitio 101 páginas y gate global
  74/74;
- control ES/EN de 44 px para pausar/reanudar las dos columnas del carril;
- pausa por foco y por `prefers-reduced-motion`, con estado `aria-pressed`;
- QA real a 375/1366 px en movimiento normal y reducido, sin errores ni
  desborde y con exactamente doce temas accesibles;
- seis anchos WebP compartidos por carril, catálogo y portfolio: 119,4 KiB a
  360w y 512,2 KiB a 800w frente a 1,51 MiB de originales;
- contrato final para las 13 demos aprobadas: vida, tres rutas, cuatro piezas
  humanas trazadas, recepción y otro servicio en uso;
- seis escenarios Chromium de `HeroMedia`: cero petición bajo movimiento
  reducido/ahorro de datos, fuente móvil/escritorio, reproducción, rechazo de
  autoplay y medio fallido;
- cambio de total con intent persistido bloqueado antes de escribir tanto en
  público como en admin; mismo importe permitido y UI con explicación honesta.

## Próximo objetivo local

Sustituir el acceso público por código de seis dígitos + email en URL por una
capacidad de al menos 80 bits y consultas con cuerpo JSON. El recorrido debe:

1. dejar email y credencial fuera de URL, historial, logs y referer;
2. mantener recuperación, cancelación, modificación y reintento de pago sin
   degradar las seis traducciones;
3. responder `Cache-Control: no-store` en todas las superficies de gestión;
4. conservar rate limit y aislamiento por tenant, reforzando la entropía sin
   romper reservas existentes sin una estrategia explícita;
5. añadir tests de entropía, lookup, URL sin PII y respuestas no cacheables;
6. comprobar `/reserva` a 375/1366 px contra Worker+D1 local.

No mezclar en ese corte idempotencia del ledger o reemplazo real de intents: son
objetivos separados y necesitan sus propias pruebas de concurrencia/proveedor.

## H1-V cuando el saldo alcance 21 créditos

Reintentar solo L'Olivar con Seedance 2.0: 6 s, 16:9, 720p, cámara fija, sin
audio, `hero-dia.webp` al inicio y al final y movimiento limitado a hojas,
sombras y lona. Seguir `BRIEF-H1-VIDEO.md` sin rediseñar el prompt.

- no producir Pinada del Mar ni Mar de Fondo antes de aprobar continuidad,
  bucle, peso y lectura del titular en L'Olivar;
- ingerir con `pnpm motion -- stage/approve/reject`, nunca copiar bytes del
  proveedor directamente a `content/media/`;
- generar después el recorte móvil propio; no reutilizar el apaisado;
- conservar el póster como LCP y exigir ≤3 MB escritorio / ≤1,5 MB móvil;
- repetir la aceptación Chromium ya integrada sobre el primer activo real.

## Verificación mínima al retomar

```bash
git fetch origin
git rev-list --left-right --count HEAD...origin/main
env CI=true pnpm check
pnpm --filter @logic-camp/web test
pnpm --filter @logic-camp/site build
pnpm --filter @logic-camp/site qa:commercial
```

Para pagos/Worker, dirigir `WRANGLER_LOG_PATH` a `/private/tmp` si el entorno
restringe `~/Library/Preferences/.wrangler/logs`. No declarar verde una suite
abortada antes de ejecutar aserciones.

## Gates que permanecen externos

- vídeo H1-V: saldo ≥21 créditos y revisión visual del primer resultado;
- proveedor real de pagos: credenciales y sandbox autorizado;
- cliente real, DNS, secrets, reseed remoto o `new:camping --apply`: destino y
  autorización específicos;
- Camp Motor: continúa bajo su disparador comercial documentado.
