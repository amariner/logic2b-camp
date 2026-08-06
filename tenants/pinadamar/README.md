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
