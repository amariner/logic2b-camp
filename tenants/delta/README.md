# Camping El Delta

Demo comercial ficticia de **Logic Camp Inicio** sobre el carril técnico `tier: 1`.

- 16 parcelas: 10 Cañizo y 6 Arrozal, para tienda, camper o autocaravana compacta.
- Español como lengua de arranque; sin motor, dashboard, Worker o D1 propio.
- El formulario usa `enquiryTransport: 'demo'`: no hace red ni persiste datos.
- Ruta prevista: `/demos/delta/`, siempre `noindex`.
- La temporada corta, el suelo, el silencio y los caminos del humedal forman parte del recorrido.

## Construir

```bash
TENANT=delta TIER=1 BASE_PATH=/demos/delta pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y
`?demoState=spam#contacto`.

## Fotografía

El brief aprobado vive en `identity.json`; el encargo, la procedencia, las cuatro
tandas y los ocho papeles en `fotos.json`. Los finales solo entran después de la
inspección visual y la aprobación explícita del pipeline común.

```bash
pnpm fotos -- status delta
pnpm fotos -- ingest delta {pieza} /ruta/al/master.png codex-integrated {modelo}
pnpm fotos -- approve delta {pieza}
pnpm fotos -- derive delta
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
