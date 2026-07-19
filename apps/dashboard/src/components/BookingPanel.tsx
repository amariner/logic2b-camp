/**
 * Ficha de reserva (ADR 0008, sesión 17): panel lateral no modal sobre el planning.
 * Acciones tipadas contra PATCH /api/admin/bookings/:id — el servidor valida SIEMPRE
 * la transición; aquí solo se ofrecen las que aplican al estado actual.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch, type BookingDetail } from '../api';
import { t, tDyn } from '../i18n';

/** Espejo de TRANSITIONS del servidor: qué botones enseñar por estado. */
const ACTIONS_BY_STATUS: Record<BookingDetail['status'], BookingAction[]> = {
  pending: ['confirm', 'cancel'],
  confirmed: ['cancel', 'no_show', 'complete'],
  cancelled: [],
  no_show: [],
  completed: [],
};
type BookingAction = 'confirm' | 'cancel' | 'no_show' | 'complete';

const eur = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('es', { style: 'currency', currency }).format(cents / 100);
const fecha = (isoDate: string) =>
  new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${isoDate.slice(0, 10)}T12:00:00Z`),
  );
const noches = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

const conceptLabel = (concept: string) =>
  concept.startsWith('extra.')
    ? `${t('concepto.extra')}: ${tDyn(`concepto.${concept}`, concept.slice('extra.'.length))}`
    : tDyn(`concepto.${concept}`, concept);

export default function BookingPanel({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const panelRef = useRef<HTMLElement>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [notes, setNotes] = useState<string | null>(null); // null = aún sin editar

  const { data, isPending, isError } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiGet<BookingDetail>(`/api/admin/bookings/${bookingId}`),
  });

  // al abrir: foco dentro; al cerrar: el llamante devuelve el foco a la barra
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [bookingId]);

  // cambiar de reserva con el panel abierto: estado limpio
  useEffect(() => {
    setMsg(null);
    setConfirmingCancel(false);
    setNotes(null);
  }, [bookingId]);

  // Esc cierra aunque el foco haya salido del panel (p.ej. tras deshabilitarse un botón)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const transition = useMutation({
    mutationFn: (action: BookingAction) =>
      apiPatch<{ id: string; status: BookingDetail['status'] }>(
        `/api/admin/bookings/${bookingId}`,
        { action },
      ),
    onSuccess: (res) => {
      setMsg({ text: t('ficha.accionHecha', { estado: t(`estado.${res.status}`) }) });
      setConfirmingCancel(false);
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: () => setMsg({ text: t('ficha.accionError'), error: true }),
  });

  const saveNote = useMutation({
    mutationFn: (value: string) =>
      apiPatch<{ id: string; notes: string }>(`/api/admin/bookings/${bookingId}`, {
        action: 'note',
        notes: value,
      }),
    onSuccess: () => {
      setMsg({ text: t('ficha.notaGuardada') });
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => setMsg({ text: t('ficha.accionError'), error: true }),
  });

  const lead = data?.guests.find((g) => g.isLead) ?? data?.guests[0];
  const companions = data?.guests.filter((g) => g !== lead) ?? [];
  const unitCode = data?.unitCode ?? null;
  const n = data ? noches(data.dateFrom, data.dateTo) : 0;
  const pax = data ? data.occupancy.adults + data.occupancy.childrenAges.length : 0;
  const pendingCents = data ? data.totalCents - data.paidCents : 0;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={data?.code ?? t('ficha.cargando')}
      className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-arena/60 bg-hueso"
    >
      {/* cabecera: código + estado + cerrar */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-arena/60 bg-hueso px-4 py-2.5">
        {data && (
          <>
            <span className="tnum text-[14px] font-semibold">{data.code}</span>
            <span className={`lc-chip st-${data.status}`}>{t(`estado.${data.status}`)}</span>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('ficha.cerrar')}
          className="ml-auto rounded-(--lc-radius) border border-tinta/20 px-2 py-0.5 text-[13px] font-semibold hover:bg-arena-suave"
        >
          ✕
        </button>
      </div>

      {isPending && <p className="p-4 text-[13px] text-tinta-suave">{t('ficha.cargando')}</p>}
      {isError && <p className="p-4 text-[13px] font-medium text-mar">{t('ficha.error')}</p>}

      {data && (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
          {msg && (
            <p
              role="status"
              className={`text-[12px] font-medium ${msg.error ? 'text-mar' : 'text-pino'}`}
            >
              {msg.text}
            </p>
          )}

          {/* estancia */}
          <section>
            <h3 className="lc-panel-h">{t('ficha.estancia')}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-tinta-suave">{t('ficha.fechas')}</dt>
              <dd className="tnum">
                {fecha(data.dateFrom)} → {fecha(data.dateTo)} ·{' '}
                {n === 1 ? t('ficha.noche') : t('ficha.noches', { n })}
              </dd>
              <dt className="text-tinta-suave">{t('ficha.ocupacion')}</dt>
              <dd>
                {t('planning.pax', { n: pax })} · {data.occupancy.adults}A
                {data.occupancy.childrenAges.length > 0 &&
                  ` + ${data.occupancy.childrenAges.length}N (${data.occupancy.childrenAges.join(', ')})`}
              </dd>
              <dt className="text-tinta-suave">{t('ficha.unidad')}</dt>
              <dd>{unitCode ?? t('ficha.sinAsignar')}</dd>
              <dt className="text-tinta-suave">{t('ficha.canal')}</dt>
              <dd>{t(`canal.${data.channel}`)}</dd>
              <dt className="text-tinta-suave">{t('ficha.creada')}</dt>
              <dd className="tnum">{fecha(data.createdAt)}</dd>
            </dl>
          </section>

          {/* titular y acompañantes */}
          {lead && (
            <section>
              <h3 className="lc-panel-h">{t('ficha.titular')}</h3>
              <p className="font-medium">
                {lead.name} {lead.surname}
              </p>
              {lead.email && <p className="text-tinta-suave">{lead.email}</p>}
              {lead.phone && <p className="tnum text-tinta-suave">{lead.phone}</p>}
              {lead.docNumber && (
                <p className="tnum text-tinta-suave">
                  {lead.docType?.toUpperCase()} {lead.docNumber}
                </p>
              )}
              {companions.length > 0 && (
                <>
                  <h3 className="lc-panel-h mt-2">{t('ficha.acompanantes')}</h3>
                  <ul>
                    {companions.map((g) => (
                      <li key={g.id}>
                        {g.name} {g.surname}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {/* desglose auditable: las líneas mandan, el total es su suma */}
          <section>
            <h3 className="lc-panel-h">{t('ficha.desglose')}</h3>
            <dl>
              {data.priceBreakdown.lines.map((line, i) => (
                <div key={i} className="flex justify-between gap-2 py-0.5">
                  <dt className={line.amountCents < 0 ? 'text-pino' : ''}>
                    {conceptLabel(line.concept)}
                  </dt>
                  <dd className={`tnum ${line.amountCents < 0 ? 'text-pino' : ''}`}>
                    {eur(line.amountCents, data.priceBreakdown.currency)}
                  </dd>
                </div>
              ))}
              <div className="mt-1 flex justify-between gap-2 border-t border-arena/60 pt-1 font-semibold">
                <dt>{t('ficha.total')}</dt>
                <dd className="tnum">{eur(data.totalCents, data.priceBreakdown.currency)}</dd>
              </div>
              {data.touristTaxCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 text-tinta-suave">
                  <dt>{t('ficha.tasa')}</dt>
                  <dd className="tnum">
                    {eur(data.touristTaxCents, data.priceBreakdown.currency)}
                  </dd>
                </div>
              )}
              {data.depositCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 text-tinta-suave">
                  <dt>{t('ficha.fianza')}</dt>
                  <dd className="tnum">{eur(data.depositCents, data.priceBreakdown.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2 py-0.5">
                <dt>{t('ficha.pagado')}</dt>
                <dd className="tnum">{eur(data.paidCents, data.priceBreakdown.currency)}</dd>
              </div>
              {pendingCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 font-medium text-mar">
                  <dt>{t('ficha.pendientePago')}</dt>
                  <dd className="tnum">{eur(pendingCents, data.priceBreakdown.currency)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* pagos: con signo, sum == pagado (invariante 2) */}
          <section>
            <h3 className="lc-panel-h">{t('ficha.pagos')}</h3>
            {data.payments.length === 0 && (
              <p className="text-tinta-suave">{t('ficha.sinPagos')}</p>
            )}
            <ul>
              {data.payments.map((p) => (
                <li key={p.id} className="flex justify-between gap-2 py-0.5">
                  <span>
                    {t(`pago.${p.provider}`)} · {t(`pago.${p.status}`)}
                    <span className="tnum text-tinta-suave"> · {fecha(p.createdAt)}</span>
                  </span>
                  <span className={`tnum ${p.amountCents < 0 ? 'text-mar' : ''}`}>
                    {eur(p.amountCents, data.priceBreakdown.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* notas internas */}
          <section>
            <h3 className="lc-panel-h">
              <label htmlFor="lc-booking-notes">{t('ficha.notas')}</label>
            </h3>
            <textarea
              id="lc-booking-notes"
              rows={3}
              maxLength={2000}
              value={notes ?? data.notes ?? ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('ficha.notasPlaceholder')}
              className="w-full rounded-(--lc-radius) border border-tinta/20 bg-hueso px-2 py-1.5"
            />
            <button
              type="button"
              disabled={notes === null || notes === (data.notes ?? '') || saveNote.isPending}
              onClick={() => notes !== null && saveNote.mutate(notes)}
              className="mt-1 rounded-(--lc-radius) border border-tinta/20 px-3 py-1 font-medium hover:bg-arena-suave disabled:opacity-40"
            >
              {t('ficha.guardarNota')}
            </button>
          </section>

          {/* acciones tipadas según estado */}
          {ACTIONS_BY_STATUS[data.status].length > 0 && (
            <section>
              <h3 className="lc-panel-h">{t('ficha.acciones')}</h3>
              <div className="flex flex-wrap gap-2">
                {ACTIONS_BY_STATUS[data.status].map((a) =>
                  a === 'cancel' ? (
                    <button
                      key={a}
                      type="button"
                      disabled={transition.isPending}
                      onClick={() => {
                        if (confirmingCancel) transition.mutate('cancel');
                        else setConfirmingCancel(true);
                      }}
                      className={`rounded-(--lc-radius) border px-3 py-1 font-medium disabled:opacity-40 ${
                        confirmingCancel
                          ? 'border-mar bg-mar text-hueso'
                          : 'border-mar/50 text-mar hover:bg-arena-suave'
                      }`}
                    >
                      {confirmingCancel ? t('accion.cancelSeguro') : t('accion.cancel')}
                    </button>
                  ) : (
                    <button
                      key={a}
                      type="button"
                      disabled={transition.isPending}
                      onClick={() => transition.mutate(a)}
                      className={`rounded-(--lc-radius) border px-3 py-1 font-medium disabled:opacity-40 ${
                        a === 'confirm'
                          ? 'border-pino bg-pino text-hueso hover:bg-pino-oscuro'
                          : 'border-tinta/20 hover:bg-arena-suave'
                      }`}
                    >
                      {t(`accion.${a}`)}
                    </button>
                  ),
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </aside>
  );
}
