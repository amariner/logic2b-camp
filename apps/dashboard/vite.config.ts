import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El dashboard vive en /admin/ del MISMO Worker del tenant (ADR 0008):
// misma cookie de sesión, cero CORS. En dev, la API corre en wrangler (8787).
export default defineConfig({
  // El portfolio puede empaquetar el MISMO gestor bajo una ruta de escenario.
  // Sin BASE_PATH conserva exactamente la ruta productiva histórica.
  base: process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/admin/',
  plugins: [react(), tailwindcss()],
  build: {
    // M6: el manifiesto permite comprobar el peso de la entrada y que las
    // vistas densas continúan fuera de su grafo estático.
    manifest: true,
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787' },
  },
});
