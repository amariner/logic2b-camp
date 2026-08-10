/** Sesión Better Auth por cookie (misma-origen). El servidor manda; la UI solo pregunta. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hasDashboardCapability,
  isRole,
  roleAtLeast,
  type DashboardCapability,
  type Role,
} from '@logic-camp/config/roles';
import {
  activePortfolioScenario,
  isPortfolioScenario,
  resetPortfolioScenario,
} from '@demo-scenario';

/**
 * Los mismos roles de `apps/api/src/auth.ts`, con su misma jerarquía.
 *
 * La UI los usa SOLO para no ofrecer un botón que va a devolver 403 — quien
 * decide sigue siendo el servidor (`requireRole`). Ocultar aquí es cortesía con
 * la recepcionista, nunca la barrera de seguridad.
 *
 * `demo` es el visitante anónimo de la demo (ADR 0029) y empata con `readonly`,
 * igual que en el servidor: lo que puede tocar de más (los gestos del planning)
 * no es un nivel más alto, es una excepción declarada allí.
 */
export type { Role } from '@logic-camp/config/roles';

/** `role` llega como campo adicional del usuario de Better Auth (auth.ts:70). */
type Session = { user: { id: string; email: string; name: string; role?: string } } | null;

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<Session> => {
      if (activePortfolioScenario)
        return {
          user: {
            id: activePortfolioScenario.userId,
            email: activePortfolioScenario.email,
            name: activePortfolioScenario.name,
            role: 'demo',
          },
        };
      const res = await fetch('/api/auth/get-session', { credentials: 'same-origin' });
      if (!res.ok) return null;
      return ((await res.json()) as Session) ?? null;
    },
    staleTime: 60_000,
    retry: false,
  });
}

/** Rol de quien está dentro, o `null` si no se sabe (sin sesión o valor desconocido). */
export function useRol(): Role | null {
  const { data } = useSession();
  const rol = data?.user.role;
  return isRole(rol) ? rol : null;
}

/** Comparación pura para compartir la misma jerarquía con navegación y permisos visuales. */
export function tieneRol(rol: Role | null, min: Role): boolean {
  return roleAtLeast(rol, min);
}

/**
 * ¿Llega el rol de la sesión a `min`? Falla cerrado: un rol desconocido no ve
 * nada, igual que en el servidor.
 */
export function useTieneRol(min: Role): boolean {
  return tieneRol(useRol(), min);
}

/** Afordancia visual; la API vuelve a autorizar cada mutación. */
export function usePuede(capability: DashboardCapability): boolean {
  return hasDashboardCapability(useRol(), capability);
}

/**
 * ¿Este Worker ofrece acceso de demostración? (ADR 0029 §4)
 *
 * El dashboard es el MISMO bundle para todos los campings: no lleva ningún flag
 * de build ni credencial dentro. Pregunta, y en el Worker de un camping real la
 * ruta no existe (404) → no se pinta el botón y nadie se entera de que existe.
 */
export function useDemoDisponible(): boolean {
  const { data } = useQuery({
    queryKey: ['demo-disponible'],
    queryFn: async (): Promise<boolean> => {
      if (isPortfolioScenario) return true;
      const res = await fetch('/api/demo', { credentials: 'same-origin' });
      return res.ok;
    },
    staleTime: Infinity,
    retry: false,
  });
  return data === true;
}

/** Abre la puerta anónima: el Worker de la demo firma la sesión (ADR 0029 §4). */
export function useEntrarDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (isPortfolioScenario) return { ok: true };
      const res = await fetch('/api/demo/sign-in', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('demo_sign_in_failed');
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['session'] }),
  });
}

/**
 * Restablece los datos de la demo. El wipe borra `sessions`, así que la sesión
 * de quien pulsa muere con él: por eso vuelve a entrar por la puerta antes de
 * refrescar nada (ADR 0029 §4). Sin ese segundo paso, "restablecer" expulsaría
 * al visitante al login — justo la impresión contraria a la que se busca.
 */
export function useResetDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (isPortfolioScenario) {
        resetPortfolioScenario();
        return;
      }
      const res = await fetch('/api/demo/reset', { method: 'POST', credentials: 'same-origin' });
      if (!res.ok) throw new Error('demo_reset_failed');
      const volver = await fetch('/api/demo/sign-in', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!volver.ok) throw new Error('demo_sign_in_failed');
    },
    onSuccess: () => void qc.invalidateQueries(),
  });
}

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('bad_credentials');
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['session'] }),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['session'] }),
  });
}
