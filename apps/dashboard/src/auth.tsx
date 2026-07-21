/** Sesión Better Auth por cookie (misma-origen). El servidor manda; la UI solo pregunta. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Los mismos cuatro roles de `apps/api/src/auth.ts`, con su misma jerarquía.
 *
 * La UI los usa SOLO para no ofrecer un botón que va a devolver 403 — quien
 * decide sigue siendo el servidor (`requireRole`). Ocultar aquí es cortesía con
 * la recepcionista, nunca la barrera de seguridad.
 */
const ROLES = ['readonly', 'reception', 'manager', 'owner'] as const;
export type Role = (typeof ROLES)[number];

const NIVEL: Record<Role, number> = { readonly: 0, reception: 1, manager: 2, owner: 3 };

const esRole = (v: unknown): v is Role =>
  typeof v === 'string' && (ROLES as readonly string[]).includes(v);

/** `role` llega como campo adicional del usuario de Better Auth (auth.ts:70). */
type Session = { user: { id: string; email: string; name: string; role?: string } } | null;

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<Session> => {
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
  return esRole(rol) ? rol : null;
}

/**
 * ¿Llega el rol de la sesión a `min`? Falla cerrado: un rol desconocido no ve
 * nada, igual que en el servidor.
 */
export function useTieneRol(min: Role): boolean {
  const rol = useRol();
  return rol !== null && NIVEL[rol] >= NIVEL[min];
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
