/**
 * Dashboard (ADR 0008 · reskin Logic2B ADR 0017): React 19 + TanStack Router
 * (hash history: /admin/#/…) + TanStack Query. Shell = sidebar agrupada plegable,
 * marca Logic2B (packages/ui). Guardia de sesión en la raíz: sin cookie → login.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import { Button, cn, LogoMark, Toaster, TooltipProvider } from '@logic-camp/ui';
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
import {
  BarChart3,
  Bell,
  BookMarked,
  CalendarRange,
  ChevronLeft,
  CreditCard,
  DoorOpen,
  Inbox,
  LogOut,
  Map,
  Settings,
  Tag,
  Tent,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { StrictMode, useState } from 'react';
import { ApiError } from './api';
import { createRoot } from 'react-dom/client';
import { useSession, useSignOut } from './auth';
import CommandPalette from './components/CommandPalette';
import { RouteError, RouteNotFound } from './components/RouteError';
import ThemeToggle from './components/ThemeToggle';
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
import Plano from './pages/Plano';
import Reservas from './pages/Reservas';
import Solicitudes from './pages/Solicitudes';
import Tarifas from './pages/Tarifas';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 401 y 403 no se arreglan reintentando: reintentarlos solo retrasa el
      // mensaje que la recepcionista necesita leer (ADR 0020, C3).
      retry: (intentos, error) =>
        error instanceof ApiError && (error.status === 401 || error.status === 403)
          ? false
          : intentos < 2,
    },
  },
});

/** Navegación agrupada al estilo ui.logic2b.com (ADR 0017 §3): lo de cada día primero. */
type TKey = Parameters<typeof t>[0];
const NAV_GROUPS: { label: TKey; items: [string, TKey, LucideIcon][] }[] = [
  {
    label: 'nav.grupo.operacion',
    items: [
      ['/', 'nav.planning', CalendarRange],
      ['/plano', 'nav.plano', Map],
      ['/llegadas', 'nav.llegadas', DoorOpen],
      ['/solicitudes', 'nav.solicitudes', Inbox],
    ],
  },
  {
    label: 'nav.grupo.gestion',
    items: [
      ['/reservas', 'nav.reservas', BookMarked],
      ['/clientes', 'nav.clientes', Users],
      ['/informes', 'nav.informes', BarChart3],
      ['/inventario', 'nav.inventario', Tent],
      ['/tarifas', 'nav.tarifas', Tag],
    ],
  },
  {
    label: 'nav.grupo.config',
    items: [
      ['/notificaciones', 'nav.notificaciones', Bell],
      ['/pagos', 'nav.pagos', CreditCard],
      ['/ajustes', 'nav.ajustes', Settings],
    ],
  },
];

const COLLAPSE_KEY = 'lc-sidebar-collapsed';

function Shell() {
  const session = useSession();
  const signOut = useSignOut();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* modo privado: no persiste, no pasa nada */
      }
      return next;
    });
  };

  if (session.isPending) return null;
  if (!session.data?.user) return <Login />;

  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          'flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] motion-reduce:transition-none',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className="flex h-14 items-center gap-2 px-3">
          <LogoMark className="size-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-display text-base font-bold tracking-tight">
              Logic<span className="text-muted-foreground">Camp</span>
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {t(group.label)}
                </p>
              )}
              {collapsed && (
                <div className="mt-3 border-t border-sidebar-border first:mt-0 first:border-0" />
              )}
              {group.items.map(([to, key, Icon]) => (
                <Link
                  key={to}
                  to={to}
                  title={t(key)}
                  className={cn(
                    'mt-0.5 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:font-medium [&.active]:text-accent-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="truncate">{t(key)}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <p
              className="truncate px-2 pb-1.5 text-xs text-muted-foreground"
              title={session.data.user.email}
            >
              {session.data.user.email}
            </p>
          )}
          <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : 'items-center')}>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="iconSm"
              onClick={toggle}
              title={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              aria-label={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              className="size-8"
            >
              <ChevronLeft
                className={cn(
                  'size-4 transition-transform motion-reduce:transition-none',
                  collapsed && 'rotate-180',
                )}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut.mutate()}
              title={t('app.cerrarSesion')}
              aria-label={t('app.cerrarSesion')}
              className={cn('text-muted-foreground', collapsed ? 'size-8 px-0' : 'ml-auto')}
            >
              <LogOut className="size-4" />
              {!collapsed && <span>{t('app.cerrarSesion')}</span>}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>

      {/* Paleta ⌘K global (ADR 0022): buscar reserva/cliente/unidad y saltar */}
      <CommandPalette />
    </div>
  );
}

// `errorComponent` en la raíz confina cualquier throw de una pantalla al
// <Outlet>: la sidebar sigue viva y hay salida. Antes de C3 esto era una
// pantalla en blanco (ADR 0020).
const rootRoute = createRootRoute({
  component: Shell,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});
// El plano y el planning comparten fecha+unidad por la URL (ADR 0021 §4): el
// salto plano ↔ planning conserva ambas. Search laxo y validado.
const mapSearch = (s: Record<string, unknown>): { date?: string; unit?: string } => ({
  date: typeof s.date === 'string' ? s.date : undefined,
  unit: typeof s.unit === 'string' ? s.unit : undefined,
});

const routes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Planning,
    validateSearch: mapSearch,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/plano',
    component: Plano,
    validateSearch: mapSearch,
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/llegadas', component: Llegadas }),
  createRoute({ getParentRoute: () => rootRoute, path: '/solicitudes', component: Solicitudes }),
  createRoute({ getParentRoute: () => rootRoute, path: '/reservas', component: Reservas }),
  // rutas direccionables (ADR 0022 §4): una reserva/cliente se puede enviar por URL
  createRoute({ getParentRoute: () => rootRoute, path: '/reservas/$id', component: Reservas }),
  createRoute({ getParentRoute: () => rootRoute, path: '/clientes', component: Clientes }),
  createRoute({ getParentRoute: () => rootRoute, path: '/clientes/$id', component: Clientes }),
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
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
