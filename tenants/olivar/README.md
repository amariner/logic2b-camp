# Camping L'Olivar

Demo comercial ficticia de **Logic Camp Inicio** sobre el carril técnico `tier: 1`.

- 18 parcelas y 4 tiendas premontadas.
- Español, sin motor, dashboard, Worker o D1 propios.
- El formulario usa `enquiryTransport: 'demo'`: no hace red ni persiste datos.
- Ruta prevista: `/demos/olivar/`, siempre `noindex`.

## Construir

```bash
TENANT=olivar TIER=1 BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

Brief aprobado en `identity.json`; encargo, procedencia y ocho piezas completas
en `fotos.json`. La receta local común está en `docs/FABRICA-IDENTIDADES.md`.
