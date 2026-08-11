# Camping Serralta

Demo comercial ficticia de **Logic Camp Gestión** sobre el carril técnico `tier: 2`.

- 80 unidades: 66 parcelas, 10 cabañas y 4 refugios.
- Español en la web; el gestor contiene solicitudes ficticias en cuatro idiomas.
- `enquiryTransport: 'demo-session'` conserva una solicitud ficticia en el
  navegador para enseñarla en el build aislado del gestor.
- Rutas: `/demos/serralta/` y `/demos/serralta/gestion/`, siempre `noindex`.
- El reset del gestor elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=serralta TIER=2 BASE_PATH=/demos/serralta pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

## Fotografía

El encargo de arte, procedencia, lotes y derivados de las 10 piezas vive en
`fotos.json`. El pipeline común mantiene staging, rechazos y aprobación visual
explícita:

```bash
pnpm fotos -- status serralta
pnpm fotos -- run serralta
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
