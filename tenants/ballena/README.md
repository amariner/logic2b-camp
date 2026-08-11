# Camping La Ballena

Demo comercial ficticia de **Logic Camp Visión** sobre el carril técnico `tier: 3`.

- 250 unidades: 160 parcelas, 54 bungalows y 36 mobil-homes familiares.
- Reserva y pago locales de demostración, sin cargo ni proveedor real.
- La temporada de verano trabaja por semanas de sábado a sábado: el recorrido
  hace visible el mínimo de siete noches y la llegada en bloque antes de confirmar.
- Rutas: `/demos/ballena/` y `/demos/ballena/gestion/`, siempre `noindex`.
- El reset elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=ballena TIER=3 BASE_PATH=/demos/ballena pnpm --filter @logic-camp/web build
```

## Fotografía

El encargo, procedencia, lotes y derivados de las diez piezas vive en
`fotos.json`. Las fotografías son exclusivas de esta demo: no se comparten con
ningún otro tenant.

```bash
pnpm fotos -- status ballena
pnpm fotos -- run ballena
```
