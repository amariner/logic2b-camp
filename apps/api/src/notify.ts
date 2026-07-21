/**
 * Orquestación de notificaciones (ADR 0010): el ÚNICO sitio que toca
 * notifications_log. Lee la config del tenant, decide si se envía
 * (on/off por evento sin deploy), renderiza, envía y deja rastro SIEMPRE.
 * El envío va en waitUntil: un fallo de email jamás rompe una reserva.
 */
import { schema, type Db } from '@logic-camp/db';
import {
  conceptLabel,
  noopSender,
  render,
  resendSender,
  type BookingPayload,
  type NotificationPayload,
  type NotificationsConfig,
} from '@logic-camp/notifications';
import type { Context } from 'hono';
import { nowIso, uid } from './bookings';
import { logEvent, type SystemAlert } from './errors';
import { loadTenantConfig } from './tenant-config';
import type { Env, TenantContext } from './tenant';

/** Remitente de plataforma hasta que el tenant verifique su dominio en Resend. */
const PLATFORM_FROM = 'Logic Camp <noreply@logic2b.com>';

type NotifyContext = Context<{
  Bindings: { DB: D1Database; RESEND_API_KEY?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Variables: any;
}>;

type DispatchInput = {
  payload: NotificationPayload;
  /** destinatario; null = el buzón interno del camping (config.notifyTo) */
  to: string | null;
  locale: string;
  bookingId?: string;
  enquiryId?: string;
};

/**
 * Lo mínimo que `dispatch` necesita para operar — antes era un `Context` de
 * Hono entero, pero un cron (`scheduled()`) no tiene petición ni `Context`.
 * `notifyAfter` (disparado desde una ruta) arma esto desde `c`; `notifyNow`
 * (disparado desde un cron) lo arma directamente desde `env`.
 */
export type DispatchDeps = { db: Db; tenantSlug: string; apiKey?: string };

async function dispatch(deps: DispatchDeps, input: DispatchInput): Promise<void> {
  const { db, tenantSlug, apiKey } = deps;

  const row = (await db.select().from(schema.tenants))[0];
  const config: NotificationsConfig =
    ((row?.modules as Record<string, unknown> | undefined)?.notifications as NotificationsConfig) ??
    {};

  const kind = input.payload.kind;
  const enabled = config.enabled?.[kind] ?? true;
  const to = input.to ?? config.notifyTo ?? null;
  const sender = apiKey ? resendSender(apiKey) : noopSender;

  // el nombre real del camping entra aquí (la fila del tenant manda)
  const payload = {
    ...input.payload,
    data: { ...input.payload.data, campName: row?.name ?? input.payload.data.campName },
  } as NotificationPayload;

  let status: 'sent' | 'failed' | 'disabled' = 'disabled';
  let attempts = 0;
  if (enabled && to && apiKey) {
    attempts = 1;
    const message = render(payload, input.locale);
    const result = await sender({ from: config.from ?? PLATFORM_FROM, to, message });
    status = result.ok ? 'sent' : 'failed';
    // ADR 0026 §3: si el correo falla, esta línea es lo ÚNICO que queda. El
    // aviso al buzón no sirve aquí — es el propio canal el que está roto.
    if (!result.ok)
      logEvent({
        level: 'error',
        event: 'notification_send_failed',
        tenant: tenantSlug,
        kind,
        detail: result.error,
      });
  }

  await db.insert(schema.notificationsLog).values({
    id: uid('ntf'),
    tenantId: tenantSlug,
    bookingId: input.bookingId ?? null,
    enquiryId: input.enquiryId ?? null,
    channel: 'email',
    template: kind,
    status,
    attempts,
    sentAt: status === 'sent' ? nowIso() : null,
    createdAt: nowIso(),
  });
}

function depsFromContext(c: NotifyContext): DispatchDeps {
  const tenant = c.get('tenant') as TenantContext;
  return { db: tenant.db, tenantSlug: tenant.slug, apiKey: c.env.RESEND_API_KEY };
}

/**
 * Ejecuta tras responder (waitUntil). Fuera de Workers (tests) se espera
 * inline — así los tests pueden asertar el log de forma síncrona.
 */
export function notifyAfter(c: NotifyContext, inputs: DispatchInput[]): Promise<unknown> {
  const deps = depsFromContext(c);
  const task = Promise.allSettled(inputs.map((i) => dispatch(deps, i)));
  try {
    c.executionCtx.waitUntil(task);
    return Promise.resolve();
  } catch {
    return task;
  }
}

/**
 * Igual que `notifyAfter` pero para un cron (`scheduled()`, sin `Context` ni
 * `waitUntil`): el propio `scheduled()` ya controla su ciclo de vida, así
 * que aquí simplemente se espera (ADR 0014).
 */
export async function notifyNow(deps: DispatchDeps, inputs: DispatchInput[]): Promise<void> {
  await Promise.allSettled(inputs.map((i) => dispatch(deps, i)));
}

/**
 * Aviso al buzón de la casa de que algo ha reventado (ADR 0026 §3). Reutiliza
 * el mismo canal que `booking_pending_stuck`: `to: null` → `config.notifyTo`.
 *
 * NUNCA lanza y NUNCA se espera desde `onError`: un fallo al avisar no puede
 * tumbar la petición que ya está fallando. Todo lo que pueda ir mal aquí
 * (tenant sin montar, D1 caída, Resend caído) se traga y, como mucho, deja una
 * línea de log.
 */
export function notifySystemError(c: Context<Env>, alert: SystemAlert): void {
  try {
    const tenant = c.get('tenant') as TenantContext | undefined;
    if (!tenant?.db) return; // ha fallado antes del middleware de tenant: solo queda el log
    const deps: DispatchDeps = {
      db: tenant.db,
      tenantSlug: tenant.slug,
      apiKey: c.env.RESEND_API_KEY,
    };
    const task = sendSystemErrorAlert(deps, alert);
    try {
      c.executionCtx.waitUntil(task);
    } catch {
      // fuera de Workers (tests) no hay waitUntil: se deja correr sin esperar
      void task;
    }
  } catch {
    // deliberadamente mudo: avisar es lo último, jamás la causa de un fallo nuevo
  }
}

/**
 * El envío en sí, separado para poder esperarlo en los tests. Siempre resuelve.
 */
export async function sendSystemErrorAlert(deps: DispatchDeps, alert: SystemAlert): Promise<void> {
  try {
    let houseLocale = 'es';
    try {
      houseLocale = (await loadTenantConfig(deps.db)).locales[0] ?? 'es';
    } catch {
      // si ni la config se puede leer, se avisa igual en el idioma por defecto
    }
    await notifyNow(deps, [
      {
        payload: {
          kind: 'system_error',
          data: {
            campName: '',
            ref: alert.ref,
            event: alert.event,
            route: alert.route,
            occurredAt: alert.occurredAt,
            suppressed: alert.suppressed,
          },
        },
        to: null, // buzón de la casa (config.notifyTo)
        locale: houseLocale,
      },
    ]);
  } catch (e) {
    logEvent({
      level: 'warn',
      event: 'system_alert_failed',
      tenant: deps.tenantSlug,
      requestId: alert.ref,
      detail: e instanceof Error ? e.message : String(e),
    });
  }
}

/** ADR 0014: una reserva web `pending` sin pagar ni cancelar en este tiempo, se avisa (no se cancela). */
const STUCK_PENDING_MS = 2 * 60 * 60 * 1000;

/**
 * Cron (ADR 0014, mismo disparo que la purga de holds de la Fase 5): avisa
 * UNA vez por reserva colgada — comprueba en `notifications_log` antes de
 * repetir. No toca `status` ni inventario: cancelar sigue siendo manual.
 */
export async function notifyStuckPendingBookings(
  db: Db,
  tenantSlug: string,
  apiKey?: string,
): Promise<void> {
  const { and, eq, lt } = await import('drizzle-orm');
  const threshold = new Date(Date.now() - STUCK_PENDING_MS).toISOString();

  const stuck = await db
    .select({
      booking: schema.bookings,
      leadName: schema.guests.name,
      leadSurname: schema.guests.surname,
    })
    .from(schema.bookings)
    .leftJoin(
      schema.bookingGuests,
      and(
        eq(schema.bookingGuests.bookingId, schema.bookings.id),
        eq(schema.bookingGuests.isLead, true),
      ),
    )
    .leftJoin(schema.guests, eq(schema.guests.id, schema.bookingGuests.guestId))
    .where(
      and(
        eq(schema.bookings.status, 'pending'),
        eq(schema.bookings.channel, 'web'),
        lt(schema.bookings.createdAt, threshold),
      ),
    );
  if (!stuck.length) return;

  const houseLocale = (await loadTenantConfig(db)).locales[0] ?? 'es';
  const deps: DispatchDeps = { db, tenantSlug, apiKey };

  for (const row of stuck) {
    const already = await db
      .select()
      .from(schema.notificationsLog)
      .where(
        and(
          eq(schema.notificationsLog.bookingId, row.booking.id),
          eq(schema.notificationsLog.template, 'booking_pending_stuck'),
        ),
      );
    if (already.length) continue;

    const occupancy = row.booking.occupancy as { adults: number; childrenAges: number[] };
    const breakdown = row.booking.priceBreakdown as { currency: string };
    await notifyNow(deps, [
      {
        payload: {
          kind: 'booking_pending_stuck',
          data: {
            campName: '',
            code: row.booking.code,
            holderName: row.leadName ? `${row.leadName} ${row.leadSurname ?? ''}`.trim() : '—',
            dateFrom: row.booking.dateFrom,
            dateTo: row.booking.dateTo,
            nights: nightsOf(row.booking.dateFrom, row.booking.dateTo),
            persons: occupancy.adults + occupancy.childrenAges.length,
            unitTypeName: await unitTypeName(db, row.booking.unitTypeId, houseLocale),
            lines: [],
            totalCents: row.booking.totalCents,
            touristTaxCents: row.booking.touristTaxCents,
            currency: breakdown.currency,
          },
        },
        to: null,
        locale: houseLocale,
        bookingId: row.booking.id,
      },
    ]);
  }
}

const DAY_ISO_MS = 86_400_000;
const tomorrowIso = () => new Date(Date.now() + DAY_ISO_MS).toISOString().slice(0, 10);

/**
 * Cron (ADR 0015, mismo disparo que ADR 0007/0014): recordatorio al huésped
 * principal el día antes de su llegada. Se omite sin más si esa reserva no
 * tiene email del titular — NUNCA cae al buzón interno como sustituto.
 */
export async function notifyArrivalReminders(
  db: Db,
  tenantSlug: string,
  apiKey?: string,
): Promise<void> {
  const { and, eq } = await import('drizzle-orm');
  const arrivalsOn = tomorrowIso();

  const arriving = await db
    .select({
      booking: schema.bookings,
      leadEmail: schema.guests.email,
    })
    .from(schema.bookings)
    .leftJoin(
      schema.bookingGuests,
      and(
        eq(schema.bookingGuests.bookingId, schema.bookings.id),
        eq(schema.bookingGuests.isLead, true),
      ),
    )
    .leftJoin(schema.guests, eq(schema.guests.id, schema.bookingGuests.guestId))
    .where(and(eq(schema.bookings.status, 'confirmed'), eq(schema.bookings.dateFrom, arrivalsOn)));
  if (!arriving.length) return;

  const deps: DispatchDeps = { db, tenantSlug, apiKey };

  for (const row of arriving) {
    if (!row.leadEmail) continue; // sin email no hay a quién avisar — no se sustituye por notifyTo

    const already = await db
      .select()
      .from(schema.notificationsLog)
      .where(
        and(
          eq(schema.notificationsLog.bookingId, row.booking.id),
          eq(schema.notificationsLog.template, 'booking_reminder'),
        ),
      );
    if (already.length) continue;

    const occupancy = row.booking.occupancy as { adults: number; childrenAges: number[] };
    const breakdown = row.booking.priceBreakdown as { currency: string };
    await notifyNow(deps, [
      {
        payload: {
          kind: 'booking_reminder',
          data: {
            campName: '',
            code: row.booking.code,
            holderName: '',
            dateFrom: row.booking.dateFrom,
            dateTo: row.booking.dateTo,
            nights: nightsOf(row.booking.dateFrom, row.booking.dateTo),
            persons: occupancy.adults + occupancy.childrenAges.length,
            unitTypeName: await unitTypeName(db, row.booking.unitTypeId, row.booking.locale),
            lines: [],
            totalCents: row.booking.totalCents,
            touristTaxCents: row.booking.touristTaxCents,
            currency: breakdown.currency,
          },
        },
        to: row.leadEmail,
        locale: row.booking.locale,
        bookingId: row.booking.id,
      },
    ]);
  }
}

/** Desglose de la reserva → líneas del email en el idioma del titular. */
export function emailLines(
  lines: { concept: string; amountCents: number }[],
  locale: string,
): BookingPayload['lines'] {
  return lines.map((l) => ({ label: conceptLabel(locale, l.concept), amountCents: l.amountCents }));
}

const DAY_MS = 86_400_000;
export const nightsOf = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

async function unitTypeName(db: Db, unitTypeId: string, locale: string): Promise<string> {
  const { eq } = await import('drizzle-orm');
  const ut = (
    await db.select().from(schema.unitTypes).where(eq(schema.unitTypes.id, unitTypeId))
  )[0];
  const names = (ut?.nameI18n ?? {}) as Record<string, string>;
  return names[locale.slice(0, 2)] ?? names.es ?? unitTypeId;
}

type ConfirmedReq = {
  unitTypeId: string;
  dateFrom: string;
  dateTo: string;
  occupancy: { adults: number; childrenAges: number[] };
  holder: { name: string; email: string };
  locale: string;
};
type ConfirmedRes = {
  id: string;
  code: string;
  totalCents: number;
  touristTaxCents: number;
  breakdown: { lines: { concept: string; amountCents: number }[]; currency: string };
};

/** Confirmación al titular (web y alta manual comparten este hook). */
export async function notifyBookingConfirmed(
  c: NotifyContext,
  req: ConfirmedReq,
  res: ConfirmedRes,
): Promise<unknown> {
  const origin = new URL(c.req.url).origin;
  const db = (c.get('tenant') as TenantContext).db;
  return notifyAfter(c, [
    {
      payload: {
        kind: 'booking_confirmed',
        data: {
          campName: '',
          code: res.code,
          holderName: req.holder.name,
          dateFrom: req.dateFrom,
          dateTo: req.dateTo,
          nights: nightsOf(req.dateFrom, req.dateTo),
          persons: req.occupancy.adults + req.occupancy.childrenAges.length,
          unitTypeName: await unitTypeName(db, req.unitTypeId, req.locale),
          lines: emailLines(res.breakdown.lines, req.locale),
          totalCents: res.totalCents,
          touristTaxCents: res.touristTaxCents,
          currency: res.breakdown.currency,
          manageUrl: `${origin}/reserva?code=${res.code}&email=${encodeURIComponent(req.holder.email)}`,
        },
      },
      to: req.holder.email,
      locale: req.locale,
      bookingId: res.id,
    },
  ]);
}

type CancelledBooking = {
  id: string;
  code: string;
  unitTypeId: string;
  dateFrom: string;
  dateTo: string;
  occupancy: { adults: number; childrenAges: number[] };
  totalCents: number;
  touristTaxCents: number;
  priceBreakdown: { currency: string };
  locale: string;
};

/** Cancelación al titular (gestión web y acción del dashboard). */
export async function notifyBookingCancelled(
  c: NotifyContext,
  booking: CancelledBooking,
  to: string,
  refundCents?: number,
): Promise<unknown> {
  const db = (c.get('tenant') as TenantContext).db;
  return notifyAfter(c, [
    {
      payload: {
        kind: 'booking_cancelled',
        data: {
          campName: '',
          code: booking.code,
          holderName: '',
          dateFrom: booking.dateFrom,
          dateTo: booking.dateTo,
          nights: nightsOf(booking.dateFrom, booking.dateTo),
          persons: booking.occupancy.adults + booking.occupancy.childrenAges.length,
          unitTypeName: await unitTypeName(db, booking.unitTypeId, booking.locale),
          lines: [],
          totalCents: booking.totalCents,
          touristTaxCents: booking.touristTaxCents,
          currency: booking.priceBreakdown.currency,
          refundCents,
        },
      },
      to,
      locale: booking.locale,
      bookingId: booking.id,
    },
  ]);
}

type EnquiryReq = {
  contact: { name: string; email: string; phone?: string };
  dateFrom?: string | null;
  dateTo?: string | null;
  occupancy?: { adults: number; childrenAges: number[] } | null;
  message: string;
  locale: string;
};

/** Aviso al camping + acuse al solicitante (en SU idioma). */
export async function notifyEnquiry(
  c: NotifyContext,
  enquiryId: string,
  req: EnquiryReq,
): Promise<unknown> {
  const data = {
    campName: '',
    contactName: req.contact.name,
    contactEmail: req.contact.email,
    contactPhone: req.contact.phone,
    dateFrom: req.dateFrom ?? undefined,
    dateTo: req.dateTo ?? undefined,
    persons: req.occupancy ? req.occupancy.adults + req.occupancy.childrenAges.length : undefined,
    message: req.message,
  };
  // idioma de la casa (ADR 0012): el primero de los locales del tenant, no 'es' fijo
  const tenant = c.get('tenant') as TenantContext;
  const houseLocale = (await loadTenantConfig(tenant.db)).locales[0] ?? 'es';
  return notifyAfter(c, [
    { payload: { kind: 'enquiry_received', data }, to: null, locale: houseLocale, enquiryId },
    {
      payload: { kind: 'enquiry_autoreply', data },
      to: req.contact.email,
      locale: req.locale,
      enquiryId,
    },
  ]);
}
