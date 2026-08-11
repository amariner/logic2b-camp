# Camping La Carrasca

Demo comercial ficticia de **Logic Camp Visión** sobre el carril técnico `tier: 3`.

- 150 unidades: 110 parcelas, 24 bungalows y 16 casas.
- Reserva y pago locales de demostración, sin cargo ni proveedor real.
- Tasa regional ficticia de 1,20 € por adulto y noche (máximo siete noches),
  señal simulada del 30 % y cancelación por tramos 14/7/0 días, visibles en el recorrido.
- Rutas: `/demos/carrasca/` y `/demos/carrasca/gestion/`, siempre `noindex`.
- El reset elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=carrasca TIER=3 BASE_PATH=/demos/carrasca pnpm --filter @logic-camp/web build
```

## Fotografía

El encargo de arte, procedencia, lotes y derivados de las 10 piezas vive en
`fotos.json`. Las 10 están aprobadas visualmente y tienen miniatura, OG y
favicon derivados; el pipeline común conserva también staging y rechazos.

```bash
pnpm fotos -- status carrasca
pnpm fotos -- run carrasca
```
