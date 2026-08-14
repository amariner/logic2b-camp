import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const scenario = process.env.VITE_DEMO_SCENARIO?.trim();
const portfolioScenarios = [
  'pinadamar',
  'serralta',
  'vinyes',
  'tarongers',
  'carrasca',
  'ballena',
  'soldhivern',
  'mardefondo',
] as const;
if (scenario && !(portfolioScenarios as readonly string[]).includes(scenario)) {
  throw new Error(
    `VITE_DEMO_SCENARIO inválido: "${scenario}". Usa pinadamar, serralta, vinyes, tarongers, carrasca, ballena, soldhivern o mardefondo.`,
  );
}
const basePath = process.env.BASE_PATH?.replace(/\/$/, '');
if (scenario) {
  const expectedBase = `/demos/${scenario}/gestion`;
  if (basePath !== expectedBase) {
    throw new Error(
      `El escenario ${scenario} exige BASE_PATH=${expectedBase}; recibido ${basePath ?? '(vacío)'}.`,
    );
  }
} else if (basePath?.match(/^\/demos\/[^/]+\/gestion$/)) {
  throw new Error(`BASE_PATH=${basePath} exige declarar el VITE_DEMO_SCENARIO correspondiente.`);
}
const scenarioModule = scenario ? `./src/demo/scenario.${scenario}.ts` : './src/demo/scenario.ts';
const scenarioOnlyPage = (name: 'Automatiza' | 'Inteligente' | 'ControlTotal') =>
  scenario === 'mardefondo' ? `./src/pages/${name}.tsx` : './src/pages/ScenarioUnavailable.tsx';

// El dashboard vive en /admin/ del MISMO Worker del tenant (ADR 0008):
// misma cookie de sesión, cero CORS. En dev, la API corre en wrangler (8787).
export default defineConfig({
  // El portfolio puede empaquetar el MISMO gestor bajo una ruta de escenario.
  // Sin BASE_PATH conserva exactamente la ruta productiva histórica.
  base: basePath ? `${basePath}/` : '/admin/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@demo-scenario': fileURLToPath(new URL(scenarioModule, import.meta.url)),
      '@scenario-automatiza': fileURLToPath(
        new URL(scenarioOnlyPage('Automatiza'), import.meta.url),
      ),
      '@scenario-inteligente': fileURLToPath(
        new URL(scenarioOnlyPage('Inteligente'), import.meta.url),
      ),
      '@scenario-control-total': fileURLToPath(
        new URL(scenarioOnlyPage('ControlTotal'), import.meta.url),
      ),
    },
  },
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
