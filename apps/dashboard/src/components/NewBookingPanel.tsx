/**
 * Alta manual de reserva (ADR 0008, sesión 19): teléfono o mostrador.
 * MISMO motor y MISMO precio-en-servidor que la web pública: la cotización
 * en vivo sale de POST /api/quote y la creación revalida y re-cotiza en el
 * servidor (POST /api/admin/bookings, auditado). La UI nunca calcula un precio.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, apiGet, apiPost, type Catalog, type QuoteResponse } from '../api';
import { t } from '../i18n';
import { conceptLabel, eur, stayError } from '../lib/format';

type StayIssue = { code: string; params?: Record<string, string | number> };

export default function NewBookingPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const qc = useQueryClient();
  const panelRef = useRef<HTMLElement>(null);
  // una clave de idempotencia por apertura del formulario: doble click = una reserva
  const idemKey = useRef(crypto.randomUUID());

  const [unitTypeId, setUnitTypeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adults, setAdults] = useState(2);
  const [childrenRaw, setChildrenRaw] = useState('');
  const [pets, setPets] = useState(0);
  const [vehicles, setVehicles] = useState(1);
  const [withElectricity, setWithElectricity] = useState(false);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<'phone' | 'walkin'>('phone');
  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [holderPhone, setHolderPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('select, input')?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const childrenAges = useMemo(
    () =>
      childrenRaw
        .split(/[,\s]+/)
        .map((s) => Number.parseInt(s, 10))
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 17),
    [childrenRaw],
  );
  const occupancy = { adults, childrenAges, pets, vehicles };
  const listo = unitTypeId && dateFrom && dateTo && dateFrom < dateTo && adults >= 1;

  // cotización en vivo: el desglose que se enseña es el que cobrará el servidor
  const quoteBody = {
    unitTypeId,
    dateFrom,
    dateTo,
    occupancy,
    extraIds,
    withElectricity,
    needsElectricity: withElectricity,
  };
  const cotizacion = useQuery({
    queryKey: ['quote', quoteBody],
    queryFn: () => apiPost<QuoteResponse>('/api/quote', quoteBody),
    enabled: Boolean(listo),
    retry: false,
    staleTime: 30_000,
  });

  const stayIssues: StayIssue[] =
    cotizacion.error instanceof ApiError &&
    cotizacion.error.status === 422 &&
    typeof cotizacion.error.body === 'object' &&
    cotizacion.error.body !== null
      ? ((cotizacion.error.body as { issues?: StayIssue[]; error?: string }).issues ?? [
          { code: `stay.${(cotizacion.error.body as { error: string }).error}` },
        ])
      : [];

  const crear = useMutation({
    mutationFn: () =>
      apiPost<{ id: string; code: string }>(
        '/api/admin/bookings',
        {
          unitTypeId,
          dateFrom,
          dateTo,
          occupancy,
          extraIds,
          withElectricity,
          needsElectricity: withElectricity,
          holder: { name: holderName, email: holderEmail, phone: holderPhone || undefined },
          locale: 'es',
          notes: notes || undefined,
          channel,
        },
        { 'Idempotency-Key': idemKey.current },
      ),
    onSuccess: (res) => {
      setMsg({ text: t('alta.creada', { code: res.code }) });
      void qc.invalidateQueries({ queryKey: ['bookings'] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
      onCreated(res.id);
    },
    onError: (e) => {
      const agotado = e instanceof ApiError && e.status === 409;
      setMsg({ text: agotado ? t('alta.agotado') : t('alta.errorCrear'), error: true });
    },
  });

  const puedeCrear =
    Boolean(listo) && holderName.trim().length > 0 && /\S+@\S+\.\S+/.test(holderEmail);

  const input =
    'w-full rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1.5 text-[13px]';
  const label = 'text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase';

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={t('alta.titulo')}
      className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-border/60 bg-background"
    >
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background px-4 py-2.5">
        <span className="text-[14px] font-semibold">{t('alta.titulo')}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('alta.cerrar')}
          className="ml-auto rounded-(--lc-radius) border border-foreground/20 px-2 py-0.5 text-[13px] font-semibold hover:bg-accent"
        >
          ✕
        </button>
      </div>

      <form
        className="flex flex-col gap-3 p-4 text-[13px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (puedeCrear && !crear.isPending) crear.mutate();
        }}
      >
        {msg && (
          <p
            role="status"
            className={`text-[12px] font-medium ${msg.error ? 'text-destructive' : 'text-primary'}`}
          >
            {msg.text}
          </p>
        )}

        <div>
          <label htmlFor="alta-tipo" className={label}>
            {t('alta.tipo')}
          </label>
          <select
            id="alta-tipo"
            value={unitTypeId}
            onChange={(e) => setUnitTypeId(e.target.value)}
            className={input}
          >
            <option value="" />
            {catalog?.unitTypes.map((ut) => (
              <option key={ut.id} value={ut.id}>
                {ut.nameI18n.es ?? ut.id} · {ut.capacityMax} pax
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={label}>{t('alta.fechas')}</span>
          <div className="flex gap-2">
            <input
              type="date"
              aria-label={t('alta.fechas')}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${input} tnum`}
            />
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${input} tnum`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="alta-adultos" className={label}>
              {t('alta.adultos')}
            </label>
            <input
              id="alta-adultos"
              type="number"
              min={1}
              max={20}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
              className={`${input} tnum`}
            />
          </div>
          <div>
            <label htmlFor="alta-mascotas" className={label}>
              {t('alta.mascotas')}
            </label>
            <input
              id="alta-mascotas"
              type="number"
              min={0}
              max={10}
              value={pets}
              onChange={(e) => setPets(Math.max(0, Number(e.target.value) || 0))}
              className={`${input} tnum`}
            />
          </div>
          <div>
            <label htmlFor="alta-vehiculos" className={label}>
              {t('alta.vehiculos')}
            </label>
            <input
              id="alta-vehiculos"
              type="number"
              min={0}
              max={5}
              value={vehicles}
              onChange={(e) => setVehicles(Math.max(0, Number(e.target.value) || 0))}
              className={`${input} tnum`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="alta-ninos" className={label}>
            {t('alta.ninos')}
          </label>
          <input
            id="alta-ninos"
            type="text"
            inputMode="numeric"
            placeholder="4, 7"
            value={childrenRaw}
            onChange={(e) => setChildrenRaw(e.target.value)}
            className={`${input} tnum`}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={withElectricity}
            onChange={(e) => setWithElectricity(e.target.checked)}
          />
          {t('alta.electricidad')}
        </label>

        {(catalog?.extras.length ?? 0) > 0 && (
          <fieldset>
            <legend className={label}>{t('alta.extras')}</legend>
            <div className="mt-1 flex flex-col gap-1">
              {catalog!.extras.map((ex) => (
                <label key={ex.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ex.required || extraIds.includes(ex.id)}
                    disabled={ex.required}
                    onChange={(e) =>
                      setExtraIds((ids) =>
                        e.target.checked ? [...ids, ex.id] : ids.filter((i) => i !== ex.id),
                      )
                    }
                  />
                  <span>
                    {ex.nameI18n.es ?? ex.id}
                    <span className="tnum text-muted-foreground">
                      {' '}
                      · {eur(ex.priceCents)}
                      {ex.required && ` · ${t('alta.obligatorio')}`}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* cotización en vivo del servidor */}
        <section aria-live="polite" className="rounded-(--lc-radius) bg-accent/50 p-3">
          <h3 className="lc-panel-h">{t('alta.desglose')}</h3>
          {!listo && <p className="text-muted-foreground">{t('alta.rellenar')}</p>}
          {listo && cotizacion.isPending && (
            <p className="text-muted-foreground">{t('alta.cotizando')}</p>
          )}
          {stayIssues.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {stayIssues.map((issue) => (
                <li key={issue.code} className="font-medium text-destructive">
                  {stayError(issue.code, issue.params)}
                </li>
              ))}
            </ul>
          )}
          {cotizacion.data && (
            <dl>
              {cotizacion.data.breakdown.lines.map((line, i) => (
                <div key={i} className="flex justify-between gap-2 py-0.5">
                  <dt className={line.amountCents < 0 ? 'text-primary' : ''}>
                    {conceptLabel(line.concept)}
                  </dt>
                  <dd className={`tnum ${line.amountCents < 0 ? 'text-primary' : ''}`}>
                    {eur(line.amountCents, cotizacion.data.breakdown.currency)}
                  </dd>
                </div>
              ))}
              <div className="mt-1 flex justify-between gap-2 border-t border-border/60 pt-1 font-semibold">
                <dt>{t('alta.total')}</dt>
                <dd className="tnum">
                  {eur(cotizacion.data.breakdown.totalCents, cotizacion.data.breakdown.currency)}
                </dd>
              </div>
              {cotizacion.data.breakdown.touristTaxCents > 0 && (
                <div className="flex justify-between gap-2 py-0.5 text-muted-foreground">
                  <dt>{t('alta.tasa')}</dt>
                  <dd className="tnum">
                    {eur(
                      cotizacion.data.breakdown.touristTaxCents,
                      cotizacion.data.breakdown.currency,
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <div>
          <span className={label}>{t('alta.canal')}</span>
          <div className="flex overflow-hidden rounded-(--lc-radius) border border-foreground/20 text-[13px] font-medium">
            {(['phone', 'walkin'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                aria-pressed={channel === ch}
                className={`flex-1 px-3 py-1 ${channel === ch ? 'bg-primary text-background' : 'hover:bg-accent'}`}
              >
                {t(`canal.${ch}`)}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={label}>{t('alta.titular')}</legend>
          <input
            type="text"
            placeholder={t('alta.nombre')}
            aria-label={t('alta.nombre')}
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            className={input}
            required
          />
          <input
            type="email"
            placeholder={t('alta.email')}
            aria-label={t('alta.email')}
            value={holderEmail}
            onChange={(e) => setHolderEmail(e.target.value)}
            className={input}
            required
          />
          <input
            type="tel"
            placeholder={t('alta.telefono')}
            aria-label={t('alta.telefono')}
            value={holderPhone}
            onChange={(e) => setHolderPhone(e.target.value)}
            className={`${input} tnum`}
          />
        </fieldset>

        <div>
          <label htmlFor="alta-notas" className={label}>
            {t('alta.notas')}
          </label>
          <textarea
            id="alta-notas"
            rows={2}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={input}
          />
        </div>

        <button
          type="submit"
          disabled={!puedeCrear || crear.isPending || Boolean(cotizacion.error)}
          className="rounded-(--lc-radius) border border-primary bg-primary px-3 py-1.5 font-semibold text-background hover:bg-primary disabled:opacity-40"
        >
          {crear.isPending ? t('alta.creando') : t('alta.crear')}
        </button>
      </form>
    </aside>
  );
}
