# Camping Sol d'Hivern

Demo comercial ficticia de **Logic2B Campings Visión** sobre el carril técnico `tier: 3`.

- 200 unidades: 170 parcelas, 20 bungalows y 10 estudios.
- Reserva y pago locales de demostración, sin cargo ni proveedor real.
- Abierto todo el año y orientado a estancias largas: el recorrido hace visible
  el mínimo de 45 noches en invierno y la posibilidad de prorrogar.
- El gestor muestra una ocupación prolongada y estable, además de suministros y
  servicios cotidianos para autocaravanas.
- Rutas: `/demos/soldhivern/` y `/demos/soldhivern/gestion/`, siempre `noindex`.
- El reset elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=soldhivern TIER=3 BASE_PATH=/demos/soldhivern pnpm --filter @logic-camp/web build
```

## Fotografía

El encargo, los lotes, los prompts, la procedencia y los derivados de las diez
piezas viven en `fotos.json` y `fotos.estado.json`. Las fotografías son
exclusivas de esta demo: no se comparten con ningún otro tenant.

```bash
pnpm fotos -- status soldhivern
pnpm fotos -- run soldhivern
```
