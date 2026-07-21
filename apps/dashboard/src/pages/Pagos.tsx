/**
 * Log de pagos (BACKLOG 8.x, ADR 0011): `payments` YA es el log — signo con
 * invariante 2 (sum(amount_cents) == paid_cents) — esta pantalla solo lo
 * hace visible con filtros, en vez de tener que abrir ficha por ficha.
 */
import { Button, EmptyState, SkeletonRows } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, type PaymentLogItem } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';
import { BotonAyuda } from '../components/BotonAyuda';

const PROVEEDORES = ['stripe', 'redsys', 'manual', 'none'] as const;
const ESTADOS = ['pending', 'succeeded', 'failed', 'refunded'] as const;

export default function Pagos() {
  const [proveedor, setProveedor] = useState<(typeof PROVEEDORES)[number] | 'todos'>('todos');
  const [estado, setEstado] = useState<(typeof ESTADOS)[number] | 'todos'>('todos');

  const params = new URLSearchParams();
  if (proveedor !== 'todos') params.set('provider', proveedor);
  if (estado !== 'todos') params.set('status', estado);
  const qs = params.toString();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['payments', proveedor, estado],
    queryFn: () => apiGet<{ items: PaymentLogItem[] }>(`/api/admin/payments${qs ? `?${qs}` : ''}`),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];
  const hayFiltro = proveedor !== 'todos' || estado !== 'todos';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <div
          className="flex flex-wrap items-center gap-1"
          role="group"
          aria-label={t('pagl.proveedor')}
        >
          <Button
            size="xs"
            variant={proveedor === 'todos' ? 'primary' : 'outline'}
            onClick={() => setProveedor('todos')}
            aria-pressed={proveedor === 'todos'}
          >
            {t('pagl.todos')}
          </Button>
          {PROVEEDORES.map((p) => (
            <Button
              key={p}
              size="xs"
              variant={proveedor === p ? 'primary' : 'outline'}
              onClick={() => setProveedor(p)}
              aria-pressed={proveedor === p}
            >
              {t(`pago.${p}`)}
            </Button>
          ))}
        </div>
        <div
          className="flex flex-wrap items-center gap-1"
          role="group"
          aria-label={t('res.estado')}
        >
          <Button
            size="xs"
            variant={estado === 'todos' ? 'primary' : 'outline'}
            onClick={() => setEstado('todos')}
            aria-pressed={estado === 'todos'}
          >
            {t('pagl.todos')}
          </Button>
          {ESTADOS.map((s) => (
            <Button
              key={s}
              size="xs"
              variant={estado === s ? 'primary' : 'outline'}
              onClick={() => setEstado(s)}
              aria-pressed={estado === s}
            >
              {t(`pago.${s}`)}
            </Button>
          ))}
        </div>
        <p className="tnum ml-auto text-[12px] text-muted-foreground">
          {t('pagl.n', { n: items.length })}
        </p>
        <BotonAyuda />
      </div>

      {/* Columnas del esqueleto = la rejilla real: fecha · reserva · proveedor · estado · importe. */}
      {isPending && (
        <div aria-busy="true" aria-label={t('pagl.cargando')} className="pt-1">
          <SkeletonRows rows={8} cols={['w-16', 'w-28', 'w-16', 'w-16', 'w-14']} />
        </div>
      )}
      {isError && <QueryError error={error} onRetry={() => refetch()} />}
      {!isPending && !isError && items.length === 0 && (
        <EmptyState
          art="inbox"
          title={t('pagl.vacio')}
          description={t('pagl.vacioDesc')}
          action={
            hayFiltro ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setProveedor('todos');
                  setEstado('todos');
                }}
              >
                {t('pagl.quitarFiltros')}
              </Button>
            ) : undefined
          }
        />
      )}

      <ul className="min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto">
        {items.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-[100px_1fr_auto] items-center gap-3 px-4 py-2.5 text-[13px] sm:grid-cols-[100px_1fr_120px_120px_auto]"
          >
            <span className="tnum text-muted-foreground">{fecha(p.createdAt)}</span>
            <span className="truncate font-medium">{p.bookingCode}</span>
            <span className="hidden text-muted-foreground sm:block">{t(`pago.${p.provider}`)}</span>
            <span className="hidden text-muted-foreground sm:block">{t(`pago.${p.status}`)}</span>
            <span
              className={`tnum justify-self-end ${p.amountCents < 0 ? 'text-destructive' : ''}`}
            >
              {eur(p.amountCents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
