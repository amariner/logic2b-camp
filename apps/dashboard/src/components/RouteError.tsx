/**
 * Error boundary por ruta (ADR 0020, C3).
 *
 * Hasta hoy el dashboard tenía CERO: un throw en render dejaba la pantalla en
 * blanco, sin sidebar y sin manera de salir salvo recargar a mano. Ahora el
 * fallo queda confinado al `<Outlet>` — la navegación sigue viva y siempre hay
 * dos salidas: reintentar y volver al planning.
 */
import { ErrorState, Button } from '@logic-camp/ui';
import { Link } from '@tanstack/react-router';
import { t } from '../i18n';

export function RouteError({ reset }: { error?: unknown; reset?: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState
        title={t('err.rota.titulo')}
        description={t('err.rota.desc')}
        action={
          <>
            <Button size="sm" onClick={() => (reset ? reset() : window.location.reload())}>
              {t('err.reintentar')}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/">{t('err.alPlanning')}</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}

/** Ruta inexistente. Antes de C3 era un "Not Found" pelado, sin salida. */
export function RouteNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState
        title={t('err.noExiste.titulo')}
        description={t('err.noExiste.desc')}
        action={
          <Button size="sm" asChild>
            <Link to="/">{t('err.alPlanning')}</Link>
          </Button>
        }
      />
    </div>
  );
}
