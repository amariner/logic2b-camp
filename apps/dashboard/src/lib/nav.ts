/**
 * La navegación del gestor, en UN sitio (ADR 0017 §3): lo de cada día primero.
 *
 * Vive aquí y no en `main.tsx` porque tiene dos consumidores —la barra lateral y
 * la rejilla de módulos de la portada— y dos copias de una lista de rutas se
 * desincronizan el día que alguien añade una pantalla: la regla que ya costó
 * dos sesiones en las listas (55, 59) es la misma aquí.
 *
 * Cada módulo lleva su propia frase. No es adorno: la portada la ve alguien que
 * abre el programa por primera vez —o el prospecto que entra en la demo— y
 * «Parte de viajeros» no dice nada si no sabes que es lo que pide la Guardia
 * Civil. Los rótulos cortos siguen siendo los de la barra lateral.
 */
import {
  BarChart3,
  Bell,
  BookMarked,
  CalendarRange,
  ClipboardList,
  CreditCard,
  DoorOpen,
  Inbox,
  Map,
  Settings,
  Tag,
  Tent,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { tieneRol, type Role } from '../auth';
import { t } from '../i18n';

type TKey = Parameters<typeof t>[0];

/** [ruta, rótulo corto, icono, frase de portada, rol mínimo opcional] */
export type NavItem = [string, TKey, LucideIcon, TKey, Role?];
export type NavGroup = { label: TKey; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'nav.grupo.operacion',
    items: [
      ['/planning', 'nav.planning', CalendarRange, 'mod.planning'],
      ['/plano', 'nav.plano', Map, 'mod.plano'],
      ['/llegadas', 'nav.llegadas', DoorOpen, 'mod.llegadas'],
      ['/solicitudes', 'nav.solicitudes', Inbox, 'mod.solicitudes'],
    ],
  },
  {
    label: 'nav.grupo.gestion',
    items: [
      ['/reservas', 'nav.reservas', BookMarked, 'mod.reservas'],
      ['/clientes', 'nav.clientes', Users, 'mod.clientes'],
      ['/parte', 'nav.parte', ClipboardList, 'mod.parte', 'manager'],
      ['/informes', 'nav.informes', BarChart3, 'mod.informes'],
      ['/inventario', 'nav.inventario', Tent, 'mod.inventario'],
      ['/tarifas', 'nav.tarifas', Tag, 'mod.tarifas'],
    ],
  },
  {
    label: 'nav.grupo.config',
    items: [
      ['/notificaciones', 'nav.notificaciones', Bell, 'mod.notificaciones'],
      ['/pagos', 'nav.pagos', CreditCard, 'mod.pagos'],
      ['/ajustes', 'nav.ajustes', Settings, 'mod.ajustes'],
    ],
  },
];

/**
 * Navegación honesta: no ofrece una ruta que el servidor va a rechazar.
 * Es cortesía de interfaz; `requireRole` continúa siendo la barrera real.
 */
export function navGroupsForRole(role: Role | null): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item[4] === undefined || tieneRol(role, item[4])),
  })).filter((group) => group.items.length > 0);
}
