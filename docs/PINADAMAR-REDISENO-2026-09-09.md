# Pinada del Mar · Más mar. Menos reloj.

Rediseño solicitado el 9 de septiembre de 2026. Referencias del usuario: composiciones de viajes con fotografía panorámica, titulares de gran escala, márgenes amplios y tarjetas limpias.

## Dirección y composición

Presentación `coastal`, activada solo en Pinada del Mar. Fondo de papel cálido, azul grisáceo, tinta marina, Georgia de peso regular e Inter. La cabecera y las páginas interiores comparten los mismos tokens.

La portada combina hero cinematográfico, presentación humana, cuatro alojamientos con capacidades y tarifas procedentes del catálogo, tres momentos del día, escena de costa, servicios, preguntas desplegables y consulta de demostración. Los enlaces de las tarjetas utilizan los identificadores reales de las fichas. Se conserva el transporte local de solicitudes y el destino del gestor.

## Medios y procedencia

Tres másteres nuevos creados con la herramienta integrada de imágenes GPT de la cuenta, sin fallback a API ni generación de imágenes en Higgsfield:

- `tenants/pinadamar/content/media/hero-porche.webp`: vista al mar desde el porche; versión vertical `hero-porche-mobile.webp`.
- `tenants/pinadamar/content/media/verano-desayuno.webp`: desayuno familiar.
- `tenants/pinadamar/content/media/verano-orilla.webp`: paseo en pareja.

Los prompts exactos están en `tenants/pinadamar/fotos.json` y `output/pinadamar/prompts.json`. Los originales se conservan en `output/pinadamar/originals/`. Son imágenes ficticias para una demo, no fotografías acreditativas de un establecimiento real.

Vídeo producido con Higgsfield / Seedance 2.0 a partir del máster GPT del porche. Plano continuo de movimiento lento, sin cortes. Versiones H.264 optimizadas, sin pista de audio, faststart y 9,83 s:

- `hero-porche-motion.mp4`: 1600 × 900, aproximadamente 2,6 MB.
- `hero-porche-motion-mobile.mp4`: 720 × 1046, aproximadamente 1,1 MB; encuadre vertical del mismo plano.

Prompt, fecha y huellas SHA-256 en `tenants/pinadamar/movimiento.json`. El componente común conserva el póster, carga progresiva, pausa manual y preferencias de movimiento reducido/ahorro de datos.

## Validación

- Astro: 0 errores, 0 avisos.
- Configuración: 93 pruebas existentes correctas.
- Build de las 15 páginas y comprobación R12 correctos.
- Contrato de fábrica: 13 tenants, plantilla y briefs correctos.
- Contrato técnico y evidencia de ambos vídeos correctos, leyendo metadatos reales con FFmpeg.
- Inspección visual en escritorio (1440 px) y móvil (390 px), portada, sección editorial, tarjetas, formulario y ficha.
- Navegación a una ficha y envío local con datos ficticios comprobados; la confirmación conserva bungalow, fechas, personas y consulta.
- Control de pausa del hero comprobado.

## Desarrollo

```bash
TENANT=pinadamar TIER=2 BASE_PATH=/demos/pinadamar pnpm --filter @logic-camp/web dev --host 127.0.0.1 --port 4322
```

URL: `http://127.0.0.1:4322/demos/pinadamar/`. Destino de producción: `https://camp.logic2b.com/demos/pinadamar/`, mediante el bundle completo de `apps/api`.
