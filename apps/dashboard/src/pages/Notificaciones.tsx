/**
 * Log de notificaciones (BACKLOG 7.x, ADR 0010): la tabla `notifications_log`
 * ya se poblaba desde la sesión 18 — esta pantalla solo la hace visible.
 * Solo lectura: el reenvío manual de fallidos queda en BACKLOG hasta que haya
 * un `RESEND_API_KEY` real con el que probarlo (sin él todo es "desactivada",
 * nunca "fallida" — no hay nada que reenviar todavía, ver ADR 0010).
 */
import { Button, EmptyState, SkeletonRows } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, type NotificationLogItem, type NotificationStatus } from '../api';
import { QueryError } from '../components/QueryError';
import { t, tDyn } from '../i18n';

const ESTADOS: NotificationStatus[] = ['sent', 'queued', 'failed', 'disabled'];

const fechaHora = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    : t('ntf.sinFecha');

export default function Notificaciones() {
  const [filtro, setFiltro] = useState<NotificationStatus | 'todas'>('todas');

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['notifications', filtro],
    queryFn: () =>
      apiGet<{ items: NotificationLogItem[] }>(
        `/api/admin/notifications${filtro === 'todas' ? '' : `?status=${filtro}`}`,
      ),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];

  const destino = (n: NotificationLogItem) => {
    if (n.bookingCode) return n.bookingCode;
    if (n.enquiryContact) return n.enquiryContact.name;
    return '—';
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t('res.estado')}>
          <Button
            size="xs"
            variant={filtro === 'todas' ? 'primary' : 'outline'}
            onClick={() => setFiltro('todas')}
            aria-pressed={filtro === 'todas'}
          >
            {t('ntf.todas')}
          </Button>
          {ESTADOS.map((s) => (
            <Button
              key={s}
              size="xs"
              variant={filtro === s ? 'primary' : 'outline'}
              onClick={() => setFiltro(s)}
              aria-pressed={filtro === s}
            >
              {t(`ntf.${s}`)}
            </Button>
          ))}
        </div>
        <p className="tnum ml-auto text-[12px] text-muted-foreground">{t('ntf.n', { n: items.length })}</p>
      </div>

      <p className="border-b border-border/60 bg-accent/40 px-4 py-2 text-[12px] text-muted-foreground">
        {t('ntf.nota')}
      </p>

      {/* Columnas del esqueleto = la rejilla real: fecha · evento · destino · canal · intentos · estado. */}
      {isPending && (
        <div aria-busy="true" aria-label={t('ntf.cargando')} className="pt-1">
          <SkeletonRows rows={8} cols={['w-16', 'w-48', 'w-28', 'w-10', 'w-14', 'w-16']} />
        </div>
      )}
      {isError && <QueryError error={error} onRetry={() => refetch()} />}
      {!isPending && !isError && items.length === 0 && (
        <EmptyState
          art="inbox"
          title={t('ntf.vacio')}
          description={t('ntf.vacioDesc')}
          action={
            filtro !== 'todas' ? (
              <Button size="sm" variant="outline" onClick={() => setFiltro('todas')}>
                {t('ntf.quitarFiltro')}
              </Button>
            ) : undefined
          }
        />
      )}

      <ul className="min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto">
        {items.map((n) => (
          <li
            key={n.id}
            className="grid grid-cols-[100px_1fr_auto] items-center gap-3 px-4 py-2.5 text-[13px] sm:grid-cols-[100px_260px_1fr_60px_auto_auto]"
          >
            <span className="tnum text-muted-foreground">{fechaHora(n.createdAt)}</span>
            <span className="truncate">{tDyn(`notif.${n.template}`, n.template)}</span>
            <span className="hidden truncate font-medium sm:block">{destino(n)}</span>
            <span className="hidden text-muted-foreground sm:block">{n.channel}</span>
            <span className="tnum hidden text-muted-foreground sm:block">
              {t('ntf.intentos')}: {n.attempts}
            </span>
            <span className={`lc-chip ntf-${n.status} justify-self-end`}>{t(`ntf.${n.status}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
