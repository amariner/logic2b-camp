# Camping Els Tarongers

Demo comercial ficticia de **Logic Camp Gestión** sobre el carril técnico `tier: 2`.

- 100 unidades: 80 parcelas, 14 bungalows y 6 casas familiares.
- Español en la web; Verano familiar tiene prioridad en los límites de temporada.
- `enquiryTransport: 'demo-session'` conserva una solicitud ficticia en el
  navegador para enseñarla en el build aislado del gestor.
- Rutas: `/demos/tarongers/` y `/demos/tarongers/gestion/`, siempre `noindex`.
- El reset del gestor elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=tarongers TIER=2 BASE_PATH=/demos/tarongers pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

## Fotografía

El encargo de arte, procedencia, lotes y derivados de las 10 piezas vive en
`fotos.json`. El pipeline común mantiene staging, rechazos y aprobación visual
explícita:

```bash
pnpm fotos -- status tarongers
pnpm fotos -- run tarongers
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
