/**
 * Parte de viajeros (ADR 0028): SES.Hospedajes / RD 933/2021. Reúne las llegadas de
 * un día, avisa de los datos que faltan (con salto a la ficha para rellenarlos) y,
 * cuando está completo, deja descargar el XML o enviarlo al webservice si el camping
 * tiene credenciales. Pantalla de GESTIÓN — es una obligación legal, no de mostrador.
 *
 * B1 (sesión 59): campo de fecha al `Input` del DS (era un `<input>` a mano sin
 * anillo de foco), estados vacíos al `EmptyState`, y la forma de pago deja de ir
 * en un `justify-between` a lo ancho de la fila: medida a 1366px, el desplegable
 * quedaba a **810px** del código de reserva al que pertenece — más cerca de la
 * fila de abajo que de la suya. Ahora es una columna de ancho fijo con cabecera,
 * compartida por cabecera y filas en UNA constante (regla de la sesión 55: en una
 * lista de filas que no son `<table>`, ninguna columna `auto`).
 */
import { errorMutacion } from '../avisos';
import { Button, EmptyState, Input, SelectNative, Skeleton, toast } from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle2, Download, Send } from 'lucide-react';
import { useState } from 'react';
import {
  apiGet,
  apiPost,
  ApiError,
  type ParteData,
  type ParteEstanciaItem,
  type ParteIssue,
  type PaymentKind,
} from '../api';
import { BotonAyuda } from '../components/BotonAyuda';
import { QueryError } from '../components/QueryError';
import { t, tDyn } from '../i18n';
import { fecha } from '../lib/format';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) => {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

const PAYMENT_KINDS: PaymentKind[] = ['cash', 'card', 'transfer', 'platform'];

/** Descripción legible de un dato que falta: quién y qué campo. */
function issueLabel(i: ParteIssue): string {
  const campo = tDyn(`parte.campo.${i.field}`, i.field);
  return i.guestName ? `${i.guestName}: ${campo}` : campo;
}

function PaymentKindSelect({ estancia }: { estancia: ParteEstanciaItem }) {
  const qc = useQueryClient();
  const set = useMutation({
    mutationFn: (value: PaymentKind | null) =>
      apiPost(`/api/admin/bookings/${estancia.bookingId}`, {
        action: 'set_payment_kind',
        paymentKind: value,
      }),
    onSuccess: () => {
      toast.success(t('parte.pagoGuardado'));
      void qc.invalidateQueries({ queryKey: ['parte'] });
    },
    onError: (e) => errorMutacion(e, t('parte.pagoError')),
  });

  return (
    <SelectNative
      aria-label={t('parte.formaPago')}
      value={estancia.paymentKind ?? ''}
      disabled={set.isPending}
      onChange={(e) => set.mutate((e.target.value || null) as PaymentKind | null)}
      className="w-full text-[13px]"
    >
      <option value="">{t('parte.sinFormaPago')}</option>
      {PAYMENT_KINDS.map((k) => (
        <option key={k} value={k}>
          {t(`pago.${k}`)}
        </option>
      ))}
    </SelectNative>
  );
}

/**
 * Las dos columnas de la lista, en un solo sitio: cabecera y filas se mueven a
 * la vez o no se mueven. La segunda es de ancho FIJO — con `auto` la anchura del
 * desplegable la fijaría la fila más ancha y la columna bailaría.
 */
const FILA = 'grid grid-cols-[minmax(0,1fr)_11rem] items-start gap-x-4';

function EstanciaRow({ estancia, issues }: { estancia: ParteEstanciaItem; issues: ParteIssue[] }) {
  const propias = issues.filter((i) => i.bookingId === estancia.bookingId);
  return (
    <li className={`${FILA} rounded-(--lc-radius-lg) border border-border/60 p-3`}>
      <div className="min-w-0">
        <div>
          <Link
            to="/reservas/$id"
            params={{ id: estancia.bookingId }}
            className="font-medium hover:underline"
          >
            {estancia.bookingCode}
          </Link>
          <span className="tnum ml-2 text-[13px] text-muted-foreground">
            {fecha(estancia.dateFrom)} → {fecha(estancia.dateTo)}
          </span>
        </div>

        <p className="mt-1 truncate text-[13px] text-muted-foreground">
          {estancia.guests.length
            ? estancia.guests.map((g) => `${g.name} ${g.surname}`.trim()).join(', ')
            : t('parte.sinHuespedes')}
        </p>

        {propias.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {propias.map((i, idx) => (
              <li
                key={`${i.guestId ?? 'stay'}-${i.field}-${idx}`}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
              >
                <AlertTriangle
                  className="size-3.5 shrink-0 text-(--lc-status-pending)"
                  aria-hidden="true"
                />
                {issueLabel(i)}
              </li>
            ))}
            <li>
              <Link
                to="/reservas/$id"
                params={{ id: estancia.bookingId }}
                className="text-[13px] text-primary hover:underline"
              >
                {t('parte.completar')}
              </Link>
            </li>
          </ul>
        )}
      </div>

      <PaymentKindSelect estancia={estancia} />
    </li>
  );
}

