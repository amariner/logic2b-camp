import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Sitio de PRODUCTO Logic2B (landing ahora, docs en B4). Estático, marca Logic2B.
// Vive en la raíz de camp.logic2b.com/ (la demo del tenant baja a /demo/, ADR 0016).
export default defineConfig({
  site: 'https://camp.logic2b.com',
  vite: {
    plugins: [tailwindcss()],
    server: {
      // dev: el endpoint de leads corre en wrangler dev (8787)
      proxy: {
        '/api': 'http://localhost:8787',
        // En producción las demos se publican en este mismo origen. Durante el
        // desarrollo del catálogo las servimos desde el despliegue vigente para
        // que los visores puedan navegar la web completa sin componer el bundle.
        '/demos': {
          target: 'https://camp.logic2b.com',
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyRes', (response) => {
              delete response.headers['x-frame-options'];
              response.headers['content-security-policy'] =
                "base-uri 'self'; frame-ancestors 'self'; object-src 'none'";
            });
          },
        },
      },
    },
  },
});
