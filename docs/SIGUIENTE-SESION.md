# Prompt para la siguiente sesión — vídeo H1-V tras publicación de temas

> Actualizado el 2026-08-18 tras publicar el cierre de H1/H2/H3.

## Estado en una línea

H3 queda 5/5: La Carrasca, Serralta, Els Tarongers, Entre Vinyes y Sol d'Hivern
tienen cuatro papeles humanos aprobados, bloque de vida, recepción y servicio en
uso, tres planes prudentes y QA real 375/1366. H1 permanece 3/3 y H2, 5/5. Todo
está publicado en producción en la versión Cloudflare
`bf56617c-c499-4a92-87d1-388c0165f382`. H1-V se ha abierto con un prototipo de
L'Olivar, pero el proveedor lo rechazó dos veces antes de generar bytes por
saldo insuficiente; el fallback estático continúa completo.

## Evidencia cerrada

- fotos finales locales: Cala 16/16, Duna 12/12, Delta 12/12, Riu Clar 12/12
  y Ballena 14/14;
- veinte escenas H2 generadas una a una con OpenAI integrado, inspeccionadas e
  ingeridas mediante staging/aprobación; los descartes siguen auditables;
- cinco bloques de vida y quince tarjetas de ruta con duración, dificultad,
  salida, mejor momento, recomendación y aviso de condiciones variables;
- recepción y al menos un servicio humano por tema; CTA visible desde
  instalaciones a contacto;
- contratos compartidos para foto explícita y recepción, rótulos de ruta por
  locale y validación de runtime en el chequeo de fábrica;
- contacto Logic2B de 48×48 px en móvil y escritorio, nombre accesible y
  expansión por hover/foco, sin tapar títulos ni formularios;
- Riu Clar conserva catalán y Ballena mantiene su flujo tier 3 de reserva;
- typecheck sin diagnósticos, builds aislados y contrato de fábrica verdes;
  `pnpm check` termina 71/71 y construye los doce campings.
- H3 suma veinte escenas, cinco bloques de vida y quince rutas; Carrasca,
  Serralta, Tarongers, Vinyes y Sol d'Hivern cierran sus manifiestos en 14/14.
- `HeroMedia` anuncia MP4/WebM con el MIME correcto y detiene o reanuda un vídeo
  si cambian en vivo movimiento reducido o ahorro de datos; web typecheck, tests
  de fábrica y los doce builds quedan verdes.
- nueve pruebas fijan hidratación, fallback, MIME, trazabilidad, huella, audio,
  duración, `yuv420p`, recorte, presupuesto y `faststart`; el verificador informa
  0 tenants con vídeo aprobado y mantiene intactos todos los pósteres.
- cinco pruebas adicionales fijan el pipeline de staging: normalización H.264
  sin audio, candidato fuera del runtime, aprobación atómica con manifiesto,
  rechazo auditable y prohibición de reutilizar el apaisado como móvil.
- las tres anclas tienen ya un póster vertical 9:16 propio: `<picture>` lo sirve
  solo bajo 640 px y los preloads móvil/escritorio son excluyentes. QA real en
  L'Olivar, Pinada del Mar y Mar de Fondo confirma la fuente vertical a 375 px,
  el regreso al apaisado en escritorio, cero desborde y cero avisos de consola;
  el build del portfolio fija también ese contrato en el HTML final.
- producción responde 200 en landing, catálogo, las tres anclas, Sol d'Hivern,
  Cala Sereno, gestor y API; el HTML remoto contiene los nuevos activos.

## La Carrasca cerrada

- manifiesto 14/14 y cuatro escenas H3 generadas una a una con OpenAI
  integrado, inspeccionadas y aprobadas en el pipeline;
- llegada de una pareja madura, explicación de reglas en recepción, uso
  tranquilo de la piscina del claro y paseo por el encinar;
- bloque de vida, recepción y piscina con foto explícita, CTA de contacto y
  tres rutas con rótulos completos y aviso de condiciones variables;
- typecheck sin diagnósticos, contrato de fábrica y build tier 3 verdes;
- QA real 375/1366: cero desborde o imagen rota, cero error de consola y
  contacto Logic2B de 48×48 px sin tapar el contenido.

## Serralta cerrada

- manifiesto 14/14 y cuatro escenas H3 finales generadas una a una con OpenAI
  integrado; dos llegadas rechazadas por límite de parcela y matrícula quedan
  conservadas en la auditoría;
- llegada tras lluvia, parte de rutas en recepción, fuego común supervisado y
  tres senderistas adultos dentro del trazado;
- bloque de vida, recepción y fuego con foto explícita, CTA de contacto y tres
  rutas con desnivel, retirada y aviso de condiciones variables;
- typecheck sin diagnósticos, contrato de fábrica y build tier 2 verdes;
- QA real 375/1366: cero desborde o imagen rota, cero error de consola y
  contacto Logic2B de 48×48 px sin tapar escenas, rutas o CTA.

## Els Tarongers cerrado

- manifiesto 14/14 y cuatro escenas H3 generadas una a una con OpenAI integrado,
  inspeccionadas y aprobadas en el pipeline sin descartes;