export default function Parte() {
  const [date, setDate] = useState(() => iso(new Date()));
  const qc = useQueryClient();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['parte', date],
    queryFn: () => apiGet<ParteData>(`/api/admin/hospedajes/parte?date=${date}`),
  });

  const enviar = useMutation({
    mutationFn: () =>
      apiPost<{ ok: true; reference: string | null }>('/api/admin/hospedajes/enviar', { date }),
    onSuccess: (r) => {
      toast.success(r.reference ? t('parte.enviadoRef', { ref: r.reference }) : t('parte.enviado'));
      void qc.invalidateQueries({ queryKey: ['parte'] });
    },
    onError: (e) => {
      const code = e instanceof ApiError ? String((e.body as { error?: string })?.error) : '';
      toast.error(tDyn(`parte.error.${code}`, t('parte.errorEnviar')));
    },
  });

  const descargar = () => {
    if (!data?.xml) return;
    const blob = new Blob([data.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parte-viajeros-${date}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ready = data?.status === 'ready';
  const puedeEnviar = ready && data?.transport === 'ses';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="iconSm"
            variant="outline"
            onClick={() => setDate((d) => addDays(d, -1))}
            aria-label={t('parte.diaAnterior')}
          >
            ←
          </Button>
          {/* `Input` del DS, como en Llegadas (sesión 56): el campo a mano no
              tenía el anillo de foco del sistema y no llegaba a la altura de sus
              vecinos (29,5px contra 28px — desalineado por 1,5px). */}
          <Input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label={t('parte.dia')}
            className="tnum w-auto"
          />
          <Button
            type="button"
            size="iconSm"
            variant="outline"
            onClick={() => setDate((d) => addDays(d, 1))}
            aria-label={t('parte.diaSiguiente')}
          >
            →
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button type="button" size="xs" variant="outline" onClick={descargar} disabled={!ready}>
            <Download className="size-3.5" />
            {t('parte.descargar')}
          </Button>
          {data?.transport === 'ses' && (
            <Button
              type="button"
              size="xs"
              onClick={() => enviar.mutate()}
              disabled={!puedeEnviar || enviar.isPending}
            >
              <Send className="size-3.5" />
              {t('parte.enviar')}
            </Button>
          )}
          <BotonAyuda />
        </div>
      </div>

      {isPending && (
        <div aria-busy="true" className="flex flex-col gap-2 p-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-(--lc-radius-lg)" />
          ))}
        </div>
      )}
      {isError && <QueryError error={error} onRetry={() => void refetch()} />}

      {data && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {data.status === 'disabled' && (
            <EmptyState
              art="inbox"
              title={t('parte.noConfiguradoTitulo')}
              description={t('parte.noConfigurado')}
            />
          )}

          {data.status === 'empty' && (
            <EmptyState
              art="calendar"
              title={t('parte.sinLlegadasTitulo')}
              description={t('parte.sinLlegadas', { fecha: fecha(date) })}
            />
          )}

          {(data.status === 'issues' || data.status === 'ready') && (
            <>
              <div className="mb-3 flex items-center gap-2 text-[13px]">
                {data.status === 'ready' ? (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    {t('parte.listo', { n: data.count ?? 0 })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <AlertTriangle
                      className="size-4 text-(--lc-status-pending)"
                      aria-hidden="true"
                    />
                    {t('parte.faltanDatos', { n: data.issues?.length ?? 0 })}
                  </span>
                )}
              </div>
              <div className="max-w-3xl">
                <div
                  /* `border-transparent`: la fila lleva borde de 1px, y sin él la
                     cabecera arrancaría 1px a la izquierda de su columna. */
                  className={`${FILA} border border-transparent px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase`}
                >
                  <span>{t('parte.colEstancia')}</span>
                  <span>{t('parte.formaPago')}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {(data.estancias ?? []).map((e) => (
                    <EstanciaRow key={e.bookingId} estancia={e} issues={data.issues ?? []} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
