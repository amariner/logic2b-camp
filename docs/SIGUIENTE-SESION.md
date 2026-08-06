# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar D0-V (sesión 81, 2026-08-06). La primera ola ya tiene
> contrato; la siguiente sesión produce su primera prueba: L'Olivar.

## Estado en una línea

Inicio, Gestión y Visión ya son tres encargos concretos. El siguiente salto es
convertir L'Olivar en una demo Inicio compartible que pruebe la receta visual
sin motor, dashboard, D1 ni credenciales.

## Objetivo único de la próxima sesión: D1-V · L'Olivar

Implementar de extremo a extremo la primera demo Inicio conforme a
`docs/CONTRATO-VISUAL-OLA-1.md` §3 y §9:

1. Crear `tenants/olivar` desde `_template`: nivel comercial 0 sobre el carril
   técnico `tier: 1`, español, 18 parcelas, 4 tiendas premontadas y solo los
   datos necesarios para la web. No renombrar los tiers técnicos.
2. Producir/seleccionar como conjunto los ocho activos fotográficos del contrato
   y derivar wordmark tipográfico, favicon, OG y miniatura. No usar fotos de
   Cala Sereno o Azahar.
3. Completar tema y contenido: home, alojamientos, ficha de tienda,
   instalaciones, entorno, tarifas, contacto y legales, sin `__TODO__`.
4. Añadir al contrato web un transporte tipado de consultas: `persisted`
   conserva el comportamiento actual y `demo` ofrece éxito normal y
   error/antispam deterministas para QA, con cero red/persistencia de PII y
   mensaje visible «Demostración: no enviaremos tus datos». El transporte
   productivo `email` permanece diferido al primer cliente.
5. Integrar un build `TENANT=olivar TIER=1 BASE_PATH=/demos/olivar`, con
   `noindex`, sin rutas/chunks del motor y sin exigir D1/Worker propios.
6. Verificar 375/1366 px, teclado, foco, reduced motion, contraste, estados,
   imágenes/enlaces, bundle real de nivel 1 y tres momentos capturables.
7. Medir horas en identidad/contenido, configuración, interacción, QA y
   publicación; actualizar el contrato si la implementación desmiente la receta.

## Hecho cuando

- El recorrido de 5 minutos funciona desde un enlace y no necesita explicación
  técnica, terminal, login ni credenciales.
- La demo se reconoce como interior seco/olivar en una captura sin contexto.
- El formulario demuestra éxito/error sin enviar ni guardar datos personales.
- El bundle técnico tier 1 no incluye motor, reserva, pago ni dashboard y la
  interfaz lo presenta como Inicio/nivel comercial 0.
- Todo lo ficticio se declara como demostración y la ruta está en `noindex`.
- Quedan OG, miniatura y capturas 375/1366 listas para la futura galería.
- `pnpm check` está verde y D2-V recibe una receta medida, no supuesta.

## Regla de alcance

- No abrir Pinada del Mar, Mar de Fondo ni la galería en esta sesión.
- No construir receptor real, Resend, antispam productivo, analytics, CLI,
  aprovisionamiento ni infraestructura por demo.
- No introducir una fuente nueva ni un segundo sistema visual; reutilizar
  Clash/Inter y la estructura de `apps/web`.
- Si la producción de fotos depende de una herramienta externa no disponible,
  cerrar primero estructura, contenido, tema y briefs exactos, documentar el
  bloqueo y no sustituirlos por assets incoherentes.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
