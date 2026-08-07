# Camping Resort Mar de Fondo

Demo comercial ficticia de **Logic Camp Visión** sobre el carril técnico
`tier: 3`.

- 300 unidades: parcelas, bungalows, mobil-homes y glamping.
- Español y motor compartido; no tiene Worker, D1, usuarios ni proveedores
  propios.
- Ruta prevista: `/demos/mardefondo/`, siempre `noindex`.
- Pago y Automatiza ya se representan con fixtures reversibles y los rótulos
  honestos del contrato visual. Inteligente sigue pendiente.
- `/demos/mardefondo/gestion/#/automatiza` revisa una respuesta propuesta,
  explica sus fuentes y límites y se detiene en «preparada»: nunca publica ni
  envía nada.

## Construir

```bash
TENANT=mardefondo TIER=3 BASE_PATH=/demos/mardefondo pnpm --filter @logic-camp/web build
```

## Fotografía

El encargo vive en `fotos.json`. En Codex se usa el modelo de imagen integrado
de mayor calidad disponible y se generan **como máximo dos imágenes por tanda**.
Cada pareja se inspecciona antes de lanzar la siguiente. Mientras no exista una
pieza final, `<Materia>` mantiene la web construible sin reciclar fotos de otro
camping.
