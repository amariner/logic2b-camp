# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 95 (2026-08-07). **D3-V está en curso**: el recorrido
> funcional y sus tres capturas firma están listos; la fotografía permanece en
> ocho de catorce piezas por dos fallos de red del generador integrado.

## Estado en una línea

Mar de Fondo ya vende web, reserva, escala operativa e IA supervisada en
capturas reales de 40–69 kB; faltan seis fotografías y su QA final.

## Objetivo prioritario

1. Consultar `pnpm fotos -- status mardefondo`. La pareja activa sigue siendo
   `glamping-duna-interior` + `instalacion-laguna`.
2. Respetar la última instrucción de Andreu: usar el generador integrado de
   OpenAI **de una imagen en una**, con pausa entre llamadas y sin ejecutar
   `pnpm fotos -- run mardefondo`, porque ese comando seleccionaría el fallback
   histórico de Higgsfield. No usar CLI/API con clave ni otro proveedor sin una
   autorización nueva.
3. Generar primero y solo `glamping-duna-interior`. Debe ser un interior de lona
   práctico para cuatro, con dos zonas de descanso y baño compacto plausible,
   misma luz/geografía que `glamping-duna`, sin lujo ficticio, texto, marcas,
   rostros o arquitectura imposible.
4. Copiar el resultado integrado al workspace e incorporarlo mediante
   `pnpm fotos -- ingest mardefondo glamping-duna-interior RUTA codex-integrated integrated`.
   Inspeccionar `.staging` y aprobar o rechazar antes de pedir la piscina. Solo
   si el interior queda aprobado, repetir el ciclo con `instalacion-laguna`.
5. Si el integrado vuelve a fallar dos veces antes de producir bytes, detener
   la generación de esa sesión sin saturar ni degradar proveedor. Mantener el
   historial y avanzar dentro de D3-V con miniatura/OG derivados de activos ya
   aprobados; nunca saltar a la siguiente tanda con la pareja incompleta.
6. Verificar estado, peso, derivados y build de Mar de Fondo; regenerar las tres
   capturas solo si cambia su superficie y mantener `pnpm check` verde.

## Ya terminado — no repetir

- `tenants/mardefondo`: identidad, contenido, cuatro familias, 300 unidades,
  tarifas/extras y reserva local `MF-DEMO-001`.
- Gestor: 240 reservas, planning, ficha, búsquedas, llegada/cobro/devolución,
  plano propio y reset, todo local y sin `/api`.
- Automatiza: respuesta a reseña y parte de incidencias supervisados; nunca
  publica, entrega ni abre tickets.
- Inteligente: recomendación con periodo, fuentes, rango, confianza y límites;
  nunca modifica tarifa, cupo ni reserva.
- El héroe Visión ya usa `hero-laguna` cuando el tenant no tiene `hero-dia`.
- Capturas firma reproducibles: portada-reserva, planning e Inteligente a 1366
  px, WebP de 62/40/69 kB, con carga real y guardias visuales.
- Pipeline fotográfico (ADR 0035), ocho pruebas y cuatro parejas aprobadas.

## Cola visual

El manifiesto conserva 14 piezas en 7 tandas y **8/14 resultados aprobados**:
`hero-laguna`, `hero-horizonte`, `parcela-atlantica`, `bungalow-laguna`,
`bungalow-laguna-interior`, `mobil-horizonte`, `mobil-horizonte-interior` y
`glamping-duna`. Los dos fallos integrados de la sesión 95 están registrados en
`glamping-duna-interior`; no hay nada pendiente en `.staging`.

## Regla de alcance

- No crear D1, Worker, usuarios, email, pagos ni infraestructura por marca.
- Pago: «Pago simulado · no se ha realizado ningún cargo».
- Automatiza: «Prototipo supervisado».
- Inteligente: «Prototipo · no ejecuta cambios».
- Canales/fiscal/SES: «Roadmap sujeto a integración».

## Prompt

```text
continúa con el desarrollo de este proyecto
```
