# 0049 — Presupuesto D1 y fixtures acotados

Fecha: 2026-08-25. Estado: aceptado localmente, pendiente de autorización para
publicación remota.

## Decisión

La persistencia deja de tratar toda la D1 de Cala Sereno como desechable.
Reservas, huéspedes y solicitudes incorporan `demo_fixture`, cuyo valor por
defecto es falso. Las filas reales y los contactos reales nunca participan en
un reset ni se reclasifican por tenant, canal o contenido.

Se elimina el wipe nocturno del Worker. Dos crons sustituyen el tick común cada
15 minutos: operación diaria y RGPD semanal. El tenant demo añade al segundo un
refresco diferencial, idempotente y con fusibles, exclusivamente sobre fixtures
de reservas/solicitudes y sus dependencias. Catálogo, contenido, usuarios,
sesiones y huéspedes quedan fuera.

Los límites de consultas, filas y tablas son código ejecutable y tests. La
expiración perezosa hace innecesaria la purga de holds cada 15 minutos. El
dashboard baja su refresco automático de uno a cinco minutos.

## Motivo

Insights remotos atribuyeron al sweep RGPD N+1 137,5 M lecturas en siete días;
la suma de las seis consultas dominantes superó 166,5 M. El reset completo
declarado suponía al menos 25.434 escrituras lógicas diarias. Ambas formas de
trabajo son incompatibles con un consumo gratuito predecible y, sobre todo, un
wipe total no puede coexistir con reservas o contactos reales.

## Consecuencias

- Se añaden índices orientados por las consultas medidas y se agrupa RGPD.
- El salto anual que cambie el universo del seed falla cerrado y requiere un
  reseed manual revisado; nunca intenta reconciliar miles de filas desde cron.
- El botón histórico `/api/demo/reset` mantiene su URL por compatibilidad, pero
  ahora comparte el candado semanal y no invalida sesiones.
- `reset.ts` y `db:seed:remote` sobreviven solo como herramientas manuales; la
  segunda conserva sus dos candados y requiere autorización explícita.

Mediciones, inventario, presupuesto antes/después y procedimiento de publicación:
`docs/D1-BUDGET.md`.
