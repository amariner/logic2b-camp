/**
 * Dashboard (ADR 0008 · reskin Logic2B ADR 0017): React 19 + TanStack Router
 * (hash history: /admin/#/…) + TanStack Query. Shell = sidebar agrupada plegable,
 * marca Logic2B (packages/ui). Guardia de sesión en la raíz: sin cookie → login.
 */
// El gestor solo declara los glifos latinos que usa. Importar los CSS generales
// de Fontsource emitía cirílico, griego y vietnamita en cada build (M6).
import './fonts.css';
import {
  Button,
  cn,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Toaster,
  TooltipProvider,
  Wordmark,
} from '@logic-camp/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { ChevronLeft, Home, LogOut, Menu, Search } from 'lucide-react';
import { StrictMode, useCallback, useRef, useState } from 'react';
import { ApiError } from './api';
import { createRoot } from 'react-dom/client';
import { useRol, useSession, useSignOut } from './auth';
import CommandPalette from './components/CommandPalette';
import DemoBanner from './components/DemoBanner';
import { RouteError, RouteNotFound } from './components/RouteError';
import ThemeToggle from './components/ThemeToggle';
import { t } from './i18n';
import { navGroupsForRole } from './lib/nav';
import Login from './pages/Login';
import './styles.css';

// Una pantalla = un chunk. `lazyRouteComponent` permite además precargar por
// intención desde los Link de TanStack y conserva el módulo en caché tras la
// primera navegación. Planning y Plano dejan de penalizar la entrada móvil.
const Inicio = lazyRouteComponent(() => import('./pages/Inicio'));
const Planning = lazyRouteComponent(() => import('./pages/Planning'));
const Plano = lazyRouteComponent(() => import('./pages/Plano'));
const Llegadas = lazyRouteComponent(() => import('./pages/Llegadas'));
const Solicitudes = lazyRouteComponent(() => import('./pages/Solicitudes'));
const Reservas = lazyRouteComponent(() => import('./pages/Reservas'));
const Clientes = lazyRouteComponent(() => import('./pages/Clientes'));
const Parte = lazyRouteComponent(() => import('./pages/Parte'));
const Informes = lazyRouteComponent(() => import('./pages/Informes'));
const Inventario = lazyRouteComponent(() => import('./pages/Inventario'));
const Tarifas = lazyRouteComponent(() => import('./pages/Tarifas'));
const Notificaciones = lazyRouteComponent(() => import('./pages/Notificaciones'));
const Pagos = lazyRouteComponent(() => import('./pages/Pagos'));
const Ajustes = lazyRouteComponent(() => import('./pages/Ajustes'));
const Automatiza = lazyRouteComponent(() => import('./pages/Automatiza'));
const Inteligente = lazyRouteComponent(() => import('./pages/Inteligente'));

function RoutePending() {
  return (
    <div
      role="status"
      className="flex flex-1 items-center justify-center text-sm text-muted-foreground"
    >
      {t('app.cargando')}
    </div>
  );
}

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

const COLLAPSE_KEY = 'lc-sidebar-collapsed';

/**
 * Contenido de la sidebar: logo + navegación + pie (sesión/tema/salir).
 * Se comparte entre la sidebar persistente de escritorio (`collapsed` real,
 * con botón de plegar) y el off-canvas de móvil (siempre desplegado, sin
 * plegar, y que se cierra al navegar). Un solo sitio → añadir un enlace no
 * se olvida en la otra vista.
 */
