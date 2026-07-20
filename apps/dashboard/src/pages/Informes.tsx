/**
 * Informes (ADR 0008, sesión 20): los números que gerencia mira cada lunes.
 * Tiles de titular + ocupación por tipo como medidor de un solo tono (magnitud):
 * el color es primary, el texto SIEMPRE en foreground, la estructura recesiva.
 */
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, type Catalog, type ReportsData } from '../api';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Rangos con un click: lo que se consulta el 95% de las veces. */
function rangos(): { id: string; label: string; from: string; to: string }[] {
  const hoy = new Date();
  const y = hoy.getUTCFullYear();
  const m = hoy.getUTCMonth();
  return [
    {
      id: 'mes',
      label: t('inf.esteMes'),
      from: iso(new Date(Date.UTC(y, m, 1))),
      to: iso(new Date(Date.UTC(y, m + 1, 1))),
    },
    {
      id: 'proximo',
      label: t('inf.proximoMes'),
      from: iso(new Date(Date.UTC(y, m + 1, 1))),
      to: iso(new Date(Date.UTC(y, m + 2, 1))),
    },
    {
      id: 'temporada',
      label: t('inf.temporada'),
      from: iso(hoy),
      to: iso(new Date(Date.UTC(y, m + 3, hoy.getUTCDate()))),
    },
  ];
}

function Tile({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-(--lc-radius-lg) border border-border/60 px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {titulo}
      </p>
      <p className="tnum mt-0.5 text-[22px] leading-tight font-semibold">{valor}</p>
      {detalle && <p className="tnum text-[12px] text-muted-foreground">{detalle}</p>}
    </div>
  );
}

export default function Informes() {
  const presets = rangos();
  const [rango, setRango] = useState(presets[0]!);

  const { data, isPending, isError } = useQuery({
    queryKey: ['reports', rango.from, rango.to],
    queryFn: () => apiGet<ReportsData>(`/api/admin/reports?from=${rango.from}&to=${rango.to}`),
  });
  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
  });

  const tipoNombre = (id: string) =>
    catalog?.unitTypes.find((ut) => ut.id === id)?.nameI18n.es ?? id;

  const global = data
    ? (() => {
        const cap = data.occupancy.reduce((s, o) => s + o.capacityNights, 0);
        const occ = data.occupancy.reduce((s, o) => s + o.occupiedNights, 0);
        return cap ? Math.round((occ / cap) * 1000) / 10 : 0;
      })()
    : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center overflow-hidden rounded-(--lc-radius) border border-foreground/20 text-[13px] font-medium">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setRango(p)}
              aria-pressed={p.id === rango.id}
              className={`px-3 py-1 ${p.id === rango.id ? 'bg-primary text-background' : 'hover:bg-accent'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="tnum text-[13px] text-muted-foreground">
          {fecha(rango.from)} → {fecha(rango.to)}
        </p>
      </div>

      {isPending && <p className="p-6 text-[14px] text-muted-foreground">{t('inf.cargando')}</p>}
      {isError && <p className="p-6 text-[14px] font-medium text-destructive">{t('inf.error')}</p>}

      {data && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {/* titulares del periodo */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Tile titulo={t('inf.ocupacion')} valor={`${global}%`} />
            <Tile
              titulo={t('inf.ingresos')}
              valor={eur(data.revenue.totalCents)}
              detalle={t('inf.reservasN', { n: data.revenue.bookings })}
            />
            <Tile titulo={t('inf.cobrado')} valor={eur(data.revenue.paidCents)} />
            <Tile titulo={t('inf.llegadas')} valor={String(data.arrivals)} />
            <Tile titulo={t('inf.salidas')} valor={String(data.departures)} />
          </div>

          {/* ocupación por tipo: medidor de un solo tono, texto en foreground */}
          <section className="mt-6 max-w-3xl">
            <h2 className="lc-panel-h">{t('inf.ocupacionPor')}</h2>
            <ul className="flex flex-col gap-2.5">
              {data.occupancy.map((o) => (
                <li key={o.unitTypeId}>
                  <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="font-medium">
                      {tipoNombre(o.unitTypeId)}{' '}
                      <span className="tnum text-muted-foreground">
                        · {t('inf.unidades', { n: o.units })}
                      </span>
                    </span>
                    <span className="tnum font-semibold">{o.occupancyPct}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-(--lc-radius) bg-accent"
                    role="img"
                    aria-label={`${tipoNombre(o.unitTypeId)}: ${o.occupancyPct}%`}
                    title={t('inf.nochesOcupadas', {
                      ocupadas: o.occupiedNights,
                      capacidad: o.capacityNights,
                    })}
                  >
                    <div
                      className="h-full rounded-(--lc-radius) bg-primary"
                      style={{ width: `${Math.min(100, o.occupancyPct)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
