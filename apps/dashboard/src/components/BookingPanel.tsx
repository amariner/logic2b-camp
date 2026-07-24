/**
 * Ficha de reserva (ADR 0008, sesión 17): panel lateral no modal sobre el planning.
 * Acciones tipadas contra PATCH /api/admin/bookings/:id — el servidor valida SIEMPRE
 * la transición; aquí solo se ofrecen las que aplican al estado actual.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Skeleton,
  SkeletonText,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DoorOpen, LogOut, Printer, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch, type BookingDetail, type TenantSettings } from '../api';
import { t } from '../i18n';
import { conceptLabel, eur, fecha, noches } from '../lib/format';
import BookingReceipt from './BookingReceipt';
import GuestsSection from './GuestsSection';
import { QueryError } from './QueryError';

type RecepcionAction = 'check_in' | 'check_out' | 'undo_checkin';

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
  const [notes, setNotes] = useState<string | null>(null); // null = aún sin editar
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card'>('cash');
  const [refundAmount, setRefundAmount] = useState('');

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiGet<BookingDetail>(`/api/admin/bookings/${bookingId}`),
  });

  // nombre del establecimiento para la cabecera del recibo — misma clave que
  // Ajustes, así comparte caché (una sola petición mientras dure la sesión)
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<TenantSettings>('/api/admin/settings'),
    staleTime: 5 * 60_000,
  });

  // al abrir: foco dentro; al cerrar: el llamante devuelve el foco a la barra
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [bookingId]);

  // cambiar de reserva con el panel abierto: estado limpio
  useEffect(() => {
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
      toast.success(t('ficha.accionHecha', { estado: t(`estado.${res.status}`) }));
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: () => toast.error(t('ficha.accionError')),
  });

  const saveNote = useMutation({
    mutationFn: (value: string) =>
      apiPatch<{ id: string; notes: string }>(`/api/admin/bookings/${bookingId}`, {
        action: 'note',
        notes: value,
      }),
    onSuccess: () => {
      toast.success(t('ficha.notaGuardada'));
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => toast.error(t('ficha.accionError')),
  });

  // cobro en efectivo/TPV físico ya recibido en recepción (ADR 0011) — sin pasarela
  const recordPayment = useMutation({
    mutationFn: (input: { amountCents: number; method: 'cash' | 'card' }) =>
      apiPatch<{ id: string; paidCents: number }>(`/api/admin/bookings/${bookingId}`, {
        action: 'record_payment',
        ...input,
      }),
    onSuccess: () => {
      toast.success(t('ficha.pagoRegistrado'));
      setPayAmount('');
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => toast.error(t('ficha.pagoError')),
  });

  // check-in / check-out (ADR 0022): hechos de recepción, no transiciones. "En
  // casa" se deriva; el servidor valida la precondición SIEMPRE.
  const recepcion = useMutation({
    mutationFn: (action: RecepcionAction) =>
      apiPatch<{ id: string; status?: BookingDetail['status'] }>(
        `/api/admin/bookings/${bookingId}`,
        { action },
      ),
    onSuccess: (_res, action) => {
      toast.success(
        t(
          action === 'check_in'
            ? 'ficha.checkinHecho'
            : action === 'check_out'
              ? 'ficha.checkoutHecho'
              : 'ficha.checkinDeshecho',
        ),
      );
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
      void qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error(t('ficha.checkinError')),
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
      toast.success(t('ficha.reembolsoHecho'));
      setRefundAmount('');
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
    onError: () => toast.error(t('ficha.reembolsoError')),
  });

  const unitCode = data?.unitCode ?? null;
  const n = data ? noches(data.dateFrom, data.dateTo) : 0;
  const pax = data ? data.occupancy.adults + data.occupancy.childrenAges.length : 0;
  const pendingCents = data ? data.totalCents - data.paidCents : 0;
  // "en casa" (ADR 0022): huésped presente. NO es un status — se deriva.
  const inHouse = Boolean(
    data && data.status === 'confirmed' && data.checkedInAt && !data.checkedOutAt,
  );
  const canCheckIn = Boolean(data && data.status === 'confirmed' && !data.checkedInAt);

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
            {inHouse ? (
              <span className="lc-chip st-inhouse">{t('ficha.enCasa')}</span>
            ) : (
              <span className={`lc-chip st-${data.status}`}>{t(`estado.${data.status}`)}</span>
            )}
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={onClose}
          aria-label={t('ficha.cerrar')}
          className="ml-auto"
        >
          ✕
        </Button>
      </div>

      {/* esqueleto con la forma real de la ficha: cabecera, secciones de dato y pagos */}
      {isPending && (
        <div aria-busy="true" aria-label={t('ficha.cargando')} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <SkeletonText lines={4} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <SkeletonText lines={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      )}
      {isError && <QueryError error={error} onRetry={() => void refetch()} className="p-4" />}

      {data && (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
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

          {/* recepción: check-in / check-out (ADR 0022). "En casa" se deriva. */}
          {(canCheckIn || inHouse) && (
            <section>
              <h3 className="lc-panel-h">{t('ficha.recepcion')}</h3>
              {canCheckIn && (
                <Button
                  type="button"
                  size="sm"
                  disabled={recepcion.isPending}
                  onClick={() => recepcion.mutate('check_in')}
                >
                  <DoorOpen className="size-4" />
                  {t('ficha.hacerCheckin')}
                </Button>
              )}
              {inHouse && data.checkedInAt && (
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground">
                    <span className="lc-chip st-inhouse mr-1.5">{t('ficha.enCasa')}</span>
                    {t('ficha.entradaEl', { fecha: fecha(data.checkedInAt) })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* check-out cierra la cuenta (completa). Confirma, y avisa si
                        queda pendiente por cobrar. */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" size="sm" disabled={recepcion.isPending}>
                          <LogOut className="size-4" />
                          {t('accion.check_out')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('confirmar.checkout.titulo')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {pendingCents > 0
                              ? t('confirmar.checkout.descPendiente', {
                                  importe: eur(pendingCents, data.priceBreakdown.currency),
                                })
                              : t('confirmar.checkout.desc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => recepcion.mutate('check_out')}>
                            {t('confirmar.checkout.ok')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={recepcion.isPending}
                      onClick={() => recepcion.mutate('undo_checkin')}
                    >
                      <Undo2 className="size-4" />
                      {t('accion.undo_checkin')}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* huéspedes editables (ADR 0022): parte de viajeros */}
          {data.guests.length >= 0 && <GuestsSection bookingId={data.id} guests={data.guests} />}

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
            {/* recibo para el huésped al cerrar la cuenta (C4.3): imprime la hoja
                limpia del portal; disponible siempre que hay cuenta a la vista */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              {t('recibo.imprimir')}
            </Button>
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
                {/* cobrar todo lo pendiente en un gesto (ADR 0022): hasta ahora
                    había que leer la cifra arriba y teclearla a mano. */}
                {pendingCents > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={recordPayment.isPending}
                    onClick={() =>
                      recordPayment.mutate({ amountCents: pendingCents, method: payMethod })
                    }
                  >
                    {t('ficha.cobrarTodo', {
                      importe: eur(pendingCents, data.priceBreakdown.currency),
                    })}
                  </Button>
                )}
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
                  <Button
                    type="button"
                    size="sm"
                    // no se puede cobrar más de lo pendiente (validado también en servidor)
                    disabled={
                      toCents(payAmount) <= 0 ||
                      toCents(payAmount) > pendingCents ||
                      recordPayment.isPending
                    }
                    onClick={() =>
                      recordPayment.mutate({ amountCents: toCents(payAmount), method: payMethod })
                    }
                  >
                    {t('ficha.registrarPago')}
                  </Button>
                </div>
                {toCents(payAmount) > pendingCents && payAmount.trim() !== '' && (
                  <p className="text-[12px] font-medium text-destructive">
                    {t('ficha.pagoExcede')}
                  </p>
                )}
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
                    {/* dinero que sale: confirma siempre, con el importe delante */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructiveOutline"
                          disabled={
                            toCents(refundAmount) <= 0 ||
                            toCents(refundAmount) > data.paidCents ||
                            refund.isPending
                          }
                        >
                          {t('ficha.reembolsar')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('confirmar.reembolso.titulo', {
                              importe: eur(toCents(refundAmount), data.priceBreakdown.currency),
                            })}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('confirmar.reembolso.desc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => refund.mutate(toCents(refundAmount))}
                          >
                            {t('confirmar.reembolso.ok')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-1"
              disabled={notes === null || notes === (data.notes ?? '') || saveNote.isPending}
              onClick={() => notes !== null && saveNote.mutate(notes)}
            >
              {t('ficha.guardarNota')}
            </Button>
          </section>

          {/* acciones tipadas según estado */}
          {ACTIONS_BY_STATUS[data.status].length > 0 && (
            <section>
              <h3 className="lc-panel-h">{t('ficha.acciones')}</h3>
              <div className="flex flex-wrap gap-2">
                {ACTIONS_BY_STATUS[data.status].map((a) =>
                  a === 'cancel' ? (
                    // libera inventario y puede disparar reembolso: confirmación real,
                    // no el doble click que había aquí antes
                    <AlertDialog key={a}>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructiveOutline"
                          disabled={transition.isPending}
                        >
                          {t('accion.cancel')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('confirmar.cancelarReserva.titulo', { code: data.code })}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('confirmar.cancelarReserva.desc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => transition.mutate('cancel')}
                          >
                            {t('confirmar.cancelarReserva.ok')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      key={a}
                      type="button"
                      size="sm"
                      variant={a === 'confirm' ? 'primary' : 'outline'}
                      disabled={transition.isPending}
                      onClick={() => transition.mutate(a)}
                    >
                      {t(`accion.${a}`)}
                    </Button>
                  ),
                )}
              </div>
            </section>
          )}

          {/* recibo imprimible (C4.3): portal a <body>, oculto en pantalla,
              único contenido al imprimir. Ver BookingReceipt.tsx + styles.css. */}
          <BookingReceipt data={data} establishment={settings?.name ?? null} />
        </div>
      )}
    </aside>
  );
}
