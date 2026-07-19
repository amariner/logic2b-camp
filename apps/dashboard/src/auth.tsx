/** Sesión Better Auth por cookie (misma-origen). El servidor manda; la UI solo pregunta. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Session = { user: { id: string; email: string; name: string } } | null;

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
