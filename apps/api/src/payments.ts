/**
 * Orquestación de pagos (ADR 0011): el ÚNICO sitio que toca `payments` y
 * decide `paidCents`/transición pending→confirmed. Lee la config del
 * tenant (igual que `notify.ts` con `modules.notifications`), resuelve el
 * adaptador con los secrets del Worker y deduplica webhooks reutilizando
 * `meta` (mismo patrón que el Idempotency-Key de `POST /api/bookings`).
 */
import {
  noneProvider,
  redsysProvider,
  stripeProvider,
  type PaymentIntentResult,
  type PaymentProvider,
  type PaymentWebhookEvent,
} from '@logic-camp/payments';
import { schema, type Db } from '@logic-camp/db';
import { eq } from 'drizzle-orm';
import { nowIso, uid } from './ids';
import { parsePaymentsConfig, tenantModules, type TenantPaymentsConfig } from './config-modules';
import type { Bindings } from './tenant';

/** Solo los secrets de pago — así un `{}` vale de "sin secrets" sin arrastrar DB. */
export type PaymentEnv = Pick<
  Bindings,
  'STRIPE_SECRET_KEY' | 'STRIPE_WEBHOOK_SECRET' | 'REDSYS_MERCHANT_KEY'
>;

export type { TenantPaymentsConfig } from './config-modules';

export async function loadPaymentsConfig(db: Db): Promise<TenantPaymentsConfig> {
  const row = (await db.select().from(schema.tenants))[0];
  if (!row) throw new Error('TenantConfig ausente: la D1 no contiene una fila tenants');
  return parsePaymentsConfig(tenantModules(row.modules).payments);
}

/** null = el provider elegido no tiene los secrets/datos que necesita (ADR 0011 §8). */
export function resolveProvider(
  config: TenantPaymentsConfig,
  env: PaymentEnv,
): PaymentProvider | null {
  if (config.provider === 'none') return noneProvider();
  if (config.provider === 'stripe') {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) return null;
    return stripeProvider({
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    });
  }
  if (config.provider === 'redsys') {
    if (!env.REDSYS_MERCHANT_KEY || !config.redsysMerchantCode || !config.redsysTerminal) {
      return null;
    }
    return redsysProvider({
      merchantCode: config.redsysMerchantCode,
      terminal: config.redsysTerminal,
      secretKeyBase64: env.REDSYS_MERCHANT_KEY,
      environment: config.environment ?? 'test',
    });
  }
  return null;
}

type StoredPaymentIntent = {
  bookingId: string;
  amountCents: number;
  payment: PaymentIntentResult;
};

function parseStoredIntent(value: string): StoredPaymentIntent | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredPaymentIntent>;
    if (
      typeof parsed.bookingId === 'string' &&
      Number.isInteger(parsed.amountCents) &&
      parsed.amountCents! > 0 &&
      parsed.payment &&
      typeof parsed.payment.providerRef === 'string'
    ) {
      return parsed as StoredPaymentIntent;
    }
  } catch {
    // Los intents anteriores a ADR 0042 guardaban solo el bookingId. Se pueden
    // localizar, pero no confirmar sin conocer el importe esperado.
  }
  return null;
}

/** Recuerda intent, importe esperado y reserva para reintentos y webhooks. */
export async function rememberIntent(
  db: Db,
  provider: string,
  payment: PaymentIntentResult,
  bookingId: string,
  amountCents: number,
): Promise<void> {
  const stored: StoredPaymentIntent = { bookingId, amountCents, payment };
  const value = JSON.stringify(stored);
  await db.batch([
    db
      .insert(schema.meta)
      .values({ key: `payment_order:${provider}:${payment.providerRef}`, value }),
    db.insert(schema.meta).values({ key: `payment_intent:${bookingId}`, value }),
  ]);
}

async function lookupStoredIntent(
  db: Db,
  provider: string,
  providerRef: string,
): Promise<{ bookingId: string; stored: StoredPaymentIntent | null } | null> {
  const row = (
    await db
      .select()
      .from(schema.meta)
      .where(eq(schema.meta.key, `payment_order:${provider}:${providerRef}`))
  )[0];
  if (!row) return null;
  const stored = parseStoredIntent(row.value);
  return { bookingId: stored?.bookingId ?? row.value, stored };
}

/** Recupera exactamente las instrucciones emitidas al crear una reserva pendiente. */
export async function loadStoredPaymentIntent(
  db: Db,
  bookingId: string,
): Promise<PaymentIntentResult | null> {
  const row = (
    await db
      .select()
      .from(schema.meta)
      .where(eq(schema.meta.key, `payment_intent:${bookingId}`))
  )[0];
  return row ? (parseStoredIntent(row.value)?.payment ?? null) : null;
}

/** Forma pública de un asiento: `raw` es legado interno y jamás sale de la API. */
export function paymentView(payment: typeof schema.payments.$inferSelect) {
  const { raw: _raw, ...safe } = payment;
  void _raw;
  return safe;
}

export type RefundOutcome = { ok: true; refundedCents: number } | { ok: false; error: string };

/**
 * Ejecuta un reembolso real (ADR 0011 §5): si hay un cobro de pasarela con
 * saldo suficiente, llama a `provider.refund` primero — si el proveedor lo
 * rechaza, NO se escribe nada. Si el dinero se cobró en mano (manual) o no
 * hay pasarela configurada, es un asiento contable sin llamada externa.
 * Nunca deja `paidCents` negativo (responsabilidad del llamador validarlo).
 */
