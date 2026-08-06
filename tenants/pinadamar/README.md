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

El encargo de arte y el manifiesto de descarga de las 11 piezas viven en
`fotos.json`: cada clave es el **nombre de fichero** que la web ya espera en
`content/media/`. Dejar el `.webp` con ese nombre basta — no hay código que
tocar. Mientras una pieza no exista, su caja la ocupa `<Materia>`, el campo de
color de la paleta del propio camping.

```bash
node apps/web/scripts/fetch-fotos.mjs pinadamar
```

Requiere salida a internet: el contenedor cloud sale por lista blanca y contesta
403 a la CDN del generador. Generar sí se puede desde cloud; bajar, no.
