# 0008 — Dashboard y planning (Fase 6, sesiones 16–20)

- **Fecha**: 2026-07-19
- **Fase**: 6 · Dashboard
- **Estado**: aceptado (validación delegada por Andreu en sesión — misma delegación que el ADR 0007)

## Contexto

La API privada (`/api/admin`, ADR 0005) ya sirve todo lo que el dashboard pinta: el planning es un SELECT, las reservas tienen acciones tipadas y los roles están resueltos. Falta la SPA. El elemento firma es el **planning (tape chart)**: la pantalla que recepción mira 200 veces al día. Rápido antes que bonito; legible a 1366px; usable por teclado.

## Decisión

### 1. SPA en `/admin/` servida por el MISMO Worker

React 19 + Vite + TanStack Router + TanStack Query (stack cerrado). Build con `base: '/admin/'`; el deploy de la demo copia `apps/dashboard/dist` dentro de `apps/web/dist/admin/` — **un deploy = web + API + dashboard**, mismo dominio, misma cookie de sesión de Better Auth (nada de CORS ni tokens en JS).

- **Rutas con hash history** (`/admin/#/planning`): con salida estática no hay rewrites de servidor; el hash hace que cualquier deep-link cargue `index.html` sin tocar el Worker. Cuando haya motivo real, se migra a history normal con una regla de assets (anotado, no ahora).
- **Auth**: pantalla de login contra `/api/auth/sign-in/email` (cookie de sesión); `useSession` con Query consulta `/api/auth/get-session`; sin sesión → login. Los roles ya los aplica el servidor — la UI solo esconde lo que el rol no puede hacer.
- **i18n**: textos vía diccionario `t()` desde el primer día (regla del contrato). El dashboard arranca en `es` (la usuaria es la recepcionista); el resto de idiomas son un fichero más, no un refactor.
- **Estilo**: Tailwind v4 con los mismos tokens de la demo (copiados como CSS vars del dashboard; la tenant-ización real llega en Fase 9). Densidad sin ruido.

### 2. Planning ★ — virtualización propia de FILAS + barras absolutas

- **Malla**: filas = unidades (300 objetivo), columnas = días (90 objetivo). Celda de ancho fijo por nivel de zoom (semana 96px · mes 42px · temporada 22px), fila de 32px.
- **Virtualización con `@tanstack/react-virtual` SOLO de filas**: ~40 filas visibles × 90 días. Las reservas NO se pintan por celda: cada fila pinta sus barras (pocas) posicionadas absolutamente por índice de día (`left = díaIdx × ancho`, `width = noches × ancho`). Coste por frame: decenas de nodos, no miles.
- **Cabecera de fechas y columna de unidades sticky** (scroll sincronizado en un solo contenedor con `position: sticky`); separadores de mes y fin de semana sombreado.
- **Colores por estado** (tokens, no hex nuevos): confirmed=pino · pending=arena · no_show=mar · completed=tinta-suave · bloqueos=rayado gris con motivo. Reservas sin unidad asignada → bandeja "sin asignar" encima de la malla.
- **Drag & drop de reasignación con Pointer Events nativos** (sin librería): arrastrar una barra verticalmente a otra fila del MISMO tipo → `POST /api/admin/bookings/:id` `{action:'reassign', unitId}` con actualización optimista y rollback si el servidor devuelve 409 (el servidor re-valida solapes SIEMPRE — la UI nunca decide). Teclado: barra enfocable, ↑/↓ mueve la selección de unidad, Enter confirma. Mover fechas arrastrando NO entra en v1 (la modificación existe vía acciones).
- **Zoom** semana/mes/temporada = cambiar el ancho de celda (misma malla, sin re-arquitectura).

### 3. Reparto en sesiones (16–20)

1. **16**: ADR + scaffold + login + planning v1 (lectura: malla virtualizada, colores, bloqueos, zoom) ← esta sesión
2. **17**: planning v2 (drag&drop reasignación + teclado + bandeja sin asignar) + ficha de reserva (panel lateral con acciones tipadas)
3. **18**: solicitudes (bandeja + convertir en reserva) + llegadas/salidas del día — el **modo lite completo** (niveles 1–2 sin motor)
4. **19**: reservas (lista + alta manual), inventario, tarifas con previsualización "familia de 4 con perro"
5. **20**: clientes RGPD, informes (ocupación/ADR/RevPAR), ajustes + usuarios, onboarding checklist

## Alternativas descartadas

- **Librería de grid/DnD** (AG Grid, dnd-kit…): peso y abstracción para un caso que es una malla fija de fechas; el DnD necesario (vertical, misma columna de tipo) son 40 líneas de pointer events.
- **Virtualizar también columnas**: 90 celdas de cabecera no lo justifican; complica el sticky. Si algún camping pide vista año (365 días), se revisa.
- **Dashboard en subdominio aparte**: rompería "un deploy", exigiría CORS + cookies cross-site con Better Auth. El path `/admin/` es más simple y más barato de operar.
- **history API con rewrites**: exige tocar el Worker para servir `index.html` en `/admin/*`; el hash lo da gratis hoy sin renunciar a migrar mañana.
