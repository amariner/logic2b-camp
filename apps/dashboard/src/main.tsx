import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fase 0: placeholder. TanStack Router/Query y el planning llegan en Fase 6.
function App() {
  return (
    <main>
      <h1>Logic Camp — Dashboard</h1>
      <p>Fase 0 — scaffold. El dashboard real llega en la Fase 6.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
