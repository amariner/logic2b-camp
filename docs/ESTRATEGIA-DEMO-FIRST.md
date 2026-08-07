# Estrategia demo-first — vender la tecnología antes de industrializarla

> Fuente de verdad aprobada por Andreu el **2026-08-06**. Mientras no exista
> un cliente contratado, Logic Camp construye primero el producto que se puede
> **ver, tocar y comprar**. La producción real se diseña y documenta, pero no
> desplaza el escaparate con infraestructura invisible.

La lectura competitiva que sustenta qué debe verse en esas demos está en
[`RESEARCH-PLATAFORMAS-RESERVA-2026.md`](RESEARCH-PLATAFORMAS-RESERVA-2026.md)
y el camino técnico para un cliente real en
[`DOSSIER-ACTIVACION-PRODUCCION.md`](DOSSIER-ACTIVACION-PRODUCCION.md).

## 1. Decisión

Logic Camp deja de usar como siguiente hito «tener todo el backend listo».
El siguiente hito es disponer de una colección de experiencias comerciales
que permita a un camping reconocerse, recorrer el valor y pedir una demo.

- El **frontend es el producto de venta**: web, motor representado, gestor,
  planning, plano, automatizaciones, inteligencia y materiales de campaña.
- El **backend de demo** solo sostiene la historia que se enseña: datos
  deterministas, estados creíbles, persistencia temporal y reset.
- CLI, aprovisionamiento industrial, integraciones reales, observabilidad,
  fiscalidad y endurecimiento multi-cliente quedan en un **dossier interno de
  activación** hasta que un cliente concreto los necesite.
- No se construye una pieza invisible «por si acaso». Se activa cuando existe
  cliente, requisito, credencial, proveedor y fecha de entrega.

Esto no autoriza a fingir producción. Toda capacidad no conectada se presenta
como **demostración**, **prototipo** o **roadmap**, nunca como servicio ya
operativo. Pagos, comunicaciones, facturación, SES.Hospedajes, canales e IA
usan datos y respuestas de muestra claramente identificados.

## 2. Regla de prioridad

El orden de desempate es:

1. Algo visible que mejora una conversación de venta o una demo guiada.
2. Un recorrido completo que permite al prospecto entender el resultado.
3. Calidad visible: móvil, velocidad, accesibilidad, materia, estados y relato.
4. Backend mínimo necesario para que ese recorrido sea convincente.
5. Documentación interna para convertir la demo en producción.
6. Infraestructura, CLI o integración real, solo con cliente o bloqueo de
   seguridad/datos que afecte a la propia demo.

Una tarea no gana prioridad por ser técnicamente profunda. Debe responder a
una pregunta comercial concreta: «¿qué verá el cliente que mañana no puedo
enseñarle?».

## 3. Portfolio en olas: 3 → 6 → 12

El destino del Frente D sigue siendo doce campings, pero no se construyen doce
backends. Se crea una fábrica visual y se valida en olas:

### Ola 1 — tres demos ancla

1. **Inicio / microcamping**: marca completa, web móvil, alojamientos,
   contenidos y formulario con confirmación de demo.
2. **Gestión / camping mediano**: web + solicitudes + portada del gestor +
   planning/plano navegables con datos sembrados.
3. **Visión / resort**: experiencia completa de reserva y operación, más
   automatización e inteligencia representadas como prototipo explícito.

Cada ancla responde a un tamaño, un problema y un nivel de ambición. Tras las
tres se revisan qué pantallas despiertan interés, qué objeciones se repiten y
cuánto cuesta producir una marca nueva.

### Olas 2 y 3

- **6 demos** cuando las tres primeras compartan una receta repetible.
- **12 demos** cuando la galería y las variantes aporten cobertura comercial
  real, no solo volumen visual.

La variedad vive en configuración, tema, contenido, inventario y dataset. Una
rama de código por camping está prohibida. Una D1 y un host por demo también
son opcionales: la primera ola puede compartir un runtime de demostración y
seleccionar escenario por ruta/configuración.

## 4. Contrato del backend de demo

Se elige el soporte más barato que haga creíble la interacción:

| Necesidad visible                   | Mecanismo de demo permitido               | No hace falta todavía               |
| ----------------------------------- | ----------------------------------------- | ----------------------------------- |
| Página, precio, ocupación o gráfico | Fixture/seed determinista                 | Pipeline de datos real              |
| Formulario o cambio de estado       | Adaptador demo con éxito/error controlado | Resend, colas o CRM reales          |
| Reserva, planning o plano           | API y D1 demo compartidas, con reset      | Infra por cada marca                |
| Pago                                | Flujo simulado y recibo marcado «demo»    | Stripe/Redsys operativos            |
| Factura, SES o canal                | Documento/estado de muestra               | Envío fiscal/legal/OTA              |
| IA, forecast o recomendación        | Escenario precalculado y explicable       | Modelo, RAG o agentes en producción |

