import { defineConfig } from 'vitest/config';

// packages/ui estrena runner en ADR 0020: hasta C2 este paquete no tenía script
// `test`, así que los 4 componentes de B1 nunca se probaron. jsdom porque aquí
// sí hay DOM (el resto de paquetes del monorepo son lógica pura y no lo llevan).
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
