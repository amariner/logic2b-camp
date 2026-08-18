# Prompt para la siguiente sesión — H3 por temas

> Actualizado el 2026-08-18 tras completar Entre Vinyes.

## Estado en una línea

H3 queda 4/5: La Carrasca, Serralta, Els Tarongers y Entre Vinyes tienen cuatro
papeles humanos aprobados, bloque de vida, recepción y servicio en uso, tres
planes prudentes y QA real 375/1366. H1 permanece 3/3 y H2, 5/5. Todo continúa
local, sin desplegar; el vídeo H1-V sigue diferido con fallback estático completo.

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

## Diferenciación de la ola H2

- Cala Sereno: cala, restaurante y pinar costero sobrio;
- La Duna: parcela compacta, parte de costa, agua y carril litoral separado;
- El Delta: límites del arrozal, orientación responsable y bicicleta llana;
- Riu Clar: lluvia, cabal, refugio y sendero de ribera;
- La Ballena: escala familiar, sábado de llegada, parque de agua y salinas.

El gate queda aprobado: los cinco temas usan el agua de forma distinta y no
repiten la misma escena de familia en piscina.

## Decisión operativa vigente

- trabajar un tema completo cada vez;
- declarar papel, proporción y prompt en `fotos.json` antes de generar;
- usar sólo OpenAI integrado, una solicitud cada vez;
- inspeccionar, rechazar o aprobar cada pieza antes de avanzar;
- integrar home, instalaciones y entorno antes de abrir otro tema;
- verificar móvil/escritorio y build aislado; no desplegar ni configurar
  servicios externos.

## Siguiente objetivo

Abrir **Sol d'Hivern** como quinto y último tema de H3:

1. definir residentes de larga estancia, correo/recepción, lavandería o salón
   común y camino de almendros sin repetir el lenguaje vacacional de H1/H2;
2. redactar en sus locales el bloque de vida y tres planes útiles;
3. generar e inspeccionar cuatro escenas propias, sin reutilizar figurantes,
   arquitectura o temperatura de H1/H2;
4. integrar recepción, un segundo servicio y CTA de contacto;
5. verificar 375/1366, contrato, build y el gate comparativo completo de H3.

Después: cerrar el gate de H3 y ejecutar una validación global. No retomar vídeo
H1-V durante la producción fotográfica salvo decisión explícita.
