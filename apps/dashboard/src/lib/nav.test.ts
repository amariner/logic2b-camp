import { describe, expect, it } from 'vitest';
import type { Role } from '../auth';
import { NAV_GROUPS, navGroupsForRole } from './nav';

const routesFor = (role: Role | null) =>
  navGroupsForRole(role).flatMap((group) => group.items.map(([route]) => route));

describe('navGroupsForRole', () => {
  it.each<Role | null>(['demo', 'readonly', 'reception', null])(
    'oculta el parte a %s',
    (role) => {
      expect(routesFor(role)).not.toContain('/parte');
    },
  );

  it.each<Role>(['manager', 'owner'])('ofrece el parte a %s', (role) => {
    expect(routesFor(role)).toContain('/parte');
  });

  it('no altera los demás módulos al aplicar la política', () => {
    const allExceptParte = NAV_GROUPS.flatMap((group) => group.items.map(([route]) => route)).filter(
      (route) => route !== '/parte',
    );
    expect(routesFor('reception')).toEqual(allExceptParte);
  });
});
