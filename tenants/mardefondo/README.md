# Camping Resort Mar de Fondo

Demo comercial ficticia de **Logic Camp Visión** sobre el carril técnico
`tier: 3`.

- 300 unidades: parcelas, bungalows, mobil-homes y glamping.
- Español y motor compartido; no tiene Worker, D1, usuarios ni proveedores
  propios.
- Ruta prevista: `/demos/mardefondo/`, siempre `noindex`.
- Pago, Automatiza e Inteligente se representan con fixtures reversibles y los
  rótulos honestos del contrato visual.
- `/demos/mardefondo/gestion/#/automatiza` revisa una respuesta propuesta y un
  parte interno de incidencias con periodo, áreas, severidad, fuentes y límites.
  Ambos se detienen en «preparado»: nunca publican, entregan ni abren tickets.
- `/demos/mardefondo/gestion/#/inteligente` explica una recomendación de
  ocupación derivada del propio escenario, con periodo, fuentes, rango y
  limitaciones. Solo permite descartarla o dejar el cambio preparado: nunca
  modifica tarifas, inventario ni reservas.

## Construir

```bash
TENANT=mardefondo TIER=3 BASE_PATH=/demos/mardefondo pnpm --filter @logic-camp/web build
```

## Fotografía

El encargo vive en `fotos.json` y el historial reproducible en
`fotos.estado.json`. Codex integrado es el proveedor principal; después de dos
fallos técnicos sin bytes, el circuito del manifiesto se abre y los lotes
restantes pasan de forma explícita a Higgsfield. Dos rechazos visuales de una
pieza cambian de `soul_location` a GPT Image 2 dentro de esa misma cuenta. Nunca
se generan más de **dos imágenes por tanda** ni se avanza mientras haya una
pareja pendiente de revisión.

```bash
pnpm fotos -- status mardefondo
pnpm fotos -- run mardefondo
# tras inspeccionar las imágenes de content/media/.staging/
pnpm fotos -- approve mardefondo
# o conservar el descarte y abrir una nueva tentativa
pnpm fotos -- reject mardefondo hero-laguna "motivo"
```

`run` reutiliza un trabajo idéntico ya existente antes de gastar créditos,
valida descarga, dimensiones y proporción, y deja el WebP en `.staging`.
Solamente `approve` lo mueve a `content/media/`, que es lo que consume la web.
Mientras no exista una pieza final aprobada, `<Materia>` mantiene la web
construible sin reciclar fotos de otro camping.

Brief aprobado en `identity.json`; la receta local completa y sus presupuestos
están en `docs/FABRICA-IDENTIDADES.md`.
