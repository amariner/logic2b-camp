# 0019 — Desbloqueo: HMR del dashboard y seed denso (Frente C, fase C0)

- **Fecha**: 2026-07-20
- **Fase**: Frente C — C0 (desbloqueo)
- **Estado**: **aceptado e implementado** (2026-07-20 — Andreu: "pues dale caña"). Ver §Resultado medido al final.

## Contexto

El Frente C se abre con prioridad declarada en **la parte visual, en modo fake** (Andreu, 2026-07-20). La auditoría de `docs/FRENTE-C-ACABADO.md` §0 midió el estado real y dejó dos hallazgos que **no son features, son condiciones de trabajo**: sin resolverlos, todas las fases siguientes se hacen a ciegas y sobre un lienzo vacío.

**1. El dashboard no tiene HMR.** `POST /api/auth/sign-in/email` devuelve **403** desde el dev server de Vite (`:5173`); la misma petición contra el Worker (`:8787`) devuelve 200 + cookie. No son las credenciales: es Better Auth rechazando el origen cruzado, porque `apps/api/src/auth.ts` no declara `trustedOrigins` y el proxy de Vite manda `Origin: http://localhost:5173`. En producción el dashboard vive en `/admin/` del **mismo** Worker, así que nunca se detectó — y **no está documentado en ninguna parte**, que es justo por lo que nadie se topó con ello antes. Hoy la única vía es compilar y servir desde el Worker: iterar en ~40s en vez de en ~1s. Para un frente cuyo objetivo es afinar interfaz, eso es el cuello de botella dominante.

**2. El planning está vacío, y es el elemento firma.** Verificado en vivo contra el Worker: _83 unidades · 29 reservas a la vista_; de `A-09` hacia abajo, nada, en pleno agosto. El ROADMAP lo pedía desde la Fase 6 (_"debe verse ESPECTACULAR: 83 unidades × agosto lleno"_) y nunca se hizo. Un director de camping mira eso y ve un negocio sin clientes: **la pantalla más importante del producto está enseñando el peor dato posible.** Además bloquea trabajo aguas abajo — C1 (gestos del planning) se diseñaría sobre una rejilla en blanco, C5 capturaría un planning vacío para la landing, y C7 (plano) enseñaría un camping desierto.

Restricciones que gobiernan (§0 del super prompt): ~6h/semana y **nada que multiplique trabajo por cliente**. Y la regla dura que este ADR no puede relajar: **"modo fake" se resuelve en el seed, nunca con mocks en el cliente**. Hoy el dashboard tiene **0 mocks** (0 `faker`, 0 fixtures, 0 `msw`) y todas las pantallas hablan con la API real — eso es un activo y no se toca.

## Decisión

C0 son **dos cambios acotados y sin superficie de producto nueva**: habilitar el origen local de desarrollo de forma fail-closed, y densificar el seed de la demo respetando su determinismo y sus invariantes.

---

### 1. `trustedOrigins` de desarrollo — fail-closed y sin valor configurable

El riesgo obvio de "arreglar el 403" es abrir orígenes en producción. El diseño lo evita por tres capas:

**1.1 — La lista de orígenes es una constante del código, no un valor de configuración.**

```ts
// apps/api/src/auth.ts
// SOLO desarrollo local. La lista es CONSTANTE a propósito: la variable de
// entorno actúa como interruptor, nunca como valor. Aunque el flag se colara
// en producción, lo único que autorizaría es localhost — inútil para un
// atacante remoto. En producción el dashboard es MISMO ORIGEN (/admin/ del
// propio Worker) y esta lista debe quedar vacía.
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
```

Nada de `DEV_ORIGINS=<lo que sea>`: una variable con valor libre es una puerta con cerradura de plástico. Como interruptor booleano sobre una lista fija, el peor caso posible es autorizar `localhost` — que un atacante remoto no controla.

**1.2 — El interruptor no vive en ningún fichero que se despliegue.**

Se pasa por CLI en `.claude/launch.json`, no en `tenants/*/wrangler.jsonc`:

```jsonc
"runtimeArgs": ["-lc", "… wrangler dev --var LOGIC_CAMP_DEV_ORIGINS:1 …"]
```

Motivo: `tenants/demo/wrangler.jsonc` es **el mismo fichero** que despliega a producción (`wrangler deploy --config …`). Cualquier `var` que se añada ahí **viaja a producción**. Pasándolo por `--var` en el comando de dev, el flag no existe en ningún artefacto desplegable.

**1.3 — Fail-closed.** Ausencia del flag → `trustedOrigins: []`. Nunca hay un default permisivo.

