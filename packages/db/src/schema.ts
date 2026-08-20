import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Esquema de UNA instancia (cada camping tiene su propia D1 — ver ADR 0002).
// Dinero: céntimos enteros. Fechas de estancia: 'YYYY-MM-DD', from inclusive / to EXCLUSIVE.

// ---------- Tipos JSON ----------

export type Occupancy = {
  adults: number;
  /** Edades de los niños: necesarias para tasa turística y capacidad */
  childrenAges: number[];
  pets: number;
  vehicles: number;
};

export type PriceLine = {
  /** clave i18n del concepto, p.ej. 'price.base', 'price.extra_person' */
  concept: string;
  /** detalle auditable: noches, unidades, tarifa aplicada, temporada… */
  detail: Record<string, string | number>;
  amountCents: number;
};

export type PriceBreakdown = {
  lines: PriceLine[];
  totalCents: number;
  touristTaxCents: number;
  currency: string;
};

export type I18nText = Partial<Record<'es' | 'ca' | 'en' | 'fr' | 'de' | 'nl', string>>;

export type ContactInfo = {
  name: string;
  email: string;
  phone?: string;
  locale?: string;
};

// ---------- Instancia ----------

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tier: integer('tier').notNull(), // 1..4
  timezone: text('timezone').notNull(),
  currency: text('currency').notNull(),
  locales: text('locales', { mode: 'json' }).$type<string[]>().notNull(),
  modules: text('modules', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
});

// ---------- Calendario e inventario ----------

export const seasonsCalendar = sqliteTable(
  'seasons_calendar',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    dateFrom: text('date_from').notNull(),
    dateTo: text('date_to').notNull(),
    priority: integer('priority').notNull().default(0),
    isOpen: integer('is_open', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [index('seasons_dates_idx').on(t.dateFrom, t.dateTo)],
);

export const unitTypes = sqliteTable('unit_types', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  kind: text('kind', { enum: ['pitch', 'lodging'] }).notNull(),
  nameI18n: text('name_i18n', { mode: 'json' }).$type<I18nText>().notNull(),
  capacityMin: integer('capacity_min').notNull().default(1),
  capacityMax: integer('capacity_max').notNull(),
  includedPersons: integer('included_persons').notNull(),
  features: text('features', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  photos: text('photos', { mode: 'json' }).$type<string[]>().notNull(),
});

export const units = sqliteTable(
  'units',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    unitTypeId: text('unit_type_id')
      .notNull()
      .references(() => unitTypes.id),
    code: text('code').notNull(),
    attributes: text('attributes', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
  },
  (t) => [uniqueIndex('units_code_uq').on(t.code), index('units_type_idx').on(t.unitTypeId)],
);

// ---------- Tarifas ----------

export const ratePlans = sqliteTable(
  'rate_plans',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    unitTypeId: text('unit_type_id')
      .notNull()
      .references(() => unitTypes.id),
    seasonId: text('season_id')
      .notNull()
      .references(() => seasonsCalendar.id),
    baseCents: integer('base_cents').notNull(),
    extraPersonCents: integer('extra_person_cents').notNull().default(0),
    childCents: integer('child_cents').notNull().default(0),
    petCents: integer('pet_cents').notNull().default(0),
    electricityCents: integer('electricity_cents').notNull().default(0),
    vehicleCents: integer('vehicle_cents').notNull().default(0),
    minStay: integer('min_stay').notNull().default(1),
    maxStay: integer('max_stay'),
    /** 0=domingo … 6=sábado; null/[] = cualquier día */
    arrivalDays: text('arrival_days', { mode: 'json' }).$type<number[]>(),
    departureDays: text('departure_days', { mode: 'json' }).$type<number[]>(),
  },
  (t) => [index('rate_plans_type_season_idx').on(t.unitTypeId, t.seasonId)],
);

export type RateRuleConditions = Record<string, unknown>;
export type RateRuleDiscount =
  { type: 'percent'; value: number } | { type: 'fixed_cents'; value: number };

export const rateRules = sqliteTable('rate_rules', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  type: text('type', {
    enum: ['early_booking', 'last_minute', 'long_stay', 'acsi', 'promo'],
  }).notNull(),
  conditions: text('conditions', { mode: 'json' }).$type<RateRuleConditions>().notNull(),
  discount: text('discount', { mode: 'json' }).$type<RateRuleDiscount>().notNull(),
  stackable: integer('stackable', { mode: 'boolean' }).notNull().default(false),
  priority: integer('priority').notNull().default(0),
});

