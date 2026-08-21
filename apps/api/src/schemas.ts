import { z } from 'zod';
import { tenantModulesPatchSchema } from './config-modules';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Formato Y fecha de calendario real: `2026-02-31` no es un día ISO válido. */
export const isoDate = z
  .string()
  .regex(ISO_DATE_PATTERN, 'YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'fecha inexistente');

export const idempotencyKeySchema = z.string().trim().min(1).max(100).optional();

export const occupancySchema = z.object({
  adults: z.number().int().min(1).max(20),
  childrenAges: z.array(z.number().int().min(0).max(17)).max(20).default([]),
  pets: z.number().int().min(0).max(10).default(0),
  vehicles: z.number().int().min(0).max(5).default(1),
});

export const availabilityQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  adults: z.coerce.number().int().min(1).max(20).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  pets: z.coerce.number().int().min(0).max(10).default(0),
});

export const quoteRequestSchema = z.object({
  unitTypeId: z.string().min(1),
  dateFrom: isoDate,
  dateTo: isoDate,
  occupancy: occupancySchema,
  extraIds: z.array(z.string()).max(20).default([]),
  needsElectricity: z.boolean().default(false),
  withElectricity: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
});

export const enquiryRequestSchema = z
  .object({
    message: z.string().min(1).max(4000),
    contact: contactSchema,
    locale: z.string().min(2).max(5).default('es'),
    dateFrom: isoDate.optional(),
    dateTo: isoDate.optional(),
    occupancy: occupancySchema.optional(),
    unitTypeId: z.string().optional(),
    source: z.string().max(40).default('web'),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.dateFrom) !== Boolean(value.dateTo)) {
      ctx.addIssue({ code: 'custom', message: 'date_range_incomplete', path: ['dateFrom'] });
    } else if (value.dateFrom && value.dateTo && value.dateFrom >= value.dateTo) {
      ctx.addIssue({ code: 'custom', message: 'invalid_dates', path: ['dateTo'] });
    }
  });

/**
 * Todo lo que define una reserva MENOS el consentimiento, que se exige distinto
 * según quién la cree (ADR 0026 §2.3): la web pública no puede reservar sin él;
 * el mostrador lo recoge aparte y no puede quedarse bloqueado por una casilla que
 * el huésped está firmando en papel delante de la recepcionista.
 */
const bookingBaseSchema = z.object({
  unitTypeId: z.string().min(1),
  dateFrom: isoDate,
  dateTo: isoDate,
  occupancy: occupancySchema,
  extraIds: z.array(z.string()).max(20).default([]),
  withElectricity: z.boolean().default(false),
  needsElectricity: z.boolean().default(false),
  holder: contactSchema,
  locale: z.string().min(2).max(5).default('es'),
  notes: z.string().max(2000).optional(),
  /** hold del funnel a consumir en la misma transacción (ADR 0007) */
  holdId: z.string().max(40).optional(),
});

/**
 * Reserva desde la web pública. `literal(true)` y no `boolean`: una reserva web sin
 * consentimiento no debe poder crearse, y el esquema es el sitio donde eso se hace
 * imposible en vez de recordable. La VERSIÓN del texto la sella el servidor.
 */
export const bookingRequestSchema = bookingBaseSchema.extend({
  gdprConsent: z.literal(true),
});

// ---------- Funnel (ADR 0007) ----------

export const holdRequestSchema = z.object({
  unitTypeId: z.string().min(1),
  dateFrom: isoDate,
  dateTo: isoDate,
  occupancy: occupancySchema.optional(),
});

export const bookingCancelSchema = z.object({
  email: z.string().email().max(200),
});

export const bookingModifySchema = z.object({
  email: z.string().email().max(200),
  dateFrom: isoDate,
  dateTo: isoDate,
  extraIds: z.array(z.string()).max(20).default([]),
  withElectricity: z.boolean().default(false),
  needsElectricity: z.boolean().default(false),
});

// ---------- Privado (/api/admin — ADR 0005) ----------

export const planningQuerySchema = z.object({ from: isoDate, to: isoDate });

