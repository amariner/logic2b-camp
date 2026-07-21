import { z } from 'zod';

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');

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

export const enquiryRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  contact: contactSchema,
  locale: z.string().min(2).max(5).default('es'),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  occupancy: occupancySchema.optional(),
  unitTypeId: z.string().optional(),
  source: z.string().max(40).default('web'),
});

export const bookingRequestSchema = z.object({
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

export const adminBookingCreateSchema = bookingRequestSchema.extend({
  channel: z.enum(['phone', 'walkin']).default('phone'),
});

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
  z.object({ action: z.literal('note'), notes: z.string().max(2000) }),
  z.object({
    action: z.literal('record_payment'),
    amountCents: z.number().int().positive(),
    method: z.enum(['cash', 'card']),
  }),
  z.object({ action: z.literal('refund'), amountCents: z.number().int().positive() }),
]);

// ---------- Huéspedes editables (ADR 0022 §2): parte de viajeros ----------

const docTypeSchema = z.enum(['dni', 'nie', 'passport', 'other']);

/** Alta de un huésped en una reserva. Nombre y apellidos mínimos; documento opcional. */
export const guestCreateSchema = z.object({
  name: z.string().min(1).max(120),
  surname: z.string().min(1).max(120),
  docType: docTypeSchema.optional(),
  docNumber: z.string().max(40).optional(),
  birthdate: isoDate.optional(),
  nationality: z.string().max(2).optional(),
  email: z.string().email().max(200).optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
});

/** Edición de los datos de un huésped ya existente (los que la ficha pintaba). */
export const guestPatchSchema = z
  .object({
    name: z.string().min(1).max(120),
    surname: z.string().min(1).max(120),
    docType: docTypeSchema.nullable(),
    docNumber: z.string().max(40).nullable(),
    birthdate: isoDate.nullable(),
    nationality: z.string().max(2).nullable(),
    email: z.string().email().max(200).nullable().or(z.literal('')),
    phone: z.string().max(40).nullable(),
  })
  .partial();

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
  .refine((b) => Boolean(b.unitId) || Boolean(b.unitTypeId), {
    message: 'unit_or_type_required',
  })
  .refine((b) => b.dateFrom < b.dateTo, { message: 'invalid_dates' });

export const enquiryPatchSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'converted', 'lost']),
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
    currency: z.string().length(3),
    locales: z.array(z.string().min(2).max(5)).min(1),
    modules: z.record(z.string(), z.unknown()),
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
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
export type HoldRequest = z.infer<typeof holdRequestSchema>;
export type BookingModify = z.infer<typeof bookingModifySchema>;
