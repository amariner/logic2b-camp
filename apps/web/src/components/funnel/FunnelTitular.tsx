/**
 * Paso 4–5 del funnel (ADR 0007): titular + confirmación.
 * Al entrar se crea el HOLD de 15 min (contador visible); confirmar consume el
 * hold en la misma transacción que crea la reserva. Idempotency-Key = hold o UUID.
 */
import { useEffect, useRef, useState } from 'react';
import { fill, funnelQs, occupancyOf, readFunnelQuery, type FunnelQuery } from './lib';

type Props = {
  locale: string;
  unitTypeId: string;
  typeName: string;
  labels: { titular: Record<string, string>; detalle: Record<string, string>; noches: string };
  reservarPath: string;
  detallePath: string;
  reservaPath: string;
};

type HoldState = { holdId: string; expiresAt: string } | 'expired' | 'none' | 'pending';

export default function FunnelTitular({
  locale,
  unitTypeId,
  typeName,
  labels,
  reservarPath,
  detallePath,
  reservaPath,
}: Props) {
  const [query, setQuery] = useState<FunnelQuery | null>(null);
  const [hold, setHold] = useState<HoldState>('pending');
  const [remaining, setRemaining] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'soldout' | 'error'>('idle');
  const idemKey = useRef<string>(crypto.randomUUID());
  const confirmed = useRef(false);

  // hold al entrar: la unidad queda guardada mientras se rellena el formulario
  useEffect(() => {
    const q = readFunnelQuery();
    if (!q) {
      window.location.href = reservarPath;
      return;
    }
    setQuery(q);
    let holdId: string | null = null;
    void (async () => {
      try {
        const res = await fetch('/api/holds', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            unitTypeId,
            dateFrom: q.from,
            dateTo: q.to,
            occupancy: occupancyOf(q),
          }),
        });
        if (res.status === 409) {
          setState('soldout');
          setHold('none');
          return;
        }
        if (!res.ok) {
          setHold('none'); // sin hold también se puede confirmar: se revalida en servidor
          return;
        }
        const body = (await res.json()) as { holdId: string; expiresAt: string };
        holdId = body.holdId;
        idemKey.current = body.holdId;
        setHold(body);
      } catch {
        setHold('none');
      }
    })();

    // abandonar el funnel libera la unidad al momento (no esperar al cron)
    const release = () => {
      if (holdId && !confirmed.current) {
        void fetch(`/api/holds/${holdId}`, { method: 'DELETE', keepalive: true });
      }
    };
    window.addEventListener('pagehide', release);
    return () => window.removeEventListener('pagehide', release);
  }, [unitTypeId, reservarPath]);

  // contador mm:ss del hold
  useEffect(() => {
    if (typeof hold !== 'object') return;
    const tick = () => {
      const ms = Date.parse(hold.expiresAt) - Date.now();
      if (ms <= 0) {
        setHold('expired');
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${m}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hold]);

  if (!query) return null;

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setState('sending');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': idemKey.current },
        body: JSON.stringify({
          unitTypeId,
          dateFrom: query.from,
          dateTo: query.to,
          occupancy: occupancyOf(query),
          extraIds: query.extras,
          withElectricity: query.elec,
          needsElectricity: query.elec,
          holder: {
            name: data.get('name'),
            email: data.get('email'),
            phone: data.get('phone') || undefined,
          },
          notes: data.get('notes') || undefined,
          gdprConsent: data.get('gdprConsent') === 'on',
          locale,
          ...(typeof hold === 'object' ? { holdId: hold.holdId } : {}),
        }),
      });
      if (res.status === 409) {
        const body = (await res.json()) as { error: string };
        if (body.error === 'hold_expired' || body.error === 'hold_mismatch') {
          // el hold murió: se avisa y se puede reintentar SIN hold (revalida el servidor)
          setHold('expired');
          setState('idle');
        } else {
          confirmed.current = true; // no liberar nada: ya no hay hueco
          setState('soldout');
        }
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as {
        code: string;
        payment?:
          | { method: 'redirect'; redirectUrl: string }
          | { method: 'form'; action: string; fields: Record<string, string> }
          | { method: 'immediate' };
      };
      confirmed.current = true;
      const email = String(data.get('email'));

      // pago requerido (ADR 0011): la reserva queda 'pending' hasta que la
      // pasarela confirme por webhook — se redirige ANTES de llegar a /reserva
      if (body.payment?.method === 'redirect') {
        window.location.href = body.payment.redirectUrl;
        return;
      }
      if (body.payment?.method === 'form') {
        const autoForm = document.createElement('form');
        autoForm.method = 'POST';
        autoForm.action = body.payment.action;
        for (const [name, value] of Object.entries(body.payment.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          autoForm.appendChild(input);
        }
        document.body.appendChild(autoForm);
        autoForm.submit();
        return;
      }
      window.location.href = `${reservaPath}?code=${encodeURIComponent(body.code)}&email=${encodeURIComponent(email)}&nueva=1`;
    } catch {
      setState('error');
    }
  };

  const fecha = (d: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
      new Date(`${d}T12:00:00Z`),
    );

  if (state === 'soldout') {
    return (
      <div className="flex max-w-xl flex-col gap-5">
        <p className="text-[16px] font-medium">{labels.titular.agotado}</p>
        <a
          href={`${reservarPath}?${funnelQs(query)}`}
          className="self-start rounded-(--lc-radius) bg-pino px-7 py-3 text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro"
        >
          ← {labels.detalle.volver}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.titular.nombre}
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            className="rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.titular.email}
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.titular.telefono}
          </span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className="rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.titular.notas}
          </span>
          <textarea
            name="notes"
            rows={3}
            className="rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        {/* ADR 0026 §2.3: el `name` NO es cosmético — sin él la casilla no se
            serializaba y el consentimiento no llegaba nunca al servidor, pese a
            que la ficha técnica publicada prometía guardarlo con su fecha. */}
        <label className="flex cursor-pointer items-start gap-3 text-[14px]">
          <input
            name="gdprConsent"
            type="checkbox"
            required
            className="mt-1 size-4 accent-(--lc-pino)"
          />
          {labels.titular.condiciones}
        </label>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="mt-2 self-start rounded-(--lc-radius) bg-pino px-8 py-3.5 text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro disabled:opacity-60"
        >
          {state === 'sending' ? labels.titular.confirmando : labels.titular.confirmar}
        </button>
        {state === 'error' && (
          <p className="text-[14px] font-medium text-mar">{labels.titular.error}</p>
        )}
      </form>

      <aside className="flex flex-col gap-3 rounded-(--lc-radius-lg) border border-arena/60 bg-arena-suave/40 p-6 lg:sticky lg:top-24 lg:self-start">
        <p className="font-display text-[17px] font-semibold">{typeName}</p>
        <p className="tnum text-[14px]">
          {fecha(query.from)} → {fecha(query.to)}
        </p>
        {typeof hold === 'object' && remaining && (
          <p className="tnum text-[13px] font-medium text-pino" role="timer">
            {fill(labels.titular.hold ?? '', { min: remaining })}
          </p>
        )}
        {hold === 'expired' && (
          <p className="text-[13px] font-medium text-mar">{labels.titular.holdCaducado}</p>
        )}
        <p className="mt-1">
          <a
            href={`${detallePath}?${funnelQs(query)}`}
            className="text-[13px] font-medium text-tinta-suave underline underline-offset-4 transition-colors hover:text-tinta"
          >
            ← {labels.detalle.volver}
          </a>
        </p>
      </aside>
    </div>
  );
}