**Verificación exigida para dar C0.1 por hecho:**

- Login OK en `:5173` con HMR vivo.
- Login sigue OK en `:8787`.
- `wrangler deploy --dry-run` del tenant demo **no contiene** `LOGIC_CAMP_DEV_ORIGINS`.
- Test que fije el contrato: **sin el flag, un `Origin` de `:5173` sigue dando 403.** El agujero se abre solo cuando se pide explícitamente.

**1.4 — Documentar el flujo de dev del dashboard** en `apps/dashboard/README.md`, que hoy no existe. El 403 costó media hora de diagnóstico por no estar escrito.

---

### 2. Seed denso — una temporada que respira

Objetivo: que el planning en zoom "Temporada" muestre **la forma de una temporada real**, no una rejilla en blanco. Sigue siendo `tenants/demo/seed.ts`, determinista, con sus tests de invariantes verdes.

**2.1 — Ocupación por curva, no plana.** La forma es el argumento de venta:

| Periodo            | Ocupación objetivo |
| ------------------ | ------------------ |
| Agosto             | ~90–95 %           |
| Julio              | ~75 %              |
| Junio · Septiembre | ~45 %              |
| Mayo · Octubre     | ~20 %              |

Más **sesgo de fin de semana** en temporada media (viernes/sábado notablemente por encima). Es lo que hace que un profesional reconozca sus propios datos.

**2.2 — Textura, no relleno uniforme.** Lo que distingue un seed creíble de uno generado:

- **Huecos de 1 noche** entre reservas — el hueco que todo camping odia y que justifica el producto.
- **2–3 unidades fuera de servicio** por avería (`inventory_blocks`): el planning ya sabe pintarlas y hoy casi no se ven.
- **Mezcla de estados**: mayoría confirmadas, un puñado pendientes de pago, 1–2 no-shows, alguna cancelada reciente. Que el color del planning **tenga algo que diferenciar** (y que C1.5 tenga material sobre el que decidir el mapa de color).
- **Duraciones variadas**: la de 14 noches de agosto, el fin de semana de 2, el mes entero del residente de temporada.
- **Procedencias variadas** (ES, FR, DE, NL, GB): refuerza el multi-idioma sin decir una palabra, y da material a C4.2 (documentos).

**2.3 — Restricción de ingeniería que condiciona el diseño (y que casi se nos pasa).**

El reset nocturno (`tenants/demo/reset.ts:58`) ejecuta **wipe + reseed en un único `db.batch()`**, deliberadamente, para que sea atómico ("un reset a medias sería peor que no resetear", ADR 0013). Hoy son **321 sentencias**. Subir la ocupación ~20× llevaría el batch a **varios miles de sentencias dentro de un Worker con límite de CPU** — es decir, **densificar el seed puede romper el reset nocturno de la demo**, que es justo la pieza que mantiene viva la herramienta de ventas.

Decisión: **`seedToSql` emite `INSERT` multi-fila** (una sentencia con N tuplas `VALUES` por tabla, troceada a un tamaño seguro) en vez de una sentencia por fila. Así el número de **sentencias** queda acotado aunque el número de **filas** crezca 20×, y el batch sigue siendo atómico.

Verificación exigida: medir el tiempo real del reset contra el Worker **después** de densificar, no asumirlo. Si no cabe, la alternativa es reducir el horizonte sembrado (una ventana alrededor de hoy en vez de la temporada entera), no romper la atomicidad.

**2.4 — Lo que no se toca.**

- **Determinismo**: el reset nocturno depende de él. Nada de `Math.random()` sin semilla.
- **Tests de invariantes del seed**: verdes antes y después. En particular el nº 1 (no dos reservas solapadas en una unidad), que es exactamente lo que más se tensa al subir la ocupación al 95 %.
- **`_template`**: la densidad es de la **demo**, no del template. Un camping nuevo no arranca con 800 reservas inventadas.
- **Cero mocks en cliente.** Todo esto es dato real en la D1 real.

---

## Consecuencias

**Positivas**

- El resto del Frente C se diseña con HMR y sobre un lienzo que se parece a un camping en agosto.
- C1 (gestos), C5 (capturas para la landing) y C7 (plano) dejan de estar bloqueados por falta de datos.
- El planning pasa de ser el peor argumento visual a ser el mejor, sin escribir una línea de UI.
- Se documenta un flujo de dev que no estaba escrito en ninguna parte.

**Negativas / riesgos aceptados**