export const bookingsListQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'no_show', 'completed']).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  /** día exacto de llegada (date_from ==) — la pantalla de llegadas */
  arrivalsOn: isoDate.optional(),
  /** día exacto de salida (date_to ==, exclusivo: ese día la unidad se libera) */
  departuresOn: isoDate.optional(),
  /** búsqueda por código de reserva (prefijo) */
  q: z.string().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminBookingCreateSchema = bookingBaseSchema.extend({
  channel: z.enum(['phone', 'walkin']).default('phone'),
  /**
   * Solicitud presupuestada que origina el alta. El servidor la valida y la
   * enlaza dentro del mismo batch que crea la reserva; enviar el ID nunca basta
   * para forzar una conversión.
   */
  enquiryId: z.string().min(1).max(80).optional(),
  /**
   * En mostrador el consentimiento se recoge en el momento y se registra en la
   * ficha del huésped; no bloquea el alta. Por defecto `false` — sin marcar NO se
   * inventa una fecha de consentimiento, que es justo el bug que arregla el ADR 0026.
   */
  gdprConsent: z.boolean().default(false),
  /**
   * Unidad preferida al crear desde el planning (ADR 0023 §2): si está libre se
   * usa; si no, decide el asignador como siempre. Preferencia, nunca garantía.
   */
  preferredUnitId: z.string().min(1).optional(),
});

/** Forma de pago de la operación para el parte de viajeros (ADR 0028). */
export const paymentKindSchema = z.enum(['cash', 'card', 'transfer', 'platform']);

/** Acciones tipadas sobre una reserva: transición, reasignación, nota o pago (ADR 0011). */
export const bookingActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('confirm') }),
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.literal('no_show') }),
  z.object({ action: z.literal('complete') }),
  // Check-in / check-out (ADR 0022): hechos ortogonales, no transiciones de estado.
  z.object({ action: z.literal('check_in') }),
  z.object({ action: z.literal('check_out') }),
  z.object({ action: z.literal('undo_checkin') }),
  z.object({ action: z.literal('reassign'), unitId: z.string().min(1) }),
  // Mover/estirar la estancia desde el tape chart (ADR 0023): re-cotiza SIEMPRE
  // en servidor. `unitId` opcional = arrastre diagonal (fecha+unidad, una acción).
  // `expectedTotalCents` = candado: si el total recalculado difiere → 409 price_changed.
  z.object({
    action: z.literal('move'),
    dateFrom: isoDate,
    dateTo: isoDate,
    unitId: z.string().min(1).optional(),
    expectedTotalCents: z.number().int().optional(),
  }),
  z.object({ action: z.literal('note'), notes: z.string().max(2000) }),
  z.object({
    action: z.literal('set_arrival_details'),
    vehiclePlate: z.string().trim().max(20).nullable(),
    arrivalEta: z.string().datetime({ offset: true }).nullable(),
    accessCredential: z.string().trim().max(80).nullable(),
  }),
  z.object({
    action: z.literal('set_deposit_requirement'),
    amountCents: z.number().int().nonnegative(),
  }),
  z.object({
    action: z.literal('record_deposit'),
    amountCents: z.number().int().positive(),
    method: z.enum(['cash', 'card']),
  }),
  z.object({ action: z.literal('refund_deposit'), amountCents: z.number().int().positive() }),
  z.object({
    action: z.literal('record_payment'),
    amountCents: z.number().int().positive(),
    method: z.enum(['cash', 'card']),
  }),
  z.object({ action: z.literal('refund'), amountCents: z.number().int().positive() }),
  // Forma de pago de la operación para el parte de viajeros (ADR 0028). Se CAPTURA
  // explícita (no se deriva de payments.provider); nullable para poder retirarla.
  z.object({ action: z.literal('set_payment_kind'), paymentKind: paymentKindSchema.nullable() }),
]);

// ---------- Huéspedes editables (ADR 0022 §2): parte de viajeros ----------

const docTypeSchema = z.enum(['dni', 'nie', 'passport', 'other']);
const sexSchema = z.enum(['M', 'F']);

/** Alta de un huésped en una reserva. Nombre y apellidos mínimos; documento opcional. */
export const guestCreateSchema = z.object({
  name: z.string().min(1).max(120),
  surname: z.string().min(1).max(120),
  /** Campos del parte de viajeros (ADR 0028), todos opcionales en el alta. */
  secondSurname: z.string().max(120).optional(),
  sex: sexSchema.optional(),
  docType: docTypeSchema.optional(),
  docNumber: z.string().max(40).optional(),
  docSupportNumber: z.string().max(40).optional(),
  /** Parentesco con el acompañante — solo para menores de 14. */
  kinship: z.string().max(60).optional(),
  birthdate: isoDate.optional(),
  nationality: z.string().max(2).optional(),
  email: z.string().email().max(200).optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  /**
   * Recepción registra que el huésped aceptó la política (ADR 0026 §2.3). Antes
   * este campo no existía y el alta de mostrador clavaba `null` sin alternativa:
   * la doc publicada prometía un consentimiento que nunca se guardaba.
   */
  gdprConsent: z.boolean().optional(),
});

