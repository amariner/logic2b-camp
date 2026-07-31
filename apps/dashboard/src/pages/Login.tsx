/**
 * Login del gestor de camping: Better Auth por cookie, sin registro público (ADR 0005).
 *
 * Es la PRIMERA pantalla del producto (ADR 0020, C3): lleva marca Logic2B —
 * shadcn neutro, isotipo + wordmark como en el shell — no la paleta mediterránea
 * de la web pública del tenant.
 */
import { Button, Card, CardContent, Input, Label, Spinner, Wordmark } from '@logic-camp/ui';
import { useState } from 'react';
import { useDemoDisponible, useEntrarDemo, useSignIn } from '../auth';
import { t } from '../i18n';

export default function Login() {
  const signIn = useSignIn();
  const hayDemo = useDemoDisponible();
  const entrarDemo = useEntrarDemo();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex items-center justify-center gap-2">
          <Wordmark className="text-lg" />
        </div>

        <Card>
          <CardContent className="p-5">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                signIn.mutate({ email, password });
              }}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-[17px] font-semibold tracking-tight">{t('login.titulo')}</h1>
                <p className="text-[13px] text-muted-foreground">{t('login.subtitulo')}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email">{t('login.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  aria-invalid={signIn.isError || undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password">{t('login.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  aria-invalid={signIn.isError || undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-[14px]"
                />
              </div>

              {signIn.isError && (
                <p role="alert" className="text-[13px] font-medium text-destructive">
                  {t('login.error')}
                </p>
              )}

              <Button type="submit" disabled={signIn.isPending} className="w-full">
                {signIn.isPending && <Spinner />}
                {signIn.isPending ? t('login.entrando') : t('login.entrar')}
              </Button>
            </form>

            {/*
              Puerta anónima (ADR 0029). Solo aparece si el Worker la ofrece:
              en un camping real la sonda da 404 y aquí no se pinta nada.
              Separada del formulario a propósito — es otra intención, no una
              alternativa de credenciales.
            */}
            {hayDemo && (
              <div className="mt-5 flex flex-col gap-2 border-t pt-4">
                <p className="text-center text-[13px] text-muted-foreground">{t('login.oDemo')}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={entrarDemo.isPending}
                  onClick={() => entrarDemo.mutate()}
                >
                  {entrarDemo.isPending && <Spinner />}
                  {entrarDemo.isPending ? t('login.demoEntrando') : t('login.demo')}
                </Button>
                {entrarDemo.isError && (
                  <p role="alert" className="text-[13px] font-medium text-destructive">
                    {t('login.demoError')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