export async function executeRefund(
  db: Db,
  env: PaymentEnv,
  bookingId: string,
  amountCents: number,
): Promise<RefundOutcome> {
  if (amountCents <= 0) return { ok: true, refundedCents: 0 };

  const booking = (
    await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId))
  )[0];
  if (!booking) return { ok: false, error: 'booking_not_found' };

  const paymentRows = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.bookingId, bookingId));
  const gatewayPayment = paymentRows
    .filter((p) => p.amountCents > 0 && (p.provider === 'stripe' || p.provider === 'redsys'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .find((p) => p.amountCents >= amountCents);

  const ts = nowIso();
  let refundProvider: 'stripe' | 'redsys' | 'manual' = 'manual';
  let providerRef: string | null = null;

  if (gatewayPayment) {
    const config = await loadPaymentsConfig(db);
    const provider = resolveProvider(config, env);
    if (!provider) return { ok: false, error: 'payment_not_configured' };
    const refundIdempotencyKey = `refund/${bookingId}/${booking.paidCents}/${amountCents}`;
    const result = await provider.refund(
      gatewayPayment.providerRef ?? '',
      amountCents,
      refundIdempotencyKey,
    );
    if (!result.ok) return { ok: false, error: result.error };
    refundProvider = gatewayPayment.provider as 'stripe' | 'redsys';
    providerRef = gatewayPayment.providerRef;
  }

  await db.batch([
    db.insert(schema.payments).values({
      id: uid('pay'),
      bookingId,
      provider: refundProvider,
      providerRef,
      amountCents: -amountCents,
      status: 'refunded',
      raw: null,
      createdAt: ts,
    }),
    db
      .update(schema.bookings)
      .set({ paidCents: booking.paidCents - amountCents, updatedAt: ts })
      .where(eq(schema.bookings.id, bookingId)),
  ]);
  return { ok: true, refundedCents: amountCents };
}

/** Cobro en efectivo/TPV físico ya recibido en recepción — sin llamada a pasarela. */
export async function recordManualPayment(
  db: Db,
  bookingId: string,
  amountCents: number,
): Promise<void> {
  const booking = (
    await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId))
  )[0];
  if (!booking) throw new Error('booking_not_found');
  const ts = nowIso();
  await db.batch([
    db.insert(schema.payments).values({
      id: uid('pay'),
      bookingId,
      provider: 'manual',
      providerRef: null,
      amountCents,
      status: 'succeeded',
      raw: null,
      createdAt: ts,
    }),
    db
      .update(schema.bookings)
      .set({ paidCents: booking.paidCents + amountCents, updatedAt: ts })
      .where(eq(schema.bookings.id, bookingId)),
  ]);
}

export type PaymentEventResult =
  | { kind: 'duplicate' }
  | { kind: 'unknown_booking' }
  | { kind: 'amount_mismatch'; bookingId: string }
  | { kind: 'unverifiable_amount'; bookingId: string }
  | { kind: 'payment_conflict'; bookingId: string }
  | { kind: 'failed'; bookingId: string }
  | { kind: 'recorded'; bookingId: string; justConfirmed: boolean };

/**
 * Procesa un evento de webhook YA verificado (firma comprobada por el
 * adaptador): deduplica, inserta el pago y confirma la reserva si estaba
 * `pending`. Invariante 2: nunca escribe en `payments` sin ajustar `paidCents`
 * en el MISMO batch.
 */
export async function recordPaymentEvent(
  db: Db,
  provider: 'stripe' | 'redsys',
  event: PaymentWebhookEvent,
): Promise<PaymentEventResult> {
  const metaKey = `webhook:${provider}:${event.eventId}`;
  const already = await db.select().from(schema.meta).where(eq(schema.meta.key, metaKey));
  if (already[0]) return { kind: 'duplicate' };

  const intent = await lookupStoredIntent(db, provider, event.providerRef);
  if (!intent) return { kind: 'unknown_booking' };
  const { bookingId } = intent;

  if (event.status === 'failed') {
    await db.insert(schema.meta).values({ key: metaKey, value: bookingId });
    return { kind: 'failed', bookingId };
  }

  if (!intent.stored) return { kind: 'unverifiable_amount', bookingId };
  if (event.amountCents !== intent.stored.amountCents) {
    return { kind: 'amount_mismatch', bookingId };
  }

  const paymentKey = `payment_success:${provider}:${event.providerRef}`;
  const processed = await db.select().from(schema.meta).where(eq(schema.meta.key, paymentKey));
  if (processed[0]) return { kind: 'duplicate' };

  const booking = (
    await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId))
  )[0];
  if (!booking) return { kind: 'unknown_booking' };
  if (booking.paidCents + event.amountCents > booking.totalCents) {
    return { kind: 'payment_conflict', bookingId };
  }

  const ts = nowIso();
  const wasPending = booking.status === 'pending';
  try {
    await db.batch([
      // La clave única forma parte del mismo batch: una carrera no puede insertar
      // dos cobros aunque los eventos tengan eventId diferentes.
      db.insert(schema.meta).values({ key: paymentKey, value: bookingId }),
      db.insert(schema.payments).values({
        id: uid('pay'),
        bookingId,
        provider,
        providerRef: event.providerRef,
        amountCents: event.amountCents,
        status: 'succeeded',
        raw: null,
        createdAt: ts,
      }),
      db
        .update(schema.bookings)
        .set({
          paidCents: booking.paidCents + event.amountCents,
          status: wasPending ? 'confirmed' : booking.status,
          updatedAt: ts,
        })
        .where(eq(schema.bookings.id, bookingId)),
      db.insert(schema.meta).values({ key: metaKey, value: bookingId }),
    ]);
  } catch (error) {
    const raced = await db.select().from(schema.meta).where(eq(schema.meta.key, paymentKey));
    if (raced[0]) return { kind: 'duplicate' };
    throw error;
  }
  return { kind: 'recorded', bookingId, justConfirmed: wasPending };
}

export type { PaymentIntentResult };
