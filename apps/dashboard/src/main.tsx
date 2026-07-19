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
import Ajustes from './pages/Ajustes';
import Clientes from './pages/Clientes';
import Informes from './pages/Informes';
import Inventario from './pages/Inventario';
import Llegadas from './pages/Llegadas';
import Login from './pages/Login';
import Notificaciones from './pages/Notificaciones';
import Pagos from './pages/Pagos';
import Planning from './pages/Planning';
import Reservas from './pages/Reservas';
import Solicitudes from './pages/Solicitudes';
import Tarifas from './pages/Tarifas';
import './styles.css';

const queryClient = new QueryClient();

/** Orden operativo: lo de cada día primero, la configuración al final. */
const NAV = [
  ['/', 'nav.planning'],
  ['/llegadas', 'nav.llegadas'],
  ['/solicitudes', 'nav.solicitudes'],
  ['/reservas', 'nav.reservas'],
  ['/clientes', 'nav.clientes'],
  ['/informes', 'nav.informes'],
  ['/inventario', 'nav.inventario'],
  ['/tarifas', 'nav.tarifas'],
  ['/notificaciones', 'nav.notificaciones'],
  ['/pagos', 'nav.pagos'],
  ['/ajustes', 'nav.ajustes'],
] as const;

function Shell() {
  const session = useSession();
  const signOut = useSignOut();

  if (session.isPending) return null;
  if (!session.data?.user) return <Login />;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-11 shrink-0 items-center gap-4 border-b border-arena/60 px-4">
        <span className="text-[13px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase">
          {t('app.nombre')}
        </span>
        <nav className="flex items-center gap-3.5 overflow-x-auto text-[13px] font-medium whitespace-nowrap text-tinta-suave">
          {NAV.map(([to, key]) => (
            <Link
              key={to}
              to={to}
              className="transition-colors hover:text-tinta [&.active]:text-tinta [&.active]:underline [&.active]:underline-offset-4"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3 text-[13px]">
          <span className="hidden text-tinta-suave xl:inline">{session.data.user.email}</span>
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
const routes = [
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: Planning }),
  createRoute({ getParentRoute: () => rootRoute, path: '/llegadas', component: Llegadas }),
  createRoute({ getParentRoute: () => rootRoute, path: '/solicitudes', component: Solicitudes }),
  createRoute({ getParentRoute: () => rootRoute, path: '/reservas', component: Reservas }),
  createRoute({ getParentRoute: () => rootRoute, path: '/clientes', component: Clientes }),
  createRoute({ getParentRoute: () => rootRoute, path: '/informes', component: Informes }),
  createRoute({ getParentRoute: () => rootRoute, path: '/inventario', component: Inventario }),
  createRoute({ getParentRoute: () => rootRoute, path: '/tarifas', component: Tarifas }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/notificaciones',
    component: Notificaciones,
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/pagos', component: Pagos }),
  createRoute({ getParentRoute: () => rootRoute, path: '/ajustes', component: Ajustes }),
] as const;

const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
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
