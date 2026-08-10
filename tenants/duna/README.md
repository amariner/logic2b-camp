# Camping La Duna

Demo comercial ficticia de **Logic Camp Inicio** sobre el carril técnico `tier: 1`.

- 20 plazas para furgoneta o autocaravana: 12 Base y 8 Duna.
- Español como lengua de arranque; sin motor, dashboard, Worker o D1 propio.
- El formulario usa `enquiryTransport: 'demo'`: no hace red ni persiste datos.
- Ruta prevista: `/demos/duna/`, siempre `noindex`.
- El gálibo, el suelo, el viento y el acceso a la pasarela forman parte del recorrido.

## Construir

```bash
TENANT=duna TIER=1 BASE_PATH=/demos/duna pnpm --filter @logic-camp/web build
```

Estados QA del formulario: `?demoState=error#contacto` y
`?demoState=spam#contacto`.

## Fotografía

El brief aprobado vive en `identity.json`; el encargo, la procedencia, las cuatro
tandas y los ocho papeles en `fotos.json`. Los finales solo entran después de la
inspección visual y la aprobación explícita del pipeline común.

```bash
pnpm fotos -- status duna
pnpm fotos -- ingest duna {pieza} /ruta/al/master.png codex-integrated {modelo}
pnpm fotos -- approve duna {pieza}
pnpm fotos -- derive duna
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.
