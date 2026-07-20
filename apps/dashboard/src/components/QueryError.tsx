/**
 * Error de consulta, diferenciado por código (ADR 0020, C3).
 *
 * Hasta hoy 401, 403 y 500 eran el MISMO `<p>` rojo. No es lo mismo: la sesión
 * caducada se arregla volviendo a entrar, la falta de permiso no se arregla
 * reintentando (y conviene decir de quién depende), y un 500 sí merece un botón
 * de reintentar. Decirlo mal hace que la recepcionista llame por teléfono.
 */
import { Button, ErrorState } from '@logic-camp/ui';
import { ApiError } from '../api';
import { t } from '../i18n';

/** Clasifica cualquier error de query en algo que se le pueda contar a una persona. */
export function clasificar(error: unknown): 'sesion' | 'permiso' | 'red' | 'servidor' {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'sesion';
    if (error.status === 403) return 'permiso';
    if (error.status >= 500) return 'servidor';
    return 'servidor';
  }
  // fetch rechaza (sin respuesta) cuando no hay red o el Worker está caído
  return 'red';
}

export function QueryError({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  /** Texto propio de la pantalla, si lo tiene (`planning.error`, `cli.error`…). */
  className?: string;
}) {
  const tipo = clasificar(error);

  if (tipo === 'sesion') {
    return (
      <ErrorState
        className={className}
        title={t('err.sesion.titulo')}
        description={t('err.sesion.desc')}
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            {t('err.sesion.entrar')}
          </Button>
        }
      />
    );
  }

  if (tipo === 'permiso') {
    return (
      <ErrorState
        className={className}
        title={t('err.permiso.titulo')}
        description={t('err.permiso.desc')}
      />
    );
  }

  return (
    <ErrorState
      className={className}
      title={tipo === 'red' ? t('err.red.titulo') : t('err.servidor.titulo')}
      description={tipo === 'red' ? t('err.red.desc') : t('err.servidor.desc')}
      action={
        onRetry && (
          <Button size="sm" onClick={onRetry}>
            {t('err.reintentar')}
          </Button>
        )
      }
    />
  );
}
