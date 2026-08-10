# Camping Pinada del Mar

Demo comercial ficticia de **Logic Camp Gestión** sobre el carril técnico `tier: 2`.

- 110 unidades: parcelas, bungalows y mobil-homes.
- Español en la web; el gestor contiene solicitudes ficticias en cuatro idiomas.
- `enquiryTransport: 'demo-session'` conserva una solicitud ficticia en el
  navegador para enseñarla en el build aislado del gestor.
- Rutas: `/demos/pinadamar/` y `/demos/pinadamar/gestion/`, siempre `noindex`.
- El reset del gestor elimina todo el estado temporal del escenario.

## Construir

```bash
TENANT=pinadamar TIER=2 BASE_PATH=/demos/pinadamar pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

## Fotografía

El encargo de arte, procedencia, lotes y derivados de las 11 piezas viven en
`fotos.json`; las 11 están completas. `fetch-fotos.mjs` queda únicamente como
lector legado de manifiestos con URL. Cualquier sustitución usa el pipeline
común, con staging y aprobación explícita:

```bash
pnpm fotos -- status pinadamar
pnpm fotos -- run pinadamar
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