export const extras = sqliteTable('extras', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nameI18n: text('name_i18n', { mode: 'json' }).$type<I18nText>().notNull(),
  priceCents: integer('price_cents').notNull(),
  per: text('per', { enum: ['stay', 'night', 'person'] }).notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
});

export const inventoryBlocks = sqliteTable(
  'inventory_blocks',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    unitId: text('unit_id').references(() => units.id),
    unitTypeId: text('unit_type_id').references(() => unitTypes.id),
    dateFrom: text('date_from').notNull(),
    dateTo: text('date_to').notNull(),
    reason: text('reason', { enum: ['maintenance', 'owner', 'longstay', 'manual'] }).notNull(),
  },
  (t) => [
    index('blocks_unit_dates_idx').on(t.unitId, t.dateFrom, t.dateTo),
    index('blocks_type_dates_idx').on(t.unitTypeId, t.dateFrom, t.dateTo),
  ],
);

// Bloqueo temporal del funnel (ADR 0007): por TIPO, 15 min, expiración perezosa + cron.
// Un hold vivo resta 1 a la disponibilidad de su tipo; se consume en el mismo batch
// que crea la reserva o muere solo.
export const inventoryHolds = sqliteTable(
  'inventory_holds',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    unitTypeId: text('unit_type_id')
      .notNull()
      .references(() => unitTypes.id),
    dateFrom: text('date_from').notNull(),
    dateTo: text('date_to').notNull(),
    occupancy: text('occupancy', { mode: 'json' }).$type<Occupancy>(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('holds_type_dates_idx').on(t.unitTypeId, t.dateFrom, t.dateTo),
    index('holds_expires_idx').on(t.expiresAt),
  ],
);

// ---------- Solicitudes (tabla propia, NO bookings en borrador — ADR 0002) ----------

export const enquiries = sqliteTable(
  'enquiries',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    status: text('status', { enum: ['new', 'contacted', 'quoted', 'converted', 'lost'] })
      .notNull()
      .default('new'),
    dateFrom: text('date_from'),
    dateTo: text('date_to'),
    occupancy: text('occupancy', { mode: 'json' }).$type<Occupancy>(),
    unitTypeId: text('unit_type_id').references(() => unitTypes.id),
    message: text('message').notNull(),
    contact: text('contact', { mode: 'json' }).$type<ContactInfo>().notNull(),
    locale: text('locale').notNull(),
    source: text('source').notNull(),
    convertedBookingId: text('converted_booking_id'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('enquiries_status_idx').on(t.status)],
);

// ---------- Reservas ----------

export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    code: text('code').notNull(),
    status: text('status', {
      enum: ['pending', 'confirmed', 'cancelled', 'no_show', 'completed'],
    }).notNull(),
    channel: text('channel', { enum: ['web', 'phone', 'walkin', 'import'] }).notNull(),
    dateFrom: text('date_from').notNull(),
    dateTo: text('date_to').notNull(),
    unitTypeId: text('unit_type_id')
      .notNull()
      .references(() => unitTypes.id),
    unitId: text('unit_id').references(() => units.id),
    occupancy: text('occupancy', { mode: 'json' }).$type<Occupancy>().notNull(),
    extras: text('extras', { mode: 'json' })
      .$type<{ extraId: string; qty: number; amountCents: number }[]>()
      .notNull(),
    priceBreakdown: text('price_breakdown', { mode: 'json' }).$type<PriceBreakdown>().notNull(),
    totalCents: integer('total_cents').notNull(),
    paidCents: integer('paid_cents').notNull().default(0),
    touristTaxCents: integer('tourist_tax_cents').notNull().default(0),
    depositCents: integer('deposit_cents').notNull().default(0),
    notes: text('notes'),
    /** Operativa de llegada (E-mejoras): datos nulables y aditivos. */
    vehiclePlate: text('vehicle_plate'),
    arrivalEta: text('arrival_eta'),
    accessCredential: text('access_credential'),
    // Check-in / check-out (ADR 0022): hechos ORTOGONALES al ciclo de vida, no
    // un estado. Una reserva confirmada con el huésped dentro sigue siendo
    // 'confirmed' — "en casa" se deriva (checkedInAt != null && checkedOutAt == null).
    // Nulables y aditivas a propósito: no cambian la semántica de ningún filtro
    // por status (ocupación, informes, solape). ISO datetime, como sentAt.
    checkedInAt: text('checked_in_at'),
    checkedOutAt: text('checked_out_at'),
    /**
     * Forma de pago de la operación para el parte de viajeros (ADR 0028). Dato
     * PROPIO, nulable: no se deriva de payments.provider (el proveedor ≠ el medio).
     */
    paymentKind: text('payment_kind', {
      enum: ['cash', 'card', 'transfer', 'platform'],
    }),
    locale: text('locale').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    uniqueIndex('bookings_code_uq').on(t.code),
    index('bookings_type_dates_idx').on(t.unitTypeId, t.dateFrom, t.dateTo),
    index('bookings_unit_dates_idx').on(t.unitId, t.dateFrom, t.dateTo),
    index('bookings_status_idx').on(t.status),
  ],
);

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  docType: text('doc_type', { enum: ['dni', 'nie', 'passport', 'other'] }),
  docNumber: text('doc_number'),
  /** Nº de soporte del documento (ADR 0028): dato del parte distinto de docNumber. */
  docSupportNumber: text('doc_support_number'),
  birthdate: text('birthdate'),
  nationality: text('nationality'),
  /** Sexo, requerido por el parte de viajeros (ADR 0028). Nulable y aditivo. */
  sex: text('sex', { enum: ['M', 'F'] }),
  /** Segundo apellido, requerido por el parte. */
  secondSurname: text('second_surname'),
  /** Parentesco con el acompañante — SOLO para viajeros menores de 14 (ADR 0028). */
  kinship: text('kinship'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  gdprConsentAt: text('gdpr_consent_at'),
  /** A qué texto se consintió — una fecha sin versión no prueba nada (ADR 0026 §2.3). */
  gdprConsentVersion: text('gdpr_consent_version'),
  /** Sello de supresión (art. 17). La fila sobrevive vaciada, nunca se borra (ADR 0026 §2.2). */
  anonymizedAt: text('anonymized_at'),
});

