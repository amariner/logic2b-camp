/**
 * Log de notificaciones (BACKLOG 7.x, ADR 0010): la tabla `notifications_log`
 * ya se poblaba desde la sesión 18 — esta pantalla solo la hace visible.
 * Solo lectura: el reenvío manual de fallidos queda en BACKLOG hasta que haya
 * un `RESEND_API_KEY` real con el que probarlo (sin él todo es "desactivada",
 * nunca "fallida" — no hay nada que reenviar todavía, ver ADR 0010).
 */
import {
  Button,
  EmptyState,
  SkeletonRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { D1_REFETCH_MS, apiGet, type NotificationLogItem, type NotificationStatus } from '../api';
import { QueryError } from '../components/QueryError';
import { t, tDyn } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

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
    refetchInterval: D1_REFETCH_MS,
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
        <div
          className="flex flex-wrap items-center gap-1"
          role="group"
          aria-label={t('res.estado')}
        >
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
        <p className="tnum ml-auto text-[12px] text-muted-foreground">
          {t('ntf.n', { n: items.length })}
        </p>
        <BotonAyuda />
      </div>

      <p className="border-b border-border/60 bg-accent/40 px-4 py-2 text-[12px] text-muted-foreground">
        {t('ntf.nota')}
      </p>

      {/* Columnas del esqueleto = las de la tabla: fecha · evento · destino · canal · intentos · estado. */}
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

      {/* Tabla del DS: la cabecera es lo que faltaba. Con ella, la columna de
          intentos deja de repetir su etiqueta en cada fila ("Intentos: 1") y
          pasa a ser un número alineado a la derecha, comparable de un vistazo.
          El chip de estado sigue siendo `lc-chip` y NO un `Badge` del DS a
          propósito: comparte el mapa de color con las barras del planning
          (`lc-bar`, ADR 0017) — cambiarlo lo rompería en dos sitios. */}
      {items.length > 0 && (
        <Table containerClassName="min-h-0 flex-1 overflow-auto">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="pl-4">{t('ntf.fecha')}</TableHead>
              <TableHead>{t('ntf.evento')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('ntf.destino')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('ntf.canal')}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">{t('ntf.intentos')}</TableHead>
              <TableHead className="pr-4 text-right">{t('res.estado')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="tnum w-[110px] pl-4 whitespace-nowrap text-muted-foreground">
                  {fechaHora(n.createdAt)}
                </TableCell>
                <TableCell className="max-w-64 truncate">
                  {tDyn(`notif.${n.template}`, n.template)}
                </TableCell>
                <TableCell className="hidden max-w-40 truncate font-medium sm:table-cell">
                  {destino(n)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {n.channel}
                </TableCell>
                <TableCell className="tnum hidden text-right text-muted-foreground sm:table-cell">
                  {n.attempts}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <span className={`lc-chip ntf-${n.status}`}>{t(`ntf.${n.status}`)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
