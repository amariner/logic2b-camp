# 0033 — Escalera comercial y plan Inicio sin gestor

- **Estado:** aceptado
- **Fecha:** 2026-08-05
- **Decisor:** Andreu
- **Frente:** E · Escalera comercial

## Contexto

La oferta pública vigente tiene Camp Web (69 €/mes + 1.490 € de alta), Camp
Solicitudes (119 €/mes + 2.490 €) y Camp Reservas (249 €/mes + 4.900 €). La
nueva dirección comercial quiere una entrada de campaña mucho más sencilla:
una web atractiva por 49 €/mes, sin coste inicial, cuyo formulario llegue al
correo de recepción y que no incluya gestor, motor ni base de datos del PMS.

Sobre esa entrada se plantea una escalera de cuatro niveles públicos:

1. Inicio · 49 €/mes.
2. Gestión · 149 €/mes.
3. Automatiza · 249 €/mes.
4. Inteligente · 399 €/mes.

El repositorio tiene una regla previa: el nivel 1 actual guarda las solicitudes
aunque el cliente no vea el dashboard. La nueva petición es diferente y no debe
simularse renombrando ese nivel: un plan sin persistencia ni D1 necesita un
contrato propio.

## Decisión propuesta

### 1. Cuatro niveles comerciales, capacidades acumulativas

La landing contará la progresión por resultado: conseguir consultas → controlar
el camping → ahorrar tiempo → decidir mejor. Subir conserva dominio, identidad y
los datos que existan, y activa capacidades en el mismo producto.

### 2. Inicio es un tier técnico nuevo, no Camp Web rebajado

Inicio publica únicamente los assets estáticos de la web del tenant. No incluye
D1, API de dominio, dashboard, motor, autenticación ni histórico. El build debe
probar que no emite sus rutas o chunks, igual que hoy se prueba el aislamiento
del motor en niveles bajos.

### 3. “Sin backend” significa sin backend de gestión

Un formulario HTML no puede entregar correo de forma fiable por sí solo sin
exponer credenciales o delegar el envío. Se elegirá una de estas dos vías antes
de implementar:

- **A · endpoint compartido Logic2B:** receptor mínimo, rate limit, Turnstile y
  envío transaccional; no persiste el contenido.
- **B · proveedor gestionado de formularios:** contrato por tenant o compartido,
  DPA, antispam y reenvío a recepción; no persiste más allá de lo contratado.

`mailto:` queda descartado: depende del cliente de correo del visitante, no
confirma entrega y es una conversión peor precisamente en una landing de
captación.

### 4. Alta cero exige alcance cerrado

Inicio tendrá plantilla, un idioma, un destinatario, contenido aportado mediante
formulario y compromiso mínimo de 12 meses o pago anual equivalente. Dominio,
redacción, fotografía, idiomas, migración y diseño a medida quedan fuera. Sin
esta condición, una baja temprana convierte cada cliente en trabajo manual no
remunerado y viola la restricción de alta escalable del proyecto.

### 5. Estados comerciales honestos

La landing puede enseñar la escalera completa, pero cada nivel declarará
`disponible`, `en desarrollo` o `próximamente`. Solo un nivel disponible tendrá
CTA de contratación; los demás llevarán a demo, lista de interés o roadmap.

## Alternativas descartadas

- **Rebajar Camp Web actual a 49 €.** Mantendría D1, API e histórico, por lo que
  no cumple el alcance pedido y abarata una arquitectura distinta.
- **Formulario `mailto:`.** No es un formulario fiable ni medible.
- **Alta cero sin permanencia ni onboarding limitado.** No recupera el trabajo
  inicial y no escala.
- **Publicar Automatiza e Inteligente como disponibles.** Mezcla producto actual
  con visión y expone a ventas a prometer funciones no terminadas.

## Consecuencias

- `docs/TIERS.md`, configuración, builds y pruebas deberán admitir el nuevo tier.
- La página de precios y `#niveles` pasan de tres/cuatro nombres históricos a
  cuatro niveles orientados a resultados.
- La antigua oferta no se borra hasta aceptar este ADR y recalibrar costes.
- El nivel 0 no aporta histórico para un upgrade; la landing debe decirlo sin
  insinuar continuidad de datos que nunca se guardaron.
- La vía de formularios se documentará en privacidad y en el registro de
  actividades antes de captar datos reales.

## Preguntas para aceptar

1. ¿Inicio exige 12 meses o se vende a 490 €/año?
2. ¿Un idioma y un destinatario son límites comerciales aceptables?
3. ¿Se prefiere endpoint compartido Logic2B o proveedor gestionado?
4. ¿Los precios 149/249/399 sustituyen la oferta vigente o son precios de
   lanzamiento sujetos a las primeras altas?
5. ¿Cuál es el nombre final: Inicio, Web Inicio o Camp Inicio?

## Resolución de Andreu (2026-08-05)

Andreu da prioridad a trasladar el concepto completo a la landing y autoriza
comenzar su implementación. Se adoptan los valores recomendados presentados
junto al ADR:

1. **Logic Camp Inicio**, 49 €/mes y alta 0 €.
2. Compromiso mínimo de 12 meses; alternativa 490 €/año.
3. Un idioma y un destinatario de recepción en el alcance base.
4. Endpoint compartido Logic2B, sin persistencia, como dirección técnica para
   E3; su seguridad y privacidad se detallarán antes de captar datos reales.
5. 149/249/399 € son precios de lanzamiento de Gestión, Automatiza e
   Inteligente. Automatiza e Inteligente se publican con estado explícito de
   desarrollo/roadmap mientras no cumplan su criterio de producto.

Con esta resolución, **E0 queda cerrado** y se autorizan E1 (precios) y E2
(escalera de la landing). E3 sigue siendo una fase técnica independiente.
