import { describe, expect, it } from 'vitest';
import {
  DEMO_BOOKING_ACTIONS,
  hasDashboardCapability,
  isRole,
  roleAtLeast,
  type DashboardCapability,
  type Role,
} from './roles';

const CAPABILITIES: DashboardCapability[] = [
  'booking:create',
  'booking:operate',
  'booking:manage',
  'guest:edit',
  'guest:rgpd',
  'block:manage',
  'inventory:manage',
  'enquiry:manage',
  'rates:manage',
  'settings:manage',
  'hospedajes:manage',
  'users:manage',
];

describe('política compartida de roles', () => {
  it('mantiene la jerarquía sin convertir demo en recepción', () => {
    expect(roleAtLeast('readonly', 'readonly')).toBe(true);
    expect(roleAtLeast('reception', 'readonly')).toBe(true);
    expect(roleAtLeast('manager', 'reception')).toBe(true);
    expect(roleAtLeast('owner', 'manager')).toBe(true);
    expect(roleAtLeast('demo', 'reception')).toBe(false);
    expect(roleAtLeast(null, 'readonly')).toBe(false);
  });

  it('demo solo puede operar una estancia y su lista de acciones es cerrada', () => {
    expect(DEMO_BOOKING_ACTIONS).toEqual([
      'move',
      'reassign',
      'check_in',
      'check_out',
      'undo_checkin',
    ]);
    expect(CAPABILITIES.filter((capability) => hasDashboardCapability('demo', capability))).toEqual(
      ['booking:operate'],
    );
  });

  it.each<[Role, DashboardCapability[]]>([
    ['readonly', []],
    [
      'reception',
      [
        'booking:create',
        'booking:operate',
        'booking:manage',
        'guest:edit',
        'block:manage',
        'enquiry:manage',
      ],
    ],
    [
      'manager',
      [
        'booking:create',
        'booking:operate',
        'booking:manage',
        'guest:edit',
        'guest:rgpd',
        'block:manage',
        'inventory:manage',
        'enquiry:manage',
        'rates:manage',
        'settings:manage',
        'hospedajes:manage',
      ],
    ],
    ['owner', CAPABILITIES],
  ])('%s recibe exactamente sus capacidades', (role, expected) => {
    expect(CAPABILITIES.filter((capability) => hasDashboardCapability(role, capability))).toEqual(
      expected,
    );
  });

  it('valida únicamente roles conocidos', () => {
    expect(isRole('manager')).toBe(true);
    expect(isRole('admin')).toBe(false);
    expect(isRole(null)).toBe(false);
  });
});
