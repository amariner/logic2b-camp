import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El dashboard vive en /admin/ del MISMO Worker del tenant (ADR 0008):
// misma cookie de sesión, cero CORS. En dev, la API corre en wrangler (8787).
export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787' },
  },
});
