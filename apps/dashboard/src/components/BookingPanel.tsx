/**
 * Ficha de reserva (ADR 0008, sesión 17): panel lateral no modal sobre el planning.
 * Acciones tipadas contra PATCH /api/admin/bookings/:id — el servidor valida SIEMPRE
 * la transición; aquí solo se ofrecen las que aplican al estado actual.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch, type BookingDetail } from '../api';
import { t } from '../i18n';
import { conceptLabel, eur, fecha, noches } from '../lib/format';

/** Espejo de TRANSITIONS del servidor: qué botones enseñar por estado. */
const ACTIONS_BY_STATUS: Record<BookingDetail['status'], BookingAction[]> = {
  pending: ['confirm', 'cancel'],
  confirmed: ['cancel', 'no_show', 'complete'],
  cancelled: [],
  no_show: [],
  completed: [],
};
type BookingAction = 'confirm' | 'cancel' | 'no_show' | 'complete';

/** € (coma o punto) → céntimos enteros — mismo criterio que Tarifas.tsx. */
const toCents = (euros: string) => Math.round(Number(euros.replace(',', '.')) * 100);

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
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card'>('cash');
  const [refundAmount, setRefundAmount] = useState('');

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
    setPayAmount('');
    setRefundAmount('');
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

  // cobro en efectivo/TPV físico ya recibido en recepción (ADR 0011) — sin pasarela
  const recordPayment = useMutation({
    mutationFn: (input: { amountCents: number; method: 'cash' | 'card' }) =>
      apiPatch<{ id: string; paidCents: number }>(`/api/admin/bookings/${bookingId}`, {
        action: 'record_payment',
        ...input,
      }),
    onSuccess: () => {
      setMsg({ text: t('ficha.pagoRegistrado') });
      setPayAmount('');
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => setMsg({ text: t('ficha.pagoError'), error: true }),
  });

  // reembolso (ADR 0011): si hay cobro de pasarela detrás, el servidor llama
  // primero a provider.refund — aquí solo se ofrece la acción, SIEMPRE valida el servidor
  const refund = useMutation({
    mutationFn: (amountCents: number) =>
      apiPatch<{ id: string; paidCents: number }>(`/api/admin/bookings/${bookingId}`, {
        action: 'refund',
        amountCents,
      }),
    onSuccess: () => {
      setMsg({ text: t('ficha.reembolsoHecho') });
      setRefundAmount('');
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => setMsg({ text: t('ficha.reembolsoError'), error: true }),
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
      className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-border/60 bg-background"
    >
      {/* cabecera: código + estado + cerrar */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background px-4 py-2.5">
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
          className="ml-auto rounded-(--lc-radius) border border-foreground/20 px-2 py-0.5 text-[13px] font-semibold hover:bg-accent"
        >
          ✕
        </button>
      </div>

      {isPending && <p className="p-4 text-[13px] text-muted-foreground">{t('ficha.cargando')}</p>}
      {isError && <p className="p-4 text-[13px] font-medium text-destructive">{t('ficha.error')}</p>}

      {data && (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
          {msg && (
            <p
              role="status"
              className={`text-[12px] font-medium ${msg.error ? 'text-destructive' : 'text-primary'}`}
            >
              {msg.text}
            </p>
          )}

          {/* estancia */}
          <section>
            <h3 className="lc-panel-h">{t('ficha.estancia')}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">{t('ficha.fechas')}</dt>
              <dd className="tnum">
                {fecha(data.dateFrom)} → {fecha(data.dateTo)} ·{' '}
                {n === 1 ? t('ficha.noche') : t('ficha.noches', { n })}
              </dd>
              <dt className="text-muted-foreground">{t('ficha.ocupacion')}</dt>
              <dd>
                {t('planning.pax', { n: pax })} · {data.occupancy.adults}A
                {data.occupancy.childrenAges.length > 0 &&
                  ` + ${data.occupancy.childrenAges.length}N (${data.occupancy.childrenAges.join(', ')})`}
              </dd>
              <dt className="text-muted-foreground">{t('ficha.unidad')}</dt>
              <dd>{unitCode ?? t('ficha.sinAsignar')}</dd>
              <dt className="text-muted-foreground">{t('ficha.canal')}</dt>
              <dd>{t(`canal.${data.channel}`)}</dd>
              <dt className="text-muted-foreground">{t('ficha.creada')}</dt>
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
              {lead.email && <p className="text-muted-foreground">{lead.email}</p>}
              {lead.phone && <p className="tnum text-muted-foreground">{lead.phone}</p>}
              {lead.docNumber && (
                <p className="tnum text-muted-foreground">
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
                  <dt className={line.amountCents < 0 ? 'text-primary' : ''}>
                    {conceptLabel(line.concept)}
                  </dt>
                  <dd className={`tnum ${line.amountCents < 0 ? 'text-primary' : ''}`}>
                    {eur(line.amountCents, data.priceBreakdown.currency)}
                  </dd>
                </div>
              ))}
              <div className="mt-1 flex justify-between gap-2 border-t border-border/60 pt-1 font-semibold">
                <dt>{t('ficha.total')}</dt>
                <dd className="tnum">{eur(data.totalCents, data.priceBreakdown.currency)}</dd>
              </div>
              {data.touristTaxCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 text-muted-foreground">
                  <dt>{t('ficha.tasa')}</dt>
                  <dd className="tnum">
                    {eur(data.touristTaxCents, data.priceBreakdown.currency)}
                  </dd>
                </div>
              )}
              {data.depositCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 text-muted-foreground">
                  <dt>{t('ficha.fianza')}</dt>
                  <dd className="tnum">{eur(data.depositCents, data.priceBreakdown.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2 py-0.5">
                <dt>{t('ficha.pagado')}</dt>
                <dd className="tnum">{eur(data.paidCents, data.priceBreakdown.currency)}</dd>
              </div>
              {pendingCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 font-medium text-destructive">
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
              <p className="text-muted-foreground">{t('ficha.sinPagos')}</p>
            )}
            <ul>
              {data.payments.map((p) => (
                <li key={p.id} className="flex justify-between gap-2 py-0.5">
                  <span>
                    {t(`pago.${p.provider}`)} · {t(`pago.${p.status}`)}
                    <span className="tnum text-muted-foreground"> · {fecha(p.createdAt)}</span>
                  </span>
                  <span className={`tnum ${p.amountCents < 0 ? 'text-destructive' : ''}`}>
                    {eur(p.amountCents, data.priceBreakdown.currency)}
                  </span>
                </li>
              ))}
            </ul>

            {(data.status === 'pending' || data.status === 'confirmed') && (
              <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={t('ficha.importe')}
                    aria-label={t('ficha.registrarPago')}
                    className="w-20 rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1"
                  />
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as 'cash' | 'card')}
                    aria-label={t('ficha.metodoPago')}
                    className="rounded-(--lc-radius) border border-foreground/20 bg-background px-1.5 py-1"
                  >
                    <option value="cash">{t('ficha.metodoEfectivo')}</option>
                    <option value="card">{t('ficha.metodoTarjeta')}</option>
                  </select>
                  <button
                    type="button"
                    disabled={toCents(payAmount) <= 0 || recordPayment.isPending}
                    onClick={() => recordPayment.mutate({ amountCents: toCents(payAmount), method: payMethod })}
                    className="rounded-(--lc-radius) border border-primary/60 px-2.5 py-1 font-medium text-primary hover:bg-accent disabled:opacity-40"
                  >
                    {t('ficha.registrarPago')}
                  </button>
                </div>
                {data.paidCents > 0 && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={t('ficha.importe')}
                      aria-label={t('ficha.reembolsar')}
                      className="w-20 rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1"
                    />
                    <button
                      type="button"
                      disabled={
                        toCents(refundAmount) <= 0 ||
                        toCents(refundAmount) > data.paidCents ||
                        refund.isPending
                      }
                      onClick={() => refund.mutate(toCents(refundAmount))}
                      className="rounded-(--lc-radius) border border-destructive/50 px-2.5 py-1 font-medium text-destructive hover:bg-accent disabled:opacity-40"
                    >
                      {t('ficha.reembolsar')}
                    </button>
                  </div>
                )}
              </div>
            )}
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
              className="w-full rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1.5"
            />
            <button
              type="button"
              disabled={notes === null || notes === (data.notes ?? '') || saveNote.isPending}
              onClick={() => notes !== null && saveNote.mutate(notes)}
              className="mt-1 rounded-(--lc-radius) border border-foreground/20 px-3 py-1 font-medium hover:bg-accent disabled:opacity-40"
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
                          ? 'border-destructive bg-destructive text-background'
                          : 'border-destructive/50 text-destructive hover:bg-accent'
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
                          ? 'border-primary bg-primary text-background hover:bg-primary'
                          : 'border-foreground/20 hover:bg-accent'
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