export const bookingGuests = sqliteTable(
  'booking_guests',
  {
    bookingId: text('booking_id')
      .notNull()
      .references(() => bookings.id),
    guestId: text('guest_id')
      .notNull()
      .references(() => guests.id),
    isLead: integer('is_lead', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [uniqueIndex('booking_guests_uq').on(t.bookingId, t.guestId)],
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    bookingId: text('booking_id')
      .notNull()
      .references(() => bookings.id),
    provider: text('provider', { enum: ['stripe', 'redsys', 'manual', 'none'] }).notNull(),
    providerRef: text('provider_ref'),
    /** Con signo: reembolso = negativo. sum(amount_cents) == bookings.paid_cents */
    amountCents: integer('amount_cents').notNull(),
    status: text('status', { enum: ['pending', 'succeeded', 'failed', 'refunded'] }).notNull(),
    /** Legado: se mantiene para migraciones; la aplicación escribe null y nunca lo expone. */
    raw: text('raw', { mode: 'json' }).$type<Record<string, unknown>>(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('payments_booking_idx').on(t.bookingId)],
);

// ---------- Operación ----------

export const notificationsLog = sqliteTable('notifications_log', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  bookingId: text('booking_id').references(() => bookings.id),
  enquiryId: text('enquiry_id').references(() => enquiries.id),
  channel: text('channel', { enum: ['email', 'whatsapp'] }).notNull(),
  template: text('template').notNull(),
  status: text('status', { enum: ['queued', 'sent', 'failed', 'disabled'] }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  sentAt: text('sent_at'),
  // Nullable a propósito (como sentAt): las filas de antes de esta columna
  // (sesiones 18-21, ya en la D1 remota) no tienen fecha real que inventar.
  createdAt: text('created_at'),
});

// Tabla ÚNICA de usuario: la de dominio Y la de Better Auth (ADR 0005).
// name/email_verified/image/created_at/updated_at son los campos que exige Better Auth.
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    email: text('email').notNull(),
    // `demo` es el visitante anónimo de la demo (ADR 0029), no un rol que un
    // camping reparta a su plantilla: se siembra, no se provisiona — por eso
    // `userCreateSchema` sigue aceptando solo los cuatro reales.
    // Sin migración: la columna es `text NOT NULL` pelada, el enum es solo tipo.
    role: text('role', { enum: ['owner', 'manager', 'reception', 'readonly', 'demo'] }).notNull(),
    name: text('name').notNull().default(''),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`0`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`0`),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
);

// ---------- Auth (Better Auth — ADR 0005) ----------

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [uniqueIndex('sessions_token_uq').on(t.token), index('sessions_user_idx').on(t.userId)],
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    /** hash scrypt de Better Auth para providerId='credential' — nunca en `users` */
    password: text('password'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [index('accounts_user_idx').on(t.userId)],
);

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    userId: text('user_id').references(() => users.id),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action').notNull(),
    diff: text('diff', { mode: 'json' }).$type<Record<string, unknown>>(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('audit_entity_idx').on(t.entity, t.entityId)],
);

// Marcador de versión de esquema (desde Fase 0)
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
