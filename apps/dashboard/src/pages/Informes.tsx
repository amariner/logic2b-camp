/**
 * Informes (ADR 0008, sesión 20): los números que gerencia mira cada lunes.
 * Tiles de titular + ocupación por tipo como medidor de un solo tono (magnitud):
 * el color es primary, el texto SIEMPRE en foreground, la estructura recesiva.
 */
import { Button, Card, CardDescription, CardHeader, CardTitle, Skeleton } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, type Catalog, type ReportsData } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';
import { BotonAyuda } from '../components/BotonAyuda';

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
    <Card>
      <CardHeader className="gap-0.5 px-4 py-3">
        {/* min-h de 2 líneas: un titular largo (o su traducción) no hunde la cifra
            respecto a las tarjetas vecinas — las cinco comparten línea base. */}
        <CardDescription className="min-h-[2lh] text-[11px] leading-snug font-semibold tracking-[0.1em] uppercase">
          {titulo}
        </CardDescription>
        <CardTitle className="tnum text-[22px] leading-tight">{valor}</CardTitle>
        {detalle && <p className="tnum text-[12px] text-muted-foreground">{detalle}</p>}
      </CardHeader>
    </Card>
  );
}

/**
 * Esqueleto con la forma real del informe: las cinco tarjetas de cifra y el
 * medidor de ocupación por tipo. Nada de un rectángulo genérico (ADR 0020).
 */
function InformesEsqueleto() {
  return (
    <div aria-busy="true" className="min-h-0 flex-1 overflow-hidden p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="gap-0.5 px-4 py-3">
              <div className="min-h-[2lh] text-[11px] leading-snug">
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-5 w-24" />
              {i === 1 && <Skeleton className="mt-1 h-2.5 w-16" />}
            </CardHeader>
          </Card>
        ))}
      </div>
      <section className="mt-6 max-w-3xl">
        <Skeleton className="mb-2 h-2.5 w-40" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <div className="mb-0.5 flex items-baseline justify-between gap-2">
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-(--lc-radius)" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Informes() {
  const presets = rangos();
  const [rango, setRango] = useState(presets[0]!);

  const { data, isPending, isError, error, refetch } = useQuery({
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
        <div className="flex flex-wrap items-center gap-1">
          {presets.map((p) => (
            <Button
              key={p.id}
              type="button"
              size="xs"
              variant={p.id === rango.id ? 'primary' : 'outline'}
              onClick={() => setRango(p)}
              aria-pressed={p.id === rango.id}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <p className="tnum text-[13px] text-muted-foreground">
          {fecha(rango.from)} → {fecha(rango.to)}
        </p>
        <BotonAyuda className="ml-auto" />
      </div>

      {isPending && <InformesEsqueleto />}
      {isError && <QueryError error={error} onRetry={() => void refetch()} />}

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
