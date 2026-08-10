/**
 * Lista de reservas (ADR 0008, sesión 19): búsqueda por código, filtro por
 * estado y paginación. La ficha se abre al lado; el alta manual comparte
 * motor y precio-en-servidor con la web pública.
 */
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import {
  Button,
  EmptyState,
  Input,
  SelectNative,
  SkeletonRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  focusRing,
} from '@logic-camp/ui';
import { apiGet, type BookingDetail, type BookingListItem } from '../api';
import { usePuede } from '../auth';
import BookingPanel from '../components/BookingPanel';
import NewBookingPanel from '../components/NewBookingPanel';
import { QueryError } from '../components/QueryError';
import { eur, fecha, noches } from '../lib/format';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

const ESTADOS: BookingDetail['status'][] = [
  'pending',
  'confirmed',
  'cancelled',
  'no_show',
  'completed',
];
const PAGE_SIZE = 25;

export default function Reservas() {
  const puedeCrear = usePuede('booking:create');
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<BookingDetail['status'] | ''>('');
  const [page, setPage] = useState(1);
  // el panel es direccionable por la URL (/reservas/$id, ADR 0022 §4): se puede
  // enviar por email a un compañero. La lista sigue en /reservas.
  const navigate = useNavigate();
  const { id: openId } = useParams({ strict: false }) as { id?: string };
  const [altaAbierta, setAltaAbierta] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q.trim()) params.set('q', q.trim().toUpperCase());
  if (estado) params.set('status', estado);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'list', params.toString()],
    queryFn: () => apiGet<{ items: BookingListItem[] }>(`/api/admin/bookings?${params}`),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];

  const openPanel = (id: string, el: HTMLElement) => {
    openerRef.current = el;
    setAltaAbierta(false);
    void navigate({ to: '/reservas/$id', params: { id } });
  };
  const closePanel = () => {
    void navigate({ to: '/reservas' });
    openerRef.current?.focus();
    openerRef.current = null;
  };

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <Input
            type="search"
            placeholder={t('res.buscar')}
            aria-label={t('res.buscar')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="tnum w-44"
          />
          <SelectNative
            aria-label={t('res.estado')}
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as BookingDetail['status'] | '');
              setPage(1);
            }}
          >
            <option value="">{t('res.todas')}</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {t(`estado.${s}`)}
              </option>
            ))}
          </SelectNative>
          <div className="flex items-center gap-1 text-[13px]">
            <Button
              variant="outline"
              size="iconSm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label={t('res.anterior')}
            >
              ←
            </Button>
            <span className="tnum px-1 text-muted-foreground">{t('res.pagina', { n: page })}</span>
            <Button
              variant="outline"
              size="iconSm"
              disabled={items.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              aria-label={t('res.siguiente')}
            >
              →
            </Button>
          </div>
          {puedeCrear && (
            <Button
              size="xs"
              className="ml-auto"
              onClick={() => {
                void navigate({ to: '/reservas' });
                setAltaAbierta(true);
              }}
            >
              {t('res.nueva')}
            </Button>
          )}
          <BotonAyuda className={puedeCrear ? undefined : 'ml-auto'} />
        </div>

        {isPending && (
          /* Las 8 columnas de la tabla real: código · titular · fechas · unidad ·
             canal · estado · total · pendiente. */
          <div aria-busy="true" aria-label={t('res.cargando')}>
            <SkeletonRows
              rows={10}
              cols={['w-20', 'w-28', 'w-36', 'w-12', 'w-16', 'w-16', 'w-16', 'w-14']}
            />
          </div>
        )}
        {isError && <QueryError error={error} onRetry={() => refetch()} />}
        {!isPending && !isError && items.length === 0 && (
          <EmptyState
            art="search"
            title={t('res.vacio')}
            /* Salida: si el vacío lo han causado los filtros, se pueden quitar. */
            action={
              q || estado ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQ('');
                    setEstado('');
                    setPage(1);
                  }}
                >
                  {t('res.limpiarFiltros')}
                </Button>
              ) : undefined
            }
          />
        )}

        {items.length > 0 && (
          /* Tabla del DS (B1, sesión 52): antes era markup propio con las clases
             de `TableHead`/`TableCell` copiadas a mano — copiadas se
             desincronizan, importadas no. `containerClassName` es el contenedor
             de scroll, que es quien tiene que desplazar para que la cabecera se
             quede pegada. */
          <Table containerClassName="min-h-0 flex-1 overflow-auto">
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="pl-4 whitespace-nowrap">{t('res.codigo')}</TableHead>
                <TableHead>{t('res.titular')}</TableHead>
                <TableHead>{t('res.fechas')}</TableHead>
                <TableHead>{t('res.unidad')}</TableHead>
                <TableHead>{t('res.canal')}</TableHead>
                <TableHead>{t('res.estado')}</TableHead>
                <TableHead className="text-right">{t('res.total')}</TableHead>
                <TableHead className="pr-4 text-right">{t('res.pendiente')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => {
                const pendiente = b.totalCents - b.paidCents;
                // "En casa" se deriva (ADR 0022), igual que en el planning/plano.
                const estadoVista =
                  b.status === 'confirmed' && b.checkedInAt && !b.checkedOutAt
                    ? 'inhouse'
                    : b.status;
                const debe = pendiente > 0 && b.status !== 'cancelled';
                return (
                  <TableRow
                    key={b.id}
                    onClick={(e) => openPanel(b.id, e.currentTarget)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openPanel(b.id, e.currentTarget);
                      }
                    }}
                    tabIndex={0}
                    /* Fila entera clicable: no es un <button> (rompería la
                       tabla). El anillo de foco viene del DS (`focusRing`), no
                       copiado clase a clase. */
                    className={cn('cursor-pointer focus-visible:ring-inset', focusRing)}
                  >
                    {/* El código NO se parte: con la ficha abierta la lista se
                        estrecha y `CS-2026-0008` se partía en tres líneas,
                        triplicando la altura de cada fila (la densidad es
                        requisito, CLAUDE.md). Antes de que sobre ancho, scroll. */}
                    <TableCell className="tnum pl-4 font-semibold whitespace-nowrap">
                      {b.code}
                    </TableCell>
                    <TableCell className="max-w-40 truncate font-medium">
                      {b.leadName ?? '—'}
                    </TableCell>
                    <TableCell className="tnum whitespace-nowrap text-muted-foreground">
                      {fecha(b.dateFrom)} → {fecha(b.dateTo)} · {noches(b.dateFrom, b.dateTo)}n
                    </TableCell>
                    <TableCell className="tnum">{b.unitCode ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t(`canal.${b.channel}`)}
                    </TableCell>
                    <TableCell>
                      <span className={`lc-chip st-${estadoVista}`}>
                        {t(`estado.${estadoVista}`)}
                      </span>
                    </TableCell>
                    <TableCell className="tnum text-right">{eur(b.totalCents)}</TableCell>
                    <TableCell
                      className={cn(
                        'tnum pr-4 text-right',
                        debe ? 'font-medium text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {debe ? eur(pendiente) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {openId && <BookingPanel bookingId={openId} onClose={closePanel} />}
      {puedeCrear && altaAbierta && (
        <NewBookingPanel
          onClose={() => setAltaAbierta(false)}
          onCreated={(id) => {
            setAltaAbierta(false);
            void navigate({ to: '/reservas/$id', params: { id } });
          }}
        />
      )}
    </div>
  );
}
