# Camping L'Olivar

Demo comercial ficticia de **Logic Camp Inicio** sobre el carril técnico `tier: 1`.

- 22 parcelas solo para tiendas propias: 16 de 70 m² y 6 de 100 m².
- Español, sin motor, dashboard, Worker o D1 propios.
- El formulario usa `enquiryTransport: 'demo'`: no hace red ni persiste datos.
- Ruta prevista: `/demos/olivar/`, siempre `noindex`.

## Construir

```bash
TENANT=olivar TIER=1 BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y `?demoState=spam#contacto`.

Brief aprobado en `identity.json`; encargo, procedencia y piezas aprobadas
en `fotos.json`. La receta local común está en `docs/FABRICA-IDENTIDADES.md`.

Presentación outdoor editorial, con seis nuevas fotografías humanas y dos
vídeos regenerados. Ver `docs/OLIVAR-REDISENO-360-2026-09-08.md` y ADR 0051.
