# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar D1-V (sesión 82, 2026-08-06). L'Olivar ya prueba Inicio;
> la siguiente sesión debe demostrar que la fábrica escala a Gestión.

## Estado en una línea

L'Olivar vive en el bundle compuesto como demo estática completa, con consulta
sin red y tres capturas. El siguiente salto es Pinada del Mar: una historia
continua desde la web hasta solicitud, planning, plano y ficha del gestor.

## Objetivo único de la próxima sesión: D2-V · Pinada del Mar

Implementar de extremo a extremo la demo Gestión conforme a
`docs/CONTRATO-VISUAL-OLA-1.md` §4 y §9:

1. Crear `tenants/pinadamar` con identidad propia —pinada litoral, no un reskin
   de L'Olivar ni fotos de Cala—, unas 110 unidades y contenido base en español.
2. Producir/validar el lote mínimo de diez fotos en cola y un plano propio: mar
   al este, recepción/acceso, dos calles de parcelas, anillo de bungalows y
   servicios.
3. Crear un dataset determinista de Gestión con 35–50 solicitudes en cuatro
   idiomas, agosto denso, llegadas/salidas y al menos una unidad fuera de
   servicio. Todo dato personal es ficticio y el reset queda visible.
4. Extender el transporte demo con persistencia **temporal y reversible** para
   que una solicitud web recién creada aparezca en el gestor, sin mensajes,
   pagos, credenciales ni infraestructura por marca.
5. Completar el recorrido: nueva → contactada → convertida, estancia enfocada
   en planning, salto al plano conservando fecha/unidad y retorno a ficha.
6. Integrar `/demos/pinadamar/` y su entrada de gestor en el bundle compuesto,
   siempre `noindex`, sin tocar el aislamiento productivo por D1.
7. Verificar los estados obligatorios del contrato, 375/1366, teclado/foco,
   reduced motion, contraste, enlaces, bundle y tres capturas firma.
8. Medir por separado materia/contenido, tenant/config, dataset, unión web ↔
   gestor, QA e integración para comparar con los ~0,42 h automatizados de D1-V
   (la generación previa de fotos de L'Olivar no entró en esa cifra).

## Hecho cuando

- El guion de 8 minutos se recorre desde un enlace y no necesita terminal,
  login manual, credenciales ni explicación técnica.
- La solicitud creada en la web aparece en la portada/bandeja y sus cambios son
  reversibles y están etiquetados como demo.
- Planning, plano y ficha comparten la misma estancia, fecha y unidad.
- El escenario se reconoce como camping costero mediano bajo pinada, no Cala
  Sereno ni L'Olivar.
- El bundle y `pnpm check` están verdes y quedan tres capturas comerciales.

## Regla de alcance

- No abrir Mar de Fondo, Automatiza, Inteligente ni la galería D4-V.
- No construir D1/Worker/usuarios por marca ni configurar email, pagos,
  analytics o integraciones reales.
- Reutilizar estructura, fuentes, transporte y pipeline de L'Olivar; no su copy,
  paleta, fotografías o geografía.
- Si el enlace web → gestor exige una decisión de aislamiento no resuelta,
  escribir el ADR mínimo antes de implementar y mantener la demo reversible.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
