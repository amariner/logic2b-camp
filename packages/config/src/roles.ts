/**
 * Política de roles compartida por API y gestor.
 *
 * El servidor sigue siendo la barrera de seguridad. Esta tabla permite que el
 * cliente no ofrezca acciones que terminarían en 403 y evita mantener dos
 * versiones de la excepción de demostración.
 */
export const ROLES = ['demo', 'readonly', 'reception', 'manager', 'owner'] as const;
export type Role = (typeof ROLES)[number];

const ROLE_LEVEL: Record<Role, number> = {
  demo: 0,
  readonly: 0,
  reception: 1,
  manager: 2,
  owner: 3,
};

/** Acciones concretas de reserva que puede probar el visitante de la demo. */
export const DEMO_BOOKING_ACTIONS = [
  'move',
  'reassign',
  'check_in',
  'check_out',
  'undo_checkin',
] as const;
export type DemoBookingAction = (typeof DEMO_BOOKING_ACTIONS)[number];

export type DashboardCapability =
  | 'booking:create'
  | 'booking:operate'
  | 'booking:manage'
  | 'guest:edit'
  | 'guest:rgpd'
  | 'block:manage'
  | 'inventory:manage'
  | 'enquiry:manage'
  | 'rates:manage'
  | 'settings:manage'
  | 'hospedajes:manage'
  | 'users:manage';

const MINIMUM_ROLE: Record<DashboardCapability, Exclude<Role, 'demo'>> = {
  'booking:create': 'reception',
  'booking:operate': 'reception',
  'booking:manage': 'reception',
  'guest:edit': 'reception',
  'guest:rgpd': 'manager',
  'block:manage': 'reception',
  'inventory:manage': 'manager',
  'enquiry:manage': 'reception',
  'rates:manage': 'manager',
  'settings:manage': 'manager',
  'hospedajes:manage': 'manager',
  'users:manage': 'owner',
};

/** Falla cerrado ante una sesión ausente; demo nunca asciende por jerarquía. */
export function roleAtLeast(role: Role | null, minimum: Role): boolean {
  return role !== null && ROLE_LEVEL[role] >= ROLE_LEVEL[minimum];
}

/**
 * Capacidad visual. `demo` solo opera estancias; no hereda altas, cobros,
 * cancelaciones, huéspedes ni bloqueos aunque todas sean rutas de recepción.
 */
export function hasDashboardCapability(
  role: Role | null,
  capability: DashboardCapability,
): boolean {
  if (role === 'demo') return capability === 'booking:operate';
  return roleAtLeast(role, MINIMUM_ROLE[capability]);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