- llegada de una familia bajo cítricos, orientación de sombra y acceso en
  recepción, pausa intergeneracional al borde de la piscina y salida familiar
  en bicicleta por la huerta;
- bloque de vida, recepción y piscina con foto explícita, CTA de contacto y tres
  rutas con acceso, calor, trabajos agrícolas, aparcamiento y mar tratados como
  condiciones variables;
- typecheck sin diagnósticos, contrato de fábrica y build tier 1 verdes;
- QA real 375/1366: cero desborde o imagen rota, cero `warn`/`error` de consola,
  recortes humanos legibles y contacto Logic2B de 48×48 px sin tapar contenido.

## Entre Vinyes cerrado

- manifiesto 14/14 y cuatro escenas H3 finales generadas una a una con OpenAI
  integrado; una variante de patio y otra de entorno rechazadas quedan
  conservadas en la auditoría;
- llegada de dos amigos dentro de parcela, orientación de accesos de vendimia,
  patio usado solo para agua y sombra, y tres caminantes separados del cultivo
  y de un tractor distante;
- bloque de vida, recepción y patio con foto explícita, CTA de contacto y tres
  rutas que diferencian camino público, visita externa a bodega y vía verde;
- typecheck sin diagnósticos, contrato de fábrica y build tier 2 verdes;
- QA real 375/1366: cero desborde o imagen rota, tarjetas de ruta equilibradas,
  cero `warn`/`error` de consola y contacto Logic2B de 48×48 px.

## Sol d'Hivern cerrado

- manifiesto 14/14 y cuatro escenas H3 finales generadas una a una con OpenAI
  integrado; dos encuadres de llegada rechazados por silla incoherente y forma
  similar a una matrícula quedan conservados en la auditoría;
- instalación ordenada para 45 noches, entrega cotidiana de paquetería, partida
  de dominó en el salón y dos residentes en bicicleta con cuatro alforjas;
- bloque de vida, recepción y salón con foto explícita, CTA de contacto y tres
  rutas que distinguen camino público, vía verde y servicios externos del pueblo;
- typecheck de 67 archivos sin diagnósticos, contrato de fábrica y build tier 3
  de 25 páginas verdes;
- QA real 375/1366: cero desborde o imagen rota, tarjetas de ruta a la misma
  altura, cero `warn`/`error` de consola y contacto Logic2B de 48×48 px.

## Diferenciación de la ola H2

- Cala Sereno: cala, restaurante y pinar costero sobrio;
- La Duna: parcela compacta, parte de costa, agua y carril litoral separado;
- El Delta: límites del arrozal, orientación responsable y bicicleta llana;
- Riu Clar: lluvia, cabal, refugio y sendero de ribera;
- La Ballena: escala familiar, sábado de llegada, parque de agua y salinas.

El gate queda aprobado: los cinco temas usan el agua de forma distinta y no
repiten la misma escena de familia en piscina.

## Diferenciación de la ola H3

- La Carrasca: pareja madura, encinar sobrio y uso tranquilo del claro;
- Serralta: lluvia reciente, parte de barro, fuego supervisado y retirada;
- Els Tarongers: familia entre cítricos, sombra, piscina y huerta;
- Entre Vinyes: límites de vendimia, patio de agua y sombra y accesos agrícolas;
- Sol d'Hivern: 45 noches, correo, salón vecinal y movilidad cotidiana.

El gate queda aprobado: las cinco identidades no comparten grupo, conflicto
operativo, servicio central ni relación con el paisaje.

## Decisión operativa vigente

- trabajar un tema completo cada vez;
- declarar papel, proporción y prompt en `fotos.json` antes de generar;
- usar sólo OpenAI integrado, una solicitud cada vez;
- inspeccionar, rechazar o aprobar cada pieza antes de avanzar;
- integrar home, instalaciones y entorno antes de abrir otro tema;
- verificar móvil/escritorio y build aislado; no desplegar ni configurar
  servicios externos.

## Siguiente objetivo

La mejora fotográfica H1/H2/H3 queda cerrada y H1-V es el frente activo. Cuando
el proveedor disponga de saldo, reintentar **solo L'Olivar** con Seedance 2.0:
6 s, 16:9, 720p, cámara fija, sin audio, `hero-dia.webp` como inicio y final y
movimiento limitado a hojas, sombras y lona. Inspeccionar continuidad y bucle,
normalizar H.264/WebM local con `faststart`, medir ≤3 MB y validar reducción de
movimiento/ahorro de datos antes de producir Pinada del Mar o Mar de Fondo. No
hay otro tenant fotográfico pendiente; los tres pósteres verticales ya están
aprobados y deben ser la referencia de encuadre para las futuras salidas móviles.
No se vuelve a desplegar sin una nueva autorización.
Los seis prompts, referencias, rechazos específicos y orden de producción están
cerrados en `BRIEF-H1-VIDEO.md`; no hay que rediseñarlos al reanudar.
La incorporación se hace con `pnpm motion -- stage/approve/reject`; no copiar el
resultado del proveedor directamente a `content/media/`.
