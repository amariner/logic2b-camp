---
description: Verificación completa del monorepo — typecheck + lint + tests + build
---

Ejecuta la verificación completa del monorepo:

1. `pnpm check` si existe ese script; si no, en orden: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` (vía Turborepo si está configurado).
2. Reporta el resultado por paquete: qué pasó, qué falló y por qué.
3. Si algo falla, propón el arreglo más pequeño posible. No cambies lógica de negocio para hacer pasar un test: si el test revela un bug, arregla el bug.
4. Recuerda: no se cierra sesión ni se pasa de fase sin este comando en verde.