No se añaden mocks aleatorios dentro de los componentes. Los escenarios salen
de seed, fixtures tipados o un adaptador demo común para que el frontend sea
estable, reproducible y sustituible por una integración real.

## 5. Qué significa «demo terminada»

Una demo es vendible cuando:

- tiene una identidad y una dirección de arte distinguibles;
- cuenta una historia de 5–12 minutos con principio, resultado y CTA;
- funciona a 375 y 1366 px, con teclado, foco y estados vacíos/error/éxito;
- permite recorrer el valor sin terminal, credenciales ni explicación técnica;
- no contiene botones muertos ni promesas ambiguas;
- identifica las simulaciones y puede restablecer el escenario;
- tiene capturas, miniatura, ficha comercial y enlace compartible;
- incluye su ficha interna de activación a producción.

## 6. Dossier interno de activación

Cada capacidad representada se documenta con esta plantilla antes de declararla
lista para enseñar:

| Campo                    | Contenido                                               |
| ------------------------ | ------------------------------------------------------- |
| Lo que ve el prospecto   | Pantalla, acción y resultado comercial                  |
| Cómo funciona en demo    | Seed, fixture, adaptador o persistencia temporal        |
| Qué falta en producción  | Servicio, seguridad, datos, pruebas y operación         |
| Disparador de activación | Cliente/requisito que justifica implementarlo           |
| Entradas externas        | Credenciales, proveedor, contrato y decisiones          |
| Criterio de aceptación   | Prueba verificable antes de entregar al cliente         |
| Riesgo y estimación      | Bajo/medio/alto y rango de esfuerzo, sin prometer fecha |

Inventario inicial del dossier:

- entrega de formularios, antispam y consentimiento;
- email/SMS/WhatsApp y plantillas;
- Stripe/Redsys, conciliación, reembolsos y webhooks;
- facturación/VeriFactu y exportación contable;
- SES.Hospedajes/INE y pre-check-in;
- channel manager/OTA, disponibilidad e idempotencia;
- migración, backups, restauración y observabilidad;
- dominios, tenants, D1, roles, secretos y aprovisionamiento;
- analytics, atribución y consentimiento;
- automatización, IA, costes, supervisión y evaluación.

Este dossier sustituye el impulso de implementar todas esas piezas ahora. Al
llegar un cliente, se copia su ficha de alcance, se eligen solo los módulos
contratados y se convierte cada fila necesaria en plan de entrega.

## 7. Lectura por los ocho roles

- **Arquitectura**: una fábrica visual compartida; adaptadores demo sustituibles;
  ninguna rama o backend artesanal por marca.
- **Fullstack**: recorridos verticales completos y clicables antes que capas
  horizontales invisibles.
- **Backend**: datos plausibles, contratos tipados, reset y estados fiables;
  producción queda especificada, no sobredesarrollada.
- **Frontend**: prioridad principal; expresa el producto actual y futuro con
  fidelidad visual, interacción y velocidad.
- **Product design**: cada demo responde a un ICP, problema y resultado; nada
  existe solo para rellenar una galería.
- **UX**: relato guiado, caminos cortos, estados comprensibles y CTA claro.
- **UI**: marcas realmente distintas, materia fotográfica y pantallas que se
  puedan vender mediante captura o vídeo.
- **SEO**: la landing comercial y los casos/arquetipos captan; los entornos de
  demo permanecen `noindex` mientras sean ficticios.

## 8. Secuencia inmediata

1. **D0-V ✅ — contrato visual de fábrica**: L'Olivar, Pinada del Mar y Mar de
   Fondo fijados en
   [`CONTRATO-VISUAL-OLA-1.md`](CONTRATO-VISUAL-OLA-1.md), con historia,
   pantallas, arte, activos y soporte demo mínimo.
2. **D1-V ✅ — primera demo Inicio**: L'Olivar completa marca, web, consulta
   sin red, bundle y capturas sin CLI ni infraestructura propia.
3. **D2-V — demo Gestión (siguiente)**: reutilizar la fábrica y mostrar web → solicitud →
   gestor/planning.
4. **D3-V — demo Visión**: representar automatización e inteligencia con
   escenarios honestos y explicables.
5. **D4-V 🟨 — escaparate de venta**: galería y comparador listos; pendientes
   guion/capturas/vídeo, ficha comercial y campaña de muestra.
6. Ampliar a seis y doce solo con aprendizaje comercial de las tres primeras.

Los frentes de producción quedan **diferidos, no cancelados**. Se reactivan
cuando una venta los convierte en entrega visible o compromiso contractual.
