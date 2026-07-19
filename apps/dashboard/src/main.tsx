/**
 * Dashboard (ADR 0008 · reskin Logic2B ADR 0017): React 19 + TanStack Router
 * (hash history: /admin/#/…) + TanStack Query. Shell = sidebar agrupada plegable,
 * marca Logic2B (packages/ui). Guardia de sesión en la raíz: sin cookie → login.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import { cn, LogoMark } from '@logic-camp/ui';
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
  Settings,
  Tag,
  Tent,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { StrictMode, useState } from 'react';
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

/** Navegación agrupada al estilo ui.logic2b.com (ADR 0017 §3): lo de cada día primero. */
type TKey = Parameters<typeof t>[0];
const NAV_GROUPS: { label: TKey; items: [string, TKey, LucideIcon][] }[] = [
  {
    label: 'nav.grupo.operacion',
    items: [
      ['/', 'nav.planning', CalendarRange],
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
          'flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width]',
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
            <button
              type="button"
              onClick={toggle}
              title={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              aria-label={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={() => signOut.mutate()}
              title={t('app.cerrarSesion')}
              aria-label={t('app.cerrarSesion')}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                collapsed ? 'size-8' : 'ml-auto h-8 px-3',
              )}
            >
              <LogOut className="size-4" />
              {!collapsed && <span>{t('app.cerrarSesion')}</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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
