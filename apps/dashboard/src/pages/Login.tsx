/** Login del mostrador: Better Auth por cookie, sin registro público (ADR 0005). */
import { useState } from 'react';
import { useSignIn } from '../auth';
import { t } from '../i18n';

export default function Login() {
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          signIn.mutate({ email, password });
        }}
      >
        <h1 className="text-[22px] font-semibold tracking-tight">{t('login.titulo')}</h1>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
            {t('login.email')}
          </span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-(--lc-radius) border border-foreground/20 bg-background px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
            {t('login.password')}
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-(--lc-radius) border border-foreground/20 bg-background px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <button
          type="submit"
          disabled={signIn.isPending}
          className="rounded-(--lc-radius) bg-primary px-6 py-3 text-[15px] font-semibold text-background transition-colors hover:bg-primary disabled:opacity-60"
        >
          {signIn.isPending ? t('login.entrando') : t('login.entrar')}
        </button>
        {signIn.isError && <p className="text-[14px] font-medium text-destructive">{t('login.error')}</p>}
      </form>
    </main>
  );
}
