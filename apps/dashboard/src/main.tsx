/**
 * Dashboard (ADR 0008): React 19 + TanStack Router (hash history: /admin/#/…)
 * + TanStack Query. Guardia de sesión en la raíz: sin cookie → login.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useSession, useSignOut } from './auth';
import { t } from './i18n';
import Llegadas from './pages/Llegadas';
import Login from './pages/Login';
import Planning from './pages/Planning';
import Solicitudes from './pages/Solicitudes';
import './styles.css';

const queryClient = new QueryClient();

function Shell() {
  const session = useSession();
  const signOut = useSignOut();

  if (session.isPending) return null;
  if (!session.data?.user) return <Login />;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-11 shrink-0 items-center gap-5 border-b border-arena/60 px-4">
        <span className="text-[13px] font-semibold tracking-[0.14em] uppercase">
          {t('app.nombre')}
        </span>
        <nav className="flex items-center gap-4 text-[13px] font-medium text-tinta-suave">
          <Link
            to="/"
            className="transition-colors hover:text-tinta [&.active]:text-tinta [&.active]:underline [&.active]:underline-offset-4"
          >
            {t('nav.planning')}
          </Link>
          <Link
            to="/llegadas"
            className="transition-colors hover:text-tinta [&.active]:text-tinta [&.active]:underline [&.active]:underline-offset-4"
          >
            {t('nav.llegadas')}
          </Link>
          <Link
            to="/solicitudes"
            className="transition-colors hover:text-tinta [&.active]:text-tinta [&.active]:underline [&.active]:underline-offset-4"
          >
            {t('nav.solicitudes')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-[13px]">
          <span className="text-tinta-suave">{session.data.user.email}</span>
          <button
            type="button"
            onClick={() => signOut.mutate()}
            className="rounded-(--lc-radius) border border-tinta/20 px-3 py-1 font-medium transition-colors hover:bg-arena-suave"
          >
            {t('app.cerrarSesion')}
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Shell });
const planningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Planning,
});
const llegadasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llegadas',
  component: Llegadas,
});
const solicitudesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solicitudes',
  component: Solicitudes,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([planningRoute, llegadasRoute, solicitudesRoute]),
  history: createHashHistory(),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
