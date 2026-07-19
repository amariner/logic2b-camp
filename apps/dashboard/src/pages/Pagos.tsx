/**
 * Log de pagos (BACKLOG 8.x, ADR 0011): `payments` YA es el log — signo con
 * invariante 2 (sum(amount_cents) == paid_cents) — esta pantalla solo lo
 * hace visible con filtros, en vez de tener que abrir ficha por ficha.
 */
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, type PaymentLogItem } from '../api';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';

const PROVEEDORES = ['stripe', 'redsys', 'manual', 'none'] as const;
const ESTADOS = ['pending', 'succeeded', 'failed', 'refunded'] as const;

export default function Pagos() {
  const [proveedor, setProveedor] = useState<(typeof PROVEEDORES)[number] | 'todos'>('todos');
  const [estado, setEstado] = useState<(typeof ESTADOS)[number] | 'todos'>('todos');

  const params = new URLSearchParams();
  if (proveedor !== 'todos') params.set('provider', proveedor);
  if (estado !== 'todos') params.set('status', estado);
  const qs = params.toString();

  const { data, isPending, isError } = useQuery({
    queryKey: ['payments', proveedor, estado],
    queryFn: () => apiGet<{ items: PaymentLogItem[] }>(`/api/admin/payments${qs ? `?${qs}` : ''}`),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-arena/60 px-4 py-2.5">
        <div className="flex flex-wrap items-center overflow-hidden rounded-(--lc-radius) border border-tinta/20 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setProveedor('todos')}
            aria-pressed={proveedor === 'todos'}
            className={`px-3 py-1 ${proveedor === 'todos' ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
          >
            {t('pagl.todos')}
          </button>
          {PROVEEDORES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProveedor(p)}
              aria-pressed={proveedor === p}
              className={`px-3 py-1 ${proveedor === p ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
            >
              {t(`pago.${p}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center overflow-hidden rounded-(--lc-radius) border border-tinta/20 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setEstado('todos')}
            aria-pressed={estado === 'todos'}
            className={`px-3 py-1 ${estado === 'todos' ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
          >
            {t('pagl.todos')}
          </button>
          {ESTADOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setEstado(s)}
              aria-pressed={estado === s}
              className={`px-3 py-1 ${estado === s ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
            >
              {t(`pago.${s}`)}
            </button>
          ))}
        </div>
        <p className="tnum ml-auto text-[12px] text-tinta-suave">{t('pagl.n', { n: items.length })}</p>
      </div>

      {isPending && <p className="p-6 text-[14px] text-tinta-suave">{t('pagl.cargando')}</p>}
      {isError && <p className="p-6 text-[14px] font-medium text-mar">{t('pagl.error')}</p>}
      {!isPending && !isError && items.length === 0 && (
        <p className="p-6 text-[14px] text-tinta-suave">{t('pagl.vacio')}</p>
      )}

      <ul className="min-h-0 flex-1 divide-y divide-arena/40 overflow-y-auto">
        {items.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-[100px_1fr_auto] items-center gap-3 px-4 py-2.5 text-[13px] sm:grid-cols-[100px_1fr_120px_120px_auto]"
          >
            <span className="tnum text-tinta-suave">{fecha(p.createdAt)}</span>
            <span className="truncate font-medium">{p.bookingCode}</span>
            <span className="hidden text-tinta-suave sm:block">{t(`pago.${p.provider}`)}</span>
            <span className="hidden text-tinta-suave sm:block">{t(`pago.${p.status}`)}</span>
            <span className={`tnum justify-self-end ${p.amountCents < 0 ? 'text-mar' : ''}`}>
              {eur(p.amountCents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