- Se toca `auth.ts`, que es código sensible. Mitigado con lista constante, flag no desplegable, fail-closed y un test que fija el contrato.
- El reset nocturno se vuelve más pesado. Mitigado con INSERT multi-fila y **medición obligatoria**; si no cabe, se recorta horizonte, no atomicidad.
- Un seed más grande hace `db:reset && db:seed` más lento en local. Aceptable.
- Subir a ~95 % de ocupación estresa el generador: encontrar hueco sin solapar se vuelve más difícil. Es trabajo real, no trivial.

## Alternativas descartadas

- **Deducir "dev" de la ausencia de `AUTH_SECRET`.** Tentador y de una línea, pero **falla abierto**: olvidar el secret en producción abriría orígenes. Descartado por dirección del fallo.
- **Variable con valor libre (`DEV_ORIGINS=<url>`).** Un despiste o una PR mal revisada autoriza un dominio arbitrario. La lista constante hace ese error imposible de expresar.
- **CORS abierto en el proxy de Vite.** No resuelve nada: el 403 lo emite Better Auth, no el navegador.
- **Renunciar al HMR y seguir compilando contra el Worker.** Es el statu quo. Para un frente de trabajo visual, es el coste más caro que podíamos elegir.
- **Fabricar el planning lleno con datos mock en el cliente.** Sería "modo fake" en el sentido malo: rompería la propiedad de 0 mocks, no serviría para probar rendimiento real, y no alimentaría ni al plano (C7) ni a los informes.
- **Renunciar a la atomicidad del reset** (batches troceados). Reintroduce el fallo que el ADR 0013 cerró a propósito.

## Qué queda fuera de C0

Todo lo demás del Frente C, explícitamente: gestos del planning (C1), Radix y primitivos del DS (C2), skeletons/toasts/error boundaries (C3), check-in y huéspedes (C4), fotos de Higgsfield (C5), documentación (C6) y plano del camping (C7). C0 **solo** desbloquea.

Tampoco entra aquí el arreglo de **C-BUG-1** (`--chart-*` light desplazados) ni **C-BUG-2** (`--color-mar` = foreground): pertenecen a C1.5/C2, aunque se hayan detectado ahora.

---

## Resultado medido (2026-07-20, implementación)

**C0.1 — HMR.** Login OK en `:5173` con HMR vivo, y sigue OK en `:8787`. El flag no aparece en ningún `wrangler.jsonc`; en git solo vive en `.claude/launch.json`, `auth.ts`, `tenant.ts` y el test. 3 tests nuevos fijan el contrato en sus dos direcciones (sin flag → 403; con flag → localhost 200 y `atacante.example` 403). Flujo documentado en `apps/dashboard/README.md`.

**C0.2 — Seed denso.** De **40 → 2.032 reservas** (906 confirmadas, 990 completadas, 107 pendientes, 28 canceladas, 1 no-show). En el planning: de **25 → 346 reservas a la vista**, todas las filas pobladas.

Curva de ocupación real medida (noches-unidad / capacidad):

| abr  | may  | jun  | jul  | **ago**  | sep  | oct  |
| ---- | ---- | ---- | ---- | -------- | ---- | ---- |
| 12 % | 26 % | 51 % | 73 % | **86 %** | 55 % | 11 % |

Agosto queda en 86 % y no en el 93 % nominal porque los 4 bloqueos —dos de ellos de temporada completa— retiran capacidad real. Es honesto: el planning refleja el inventario que de verdad se puede vender.

### Tres cosas que se aprendieron implementando

1. **Ocupación ≠ probabilidad de arranque.** El primer intento puso `p = 0.45` para junio y salió **66 %** real: cada estancia colocada ocupa después N noches. Se corrigió invirtiendo la fórmula (`startProbability`), de modo que la constante del código dice lo que significa. Sin esto los hombros de la curva quedaban inflados ~20 puntos.
2. **El límite de D1 es de bytes, no de filas.** El troceado inicial por nº de filas (200) reventó con `SQLITE_TOOBIG`: las filas de `bookings` llevan el `price_breakdown` JSON entero y son órdenes de magnitud más grandes que las de `booking_guests`. Se trocea por **presupuesto de bytes** (48 KB), que además se autoajusta por tabla. Resultado: **8.155 → 54 sentencias**, reset nocturno verde contra D1 real.
3. **El invariante 1 cazó un solape real.** Las reservas de caso límite se colocan _antes_ del recorrido y eligen unidad ellas solas; el bucle no las conocía y las pisaba. El test lo detectó en el primer intento — exactamente para lo que está.

Colateral: los 3 tests nuevos gastaban cupo del rate limiter por IP y tumbaban un `signIn` posterior con 429. Se les dio IP propia para no perturbar el presupuesto compartido.

`pnpm check` **verde (41/41)**.
