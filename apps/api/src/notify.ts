/**
 * Orquestación de notificaciones (ADR 0010): el ÚNICO sitio que toca
 * notifications_log. Lee la config del tenant, decide si se envía
 * (on/off por evento sin deploy), renderiza, envía y deja rastro SIEMPRE.
 * El envío va en waitUntil: un fallo de email jamás rompe una reserva.
 */
import { schema } from '@logic-camp/db';
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
import { loadTenantConfig } from './tenant-config';
import type { TenantContext } from './tenant';

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

async function dispatch(c: NotifyContext, input: DispatchInput): Promise<void> {
  const tenant = c.get('tenant') as TenantContext;
  const db = tenant.db;

  const row = (await db.select().from(schema.tenants))[0];
  const config: NotificationsConfig =
    ((row?.modules as Record<string, unknown> | undefined)?.notifications as NotificationsConfig) ??
    {};

  const kind = input.payload.kind;
  const enabled = config.enabled?.[kind] ?? true;
  const to = input.to ?? config.notifyTo ?? null;
  const apiKey = c.env.RESEND_API_KEY;
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
    if (!result.ok) console.error(`notify ${kind} → ${status}:`, result.error);
  }

  await db.insert(schema.notificationsLog).values({
    id: uid('ntf'),
    tenantId: tenant.slug,
    bookingId: input.bookingId ?? null,
    enquiryId: input.enquiryId ?? null,
    channel: 'email',
    template: kind,
    status,
    attempts,
    sentAt: status === 'sent' ? nowIso() : null,
  });
}

/**
 * Ejecuta tras responder (waitUntil). Fuera de Workers (tests) se espera
 * inline — así los tests pueden asertar el log de forma síncrona.
 */
export function notifyAfter(c: NotifyContext, inputs: DispatchInput[]): Promise<unknown> {
  const task = Promise.allSettled(inputs.map((i) => dispatch(c, i)));
  try {
    c.executionCtx.waitUntil(task);
    return Promise.resolve();
  } catch {
    return task;
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

async function unitTypeName(c: NotifyContext, unitTypeId: string, locale: string): Promise<string> {
  const db = (c.get('tenant') as TenantContext).db;
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
          unitTypeName: await unitTypeName(c, req.unitTypeId, req.locale),
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
          unitTypeName: await unitTypeName(c, booking.unitTypeId, booking.locale),
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