/** Edición de los datos de un huésped ya existente (los que la ficha pintaba). */
export const guestPatchSchema = z
  .object({
    name: z.string().min(1).max(120),
    surname: z.string().min(1).max(120),
    /** Campos del parte de viajeros (ADR 0028). */
    secondSurname: z.string().max(120).nullable(),
    sex: sexSchema.nullable(),
    docType: docTypeSchema.nullable(),
    docNumber: z.string().max(40).nullable(),
    docSupportNumber: z.string().max(40).nullable(),
    kinship: z.string().max(60).nullable(),
    birthdate: isoDate.nullable(),
    nationality: z.string().max(2).nullable(),
    email: z.string().email().max(200).nullable().or(z.literal('')),
    phone: z.string().max(40).nullable(),
    /** Registrar o retirar el consentimiento (ADR 0026 §2.3). Es revocable. */
    gdprConsent: z.boolean(),
  })
  .partial();

// ---------- Parte de viajeros (ADR 0028) ----------

/** El día del que se pide el parte de entrada (llegadas de esa fecha). */
export const parteQuerySchema = z.object({ date: isoDate });

// ---------- Bloqueos de inventario desde la UI (ADR 0022 §3) ----------

/** Crear un bloqueo (avería, propietario…): por unidad O por tipo, nunca ninguno. */
export const blockCreateSchema = z
  .object({
    unitId: z.string().min(1).optional(),
    unitTypeId: z.string().min(1).optional(),
    dateFrom: isoDate,
    dateTo: isoDate,
    reason: z.enum(['maintenance', 'owner', 'longstay', 'manual']),
  })
  .refine((b) => Boolean(b.unitId) !== Boolean(b.unitTypeId), {
    message: 'exactly_one_unit_or_type_required',
  })
  .refine((b) => b.dateFrom < b.dateTo, { message: 'invalid_dates' });

/** Dry-run del move (ADR 0023): misma validación y cotización, sin escribir. */
export const requoteSchema = z.object({
  dateFrom: isoDate,
  dateTo: isoDate,
  unitId: z.string().min(1).optional(),
});

export const enquiryPatchSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'converted', 'lost']),
});

export const enquiriesListQuerySchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'converted', 'lost']).optional(),
});

export const unitPatchSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export const guestsListQuerySchema = z.object({
  /** búsqueda por nombre, apellidos o email (contiene) */
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const notificationsListQuerySchema = z.object({
  status: z.enum(['queued', 'sent', 'failed', 'disabled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const paymentsListQuerySchema = z.object({
  status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
  provider: z.enum(['stripe', 'redsys', 'manual', 'none']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const ratePatchSchema = z
  .object({
    baseCents: z.number().int().min(0),
    extraPersonCents: z.number().int().min(0),
    childCents: z.number().int().min(0),
    petCents: z.number().int().min(0),
    electricityCents: z.number().int().min(0),
    vehicleCents: z.number().int().min(0),
    minStay: z.number().int().min(1),
    maxStay: z.number().int().min(1).nullable(),
    arrivalDays: z.array(z.number().int().min(0).max(6)).nullable(),
    departureDays: z.array(z.number().int().min(0).max(6)).nullable(),
  })
  .partial();

export const reportsQuerySchema = z.object({ from: isoDate, to: isoDate });

export const settingsPatchSchema = z
  .object({
    name: z.string().min(1).max(200),
    timezone: z.string().min(1).max(60),
    currency: z.string().regex(/^[A-Z]{3}$/, 'ISO 4217 de tres letras mayúsculas'),
    locales: z.array(z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'locale BCP 47 corto')).min(1),
    modules: tenantModulesPatchSchema,
  })
  .partial();

export const userCreateSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
  role: z.enum(['owner', 'manager', 'reception', 'readonly']),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;
/**
 * Lo que `createBooking` acepta, venga de la web o del mostrador. El consentimiento
 * llega como `boolean` porque cada puerta lo exige distinto — la web ya no puede
 * mandar `false` (su esquema es `literal(true)`).
 */
export type BookingRequest = z.infer<typeof bookingBaseSchema> & { gdprConsent: boolean };
export type HoldRequest = z.infer<typeof holdRequestSchema>;
export type BookingModify = z.infer<typeof bookingModifySchema>;