function SidebarInner({
  collapsed,
  onToggleCollapse,
  onNavigate,
  email,
  onSignOut,
}: {
  collapsed: boolean;
  /** Solo en escritorio: sin él no se pinta el botón de plegar (en móvil no aplica). */
  onToggleCollapse?: () => void;
  /** Móvil: cerrar el off-canvas al pulsar un enlace. */
  onNavigate?: () => void;
  email: string;
  onSignOut: () => void;
}) {
  const navGroups = navGroupsForRole(useRol());

  return (
    <>
      <div className="flex h-14 items-center gap-2 px-3">
        {/* Plegada, la sidebar son 56px: ahí solo cabe «2B» (sesión 59) — y
           plegada no enlaza: lo que se recorta es el dibujo, no la marca. */}
        <Wordmark
          className="text-base"
          variant={collapsed ? 'compact' : 'full'}
          enlazado={!collapsed}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Inicio va suelto y arriba, fuera de los grupos: no es "operación
           diaria", es la portada desde la que se llega a todo lo demás. */}
        <Link
          data-mobile-menu-start
          to="/"
          title={t('nav.inicio')}
          onClick={onNavigate}
          activeOptions={{ exact: true }}
          className={cn(
            'mt-2 flex min-h-11 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 [&.active]:bg-accent [&.active]:font-medium [&.active]:text-accent-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          <Home className="size-4 shrink-0" strokeWidth={2} />
          {!collapsed && <span className="truncate">{t('nav.inicio')}</span>}
        </Link>
        {navGroups.map((group) => (
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
                onClick={onNavigate}
                className={cn(
                  'mt-0.5 flex min-h-11 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0 [&.active]:bg-accent [&.active]:font-medium [&.active]:text-accent-foreground',
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
          <p className="truncate px-2 pb-1.5 text-xs text-muted-foreground" title={email}>
            {email}
          </p>
        )}
        <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : 'items-center')}>
          <ThemeToggle />
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onToggleCollapse}
              title={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              aria-label={t(collapsed ? 'nav.desplegar' : 'nav.colapsar')}
              className="size-8"
            >
              <ChevronLeft
                className={cn('size-4 transition-transform', collapsed && 'rotate-180')}
              />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            title={t('app.cerrarSesion')}
            aria-label={t('app.cerrarSesion')}
            className={cn(
              'min-h-11 text-muted-foreground md:min-h-8',
              collapsed ? 'size-8 px-0' : 'ml-auto',
            )}
          >
            <LogOut className="size-4" />
            {!collapsed && <span>{t('app.cerrarSesion')}</span>}
          </Button>
        </div>
      </div>
    </>
  );
}

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
  // Off-canvas de móvil: la sidebar persistente desaparece bajo `md` y se abre
  // desde la hamburguesa (BACKLOG B1). El primitivo Sheet aporta trampa de foco,
  // cierre con Escape y overlay.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const commandOpenedFromSearchRef = useRef(false);

  const onCommandOpenChange = useCallback((next: boolean) => {
    if (next) commandOpenedFromSearchRef.current = false;
    setCommandOpen(next);
  }, []);

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
  const email = session.data.user.email;

  return (
    <div className="flex h-screen">
      {/* Escritorio: sidebar persistente y plegable (la usuaria real está a 1366px). */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] md:flex',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <SidebarInner
          collapsed={collapsed}
          onToggleCollapse={toggle}
          email={email}
          onSignOut={() => signOut.mutate()}
        />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Móvil: barra con dos entradas táctiles de 44px. El trigger real del
            Sheet permite que Radix devuelva el foco a la hamburguesa al cerrar. */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <header className="flex h-12 shrink-0 items-center gap-1 border-b border-sidebar-border bg-sidebar px-0.5 md:hidden">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                aria-label={t('nav.abrirMenu')}
                className="size-11"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <Wordmark
              className="text-sm [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center"
              enlazado
            />
            <Button
              ref={searchTriggerRef}
              variant="ghost"
              size="iconSm"
              aria-label={t('cmdk.abrir')}
              className="ml-auto size-11"
              onClick={() => {
                commandOpenedFromSearchRef.current = true;
                setCommandOpen(true);
              }}
            >
              <Search className="size-5" />
            </Button>
          </header>

          <SheetContent
            ref={mobileMenuRef}
            side="left"
            className="w-64 border-sidebar-border bg-sidebar p-0 md:hidden"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              mobileMenuRef.current
                ?.querySelector<HTMLElement>('[data-mobile-menu-start]')
                ?.focus();
            }}
          >
            {/* Título accesible del diálogo, oculto: el logo ya identifica visualmente. */}
            <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
            <SidebarInner
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              email={email}
              onSignOut={() => signOut.mutate()}
            />
          </SheetContent>
        </Sheet>

        {/* Solo se pinta para el visitante anónimo de la demo (ADR 0029). */}
        <DemoBanner />

        {/* Contenedor flex-col como el padre anterior de las páginas: sus raíces
            usan `h-full`/`flex-1` esperando serlo. Bajo `md` descuenta la barra. */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>

      {/* Paleta ⌘K global (ADR 0022): buscar reserva/cliente/unidad y saltar */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={onCommandOpenChange}
        onCloseAutoFocus={(event) => {
          if (!commandOpenedFromSearchRef.current) return;
          event.preventDefault();
          commandOpenedFromSearchRef.current = false;
          searchTriggerRef.current?.focus();
        }}
      />
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
    component: Inicio,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/planning',
    component: Planning,
    validateSearch: mapSearch,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/plano',
    component: Plano,
    validateSearch: mapSearch,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/llegadas',
    component: Llegadas,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/solicitudes',
    component: Solicitudes,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/reservas',
    component: Reservas,
  }),
  // rutas direccionables (ADR 0022 §4): una reserva/cliente se puede enviar por URL
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/reservas/$id',
    component: Reservas,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/clientes',
    component: Clientes,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/clientes/$id',
    component: Clientes,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/parte',
    component: Parte,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/informes',
    component: Informes,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/inventario',
    component: Inventario,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/tarifas',
    component: Tarifas,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/notificaciones',
    component: Notificaciones,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/pagos',
    component: Pagos,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/ajustes',
    component: Ajustes,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/automatiza',
    component: Automatiza,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/inteligente',
    component: Inteligente,
  }),
] as const;

const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  history: createHashHistory(),
  // En escritorio el hover y en móvil el touchstart adelantan el chunk; no se
  // descarga ninguna pantalla durante la entrada si no existe intención.
  defaultPreload: 'intent',
  defaultPendingComponent: RoutePending,
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
