# 0031 — El gestor móvil se diseña por tareas, no encogiendo pantallas

- **Fecha**: 2026-08-04
- **Fase**: Frente M · Dashboard móvil
- **Estado**: **propuesto** (sesión autónoma, protocolo `docs/CONTINUA.md` §3;
  M0 solo mide y documenta, por lo que es de riesgo bajo y reversible)

## Contexto

El gestor nació para el mostrador a 1366 px. Después recibió una carcasa móvil
(barra superior y navegación en `Sheet`), pero sus pantallas conservan decisiones
de escritorio: tablas anchas, un tape chart de 90 días, paneles laterales de
360 px y acciones repartidas por la ficha. Corregir desbordes uno a uno no dice
si una recepcionista puede resolver desde el teléfono la urgencia que la llevó a
abrirlo.

La prioridad móvil declarada no pretende sustituir el escritorio: en el teléfono
se **consulta y se resuelve lo urgente**. El planning completo sigue siendo una
herramienta de recepción en pantalla grande.

## Decisión

### 1. La unidad de aceptación es una tarea completa

M0 audita recorridos y no capturas aisladas. La matriz mínima es:

| tarea                     | rol                    | resultado que debe poder alcanzar                                    |
| ------------------------- | ---------------------- | -------------------------------------------------------------------- |
| orientarse en la portada  | demo y recepción       | entender qué requiere atención hoy y abrirlo                         |
| tramitar una llegada      | recepción              | localizar reserva, abrir ficha, cobrar y hacer check-in              |
| tramitar una salida       | recepción              | localizar reserva y hacer check-out                                  |
| gestionar una solicitud   | recepción              | leerla y cambiar su estado                                           |
| buscar                    | demo y recepción       | abrir reserva, cliente o unidad desde la búsqueda global             |
| consultar planning        | demo y recepción       | saber qué pasa hoy y abrir una reserva                               |
| consultar plano           | demo y recepción       | localizar una unidad, manejar el mapa y abrir su ficha               |
| abrir gestión restringida | demo/recepción/manager | no ofrecer puertas que terminan en 403; explicar u ocultar según rol |

Las mutaciones se verifican contra el mismo servidor que usa el escritorio. La
UI nunca gana permisos ni calcula precios por ser móvil.

### 2. Tres anchos, dos roles operativos y un rol de control

- **320 px**: suelo; descubre contenido y controles que dependen por accidente
  de los 375 px de diseño.
- **375 px**: teléfono objetivo de trabajo.
- **430 px**: confirma que la solución no es un parche para un ancho exacto.
- **demo**: recorrido comercial anónimo y permisos excepcionales del ADR 0029.
- **reception**: operación diaria real.
- **manager**: control de las rutas que requieren gerencia; no es necesario
  repetir con él cada recorrido operativo.

Se auditan claro y oscuro donde el defecto dependa de contraste o estado, pero
no se multiplica toda la matriz por tema: el contraste ya tiene su suite propia.

### 3. Contrato medible

Cada recorrido registra, como mínimo:

1. **Desborde**: el documento no supera el viewport. Un lienzo que se desplaza
   dentro de un contenedor declarado puede hacerlo; la página entera, no.
2. **Objetivos táctiles**: acciones primarias y controles sin alternativa
   inmediata miden al menos **44 × 44 px**. Los iconos compactos secundarios se
   registran, no se inflan a ciegas si romperían la densidad.
3. **Lectura**: el dato crítico y la acción primaria aparecen sin scroll
   horizontal y sin depender de `title`/hover.
4. **Foco y teclado**: menú, búsqueda, panel y diálogos reciben foco visible,
   conservan su orden, cierran con Escape cuando corresponde y devuelven el foco
   al origen.
5. **Teclado en pantalla**: un campo enfocado no tapa su acción ni provoca zoom
   por texto menor de 16 px.
6. **Permisos**: un enlace visible debe abrir una pantalla útil para el rol. Un
   403 previsible en una puerta ofrecida es un fallo de navegación, aunque el
   backend esté protegiendo correctamente.

El resultado de M0 vive en `docs/AUDITORIA-MOVIL.md`: evidencia reproducible,
severidad, tarea afectada y fase M1–M6 que lo resuelve. M0 **no mezcla arreglos**;
su salida es el orden de implementación.

### 4. Prioridad de los hallazgos

- **P0**: acción peligrosa o fuga de permisos/datos.
- **P1**: impide terminar una tarea urgente en 320–375 px.
- **P2**: la tarea termina, pero exige scroll horizontal, precisión impropia del
  pulgar, pérdida de contexto o pasos evitables.
- **P3**: acabado visual o densidad sin bloqueo operativo.

M1–M6 se ordenan primero por P0/P1, después por frecuencia de mostrador. El
planning no se comprime: si el tape chart falla en móvil, M4 ofrece una agenda
explícita y conserva el chart para tablet/escritorio.

## Tensiones de las ocho lentes

- **Arquitectura/fullstack/backend**: el diagnóstico y las variantes responsive
  permanecen en el dashboard compartido; no crean una app móvil, endpoints
  paralelos ni configuración por camping.
- **Frontend/UX/UI**: 44 px y cero desborde son condiciones necesarias, no la
  definición completa de usabilidad; por eso se prueba el recorrido real y la
  recuperación del foco.
- **Producto**: el móvil resuelve urgencias y el escritorio conserva la operación
  densa. Duplicar todo el tape chart sacrificaría tiempo sin mejorar agosto.
- **SEO**: no aplica a la SPA autenticada; sí se vigila peso y carga inicial en
  M6 porque afectan a la primera apertura con cobertura móvil.

## Consecuencias

- M0 puede declarar una pantalla visualmente responsive y aun así fallida si no
  permite completar su tarea.
- Los arreglos se agrupan por patrón (panel, lista, agenda, mapa, carga) y no por
  camping ni por ancho exacto.
- La matriz completa no tiene por qué convertirse en una E2E permanente: se
  conservan como regresión automática las propiedades estables que cada fase
  arregle; el informe guarda la evidencia exploratoria del resto.
