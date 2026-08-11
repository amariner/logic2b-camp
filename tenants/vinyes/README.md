# Camping Entre Vinyes

Demo comercial ficticia de **Logic Camp Gestión** sobre el carril técnico `tier: 2`.

- 70 unidades: 56 parcelas, 10 cabañas y 4 casetas rehabilitadas.
- Español en la web; Vendimia se solapa con Verano y gana por prioridad.
- `enquiryTransport: 'demo-session'` conserva una solicitud ficticia en el
  navegador para enseñarla en el build aislado del gestor.
- Rutas: `/demos/vinyes/` y `/demos/vinyes/gestion/`, siempre `noindex`.
- El reset del gestor elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=vinyes TIER=2 BASE_PATH=/demos/vinyes pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

## Fotografía

El encargo de arte, procedencia, lotes y derivados de las 10 piezas vive en
`fotos.json`. El pipeline común mantiene staging, rechazos y aprobación visual
explícita:

```bash
pnpm fotos -- status vinyes
pnpm fotos -- run vinyes
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
