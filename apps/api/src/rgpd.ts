/**
 * RGPD operativo (ADR 0026 §2): export de un interesado, supresión por
 * anonimización y purga automática por retención.
 *
 * El ÚNICO sitio que anonimiza. Si aparece un segundo, la anonimización dejará de
 * ser completa el día que alguien se olvide de actualizar uno de los dos.
 */
import {
  addYears,
  anonymizableFrom,
  isDueForAnonymization,
  RETENTION,
  type RetentionStay,
} from '@logic-camp/core';
import { schema, type Db } from '@logic-camp/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { nowIso, uid } from './ids';
import { paymentView } from './payments';

/** Fecha de hoy en ISO sin zona horaria — el sistema opera en UTC. */
export const todayIso = (): string => nowIso().slice(0, 10);

export { CONSENT_VERSION } from './consent';

/**
 * Valores con los que se sustituye el dato personal. La fila SOBREVIVE: reservas y
 * pagos la referencian y deben seguir cuadrando (invariante 2). Lo que se va es la
 * capacidad de saber de quién era.
 */
const SCRUBBED = {
  name: 'Anonimizado',
  surname: '',
  secondSurname: null,
  sex: null,
  docType: null,
  docNumber: null,
  docSupportNumber: null,
  birthdate: null,
  nationality: null,
  kinship: null,
  email: null,
  phone: null,
  address: null,
  gdprConsentAt: null,
  gdprConsentVersion: null,
} as const;

/** Claves de `guests` que son dato personal — el export y el borrado usan la MISMA lista. */
const PERSONAL_FIELDS = Object.keys(SCRUBBED);

async function staysOf(db: Db, guestId: string): Promise<RetentionStay[]> {
  const links = await db
    .select()
    .from(schema.bookingGuests)
    .where(eq(schema.bookingGuests.guestId, guestId));
  if (!links.length) return [];
  const rows = await db
    .select({ dateTo: schema.bookings.dateTo })
    .from(schema.bookings)
    .where(
      inArray(
        schema.bookings.id,
        links.map((l) => l.bookingId),
      ),
    );
  return rows;
}

export type AnonymizeResult =
  | { ok: true; alreadyDone: boolean }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'retention_hold'; until: string };

/**
 * Ejercicio del derecho de supresión (art. 17) sobre un huésped.
 *
 * Nunca borra en duro. Y cuando no puede, dice HASTA CUÁNDO: un "no" sin fecha es
 * indistinguible de un producto que no sabe hacerlo (ADR 0026 §2.2).
 */
export async function anonymizeGuest(
  db: Db,
  tenantSlug: string,
  guestId: string,
  opts: { today?: string; userId?: string | null; retentionYears?: number } = {},
): Promise<AnonymizeResult> {
  const guest = (await db.select().from(schema.guests).where(eq(schema.guests.id, guestId)))[0];
  if (!guest) return { ok: false, reason: 'not_found' };
  // Idempotente a propósito: un reintento del cliente no debe dar error ni duplicar
  // la entrada de auditoría.
  if (guest.anonymizedAt) return { ok: true, alreadyDone: true };

  const until = anonymizableFrom(
    await staysOf(db, guestId),
    opts.today ?? todayIso(),
    opts.retentionYears,
  );
  if (until) return { ok: false, reason: 'retention_hold', until };

  const at = nowIso();
  const links = await db
    .select({ bookingId: schema.bookingGuests.bookingId })
    .from(schema.bookingGuests)
    .where(eq(schema.bookingGuests.guestId, guestId));
  const writes = [
    db
      .update(schema.guests)
      .set({ ...SCRUBBED, anonymizedAt: at })
      .where(eq(schema.guests.id, guestId)),
    ...(links.length
      ? [
          db
            .update(schema.bookings)
            .set({ notes: null })
            .where(
              inArray(
                schema.bookings.id,
                links.map((link) => link.bookingId),
              ),
            ),
        ]
      : []),
  ];
  await db.batch(writes as unknown as Parameters<typeof db.batch>[0]);
  await scrubAuditTrail(db, guestId);
  // La supresión se audita SIEMPRE, y su propio rastro no lleva ningún dato personal.
  await db.insert(schema.auditLog).values({
    id: uid('aud'),
    tenantId: tenantSlug,
    userId: opts.userId ?? null,
    entity: 'guest',
    entityId: guestId,
    action: 'anonymize',
    diff: { anonymizedAt: at },
    createdAt: at,
  });
  return { ok: true, alreadyDone: false };
}

/**
 * Limpia el PII que el audit_log copió al editar la ficha.
 *
 * Sin esto la anonimización sería de mentira: `PATCH /guests/:id` vuelca el patch
 * entero en `audit_log.diff`, así que nombre, documento, fecha de nacimiento,
 * email y teléfono quedaban duplicados fuera de la tabla que vaciamos.
 *
 * Se conserva QUÉ campos se tocaron y cuándo —que es para lo que sirve una
 * auditoría— y se tiran los valores.
 */
async function scrubAuditTrail(db: Db, guestId: string): Promise<void> {
  const rows = await db
    .select()
    .from(schema.auditLog)
    .where(and(eq(schema.auditLog.entity, 'guest'), eq(schema.auditLog.entityId, guestId)));
  for (const row of rows) {
    const diff = row.diff as Record<string, unknown> | null;
    if (!diff) continue;
    const touched = Object.keys(diff).filter((k) => PERSONAL_FIELDS.includes(k));
    if (!touched.length) continue;
    const kept = Object.fromEntries(
      Object.entries(diff).filter(([k]) => !PERSONAL_FIELDS.includes(k)),
    );
    await db
      .update(schema.auditLog)
      .set({ diff: { ...kept, scrubbedFields: touched, scrubbed: true } })
      .where(eq(schema.auditLog.id, row.id));
  }
}

export type GuestExport = {
  generatedAt: string;
  tenant: string;
  guest: Record<string, unknown>;
  bookings: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  auditTrail: Record<string, unknown>[];
};

/**
 * Todo lo que el sistema sabe de una persona (art. 15 y art. 20).
 *
 * JSON porque el art. 20 pide un formato estructurado y legible por máquina, y
 * porque es el único que puede llevar las cuatro tablas sin aplanar nada.
 */
export async function exportGuest(
  db: Db,
  tenantSlug: string,
  guestId: string,
): Promise<GuestExport | null> {
  const guest = (await db.select().from(schema.guests).where(eq(schema.guests.id, guestId)))[0];
  if (!guest) return null;

  const links = await db
    .select()
    .from(schema.bookingGuests)
    .where(eq(schema.bookingGuests.guestId, guestId));
  const bookingIds = links.map((l) => l.bookingId);

  const bookings = bookingIds.length
    ? await db
        .select()
        .from(schema.bookings)
        .where(inArray(schema.bookings.id, bookingIds))
        .orderBy(desc(schema.bookings.dateFrom))
    : [];
  const payments = bookingIds.length
    ? await db.select().from(schema.payments).where(inArray(schema.payments.bookingId, bookingIds))
    : [];
  const auditTrail = await db
    .select()
    .from(schema.auditLog)
    .where(and(eq(schema.auditLog.entity, 'guest'), eq(schema.auditLog.entityId, guestId)))
    .orderBy(desc(schema.auditLog.createdAt));

  return {
    generatedAt: nowIso(),
    tenant: tenantSlug,
    guest: {
      ...guest,
      isLeadOf: links.filter((l) => l.isLead).map((l) => l.bookingId),
    },
    bookings,
    payments: payments.map(paymentView),
    auditTrail,
  };
}

/**
 * Purga de SOLICITUDES (ADR 0026 §2.4).
 *
 * Es el caso más expuesto del producto y el que menos se ve: un camping de **nivel
 * 1** no tiene motor ni reservas, pero sus `enquiries` guardan nombre, correo y
 * teléfono de cualquiera que rellenó el formulario, sin plazo y sin consentimiento
 * explícito. Sin esta purga, el nivel de entrada acumularía datos personales para
 * siempre.
 *
 * Se anonimiza el CONTACTO y se conserva la fila: el histórico de solicitudes es lo
 * que hace renovar al nivel 1 (CLAUDE.md), y las fechas y el volumen no son dato
 * personal. Aquí no hay plazo legal que respetar —una solicitud no es un registro de
 * viajeros—, así que manda la ventana de producto.
 */
const SCRUBBED_CONTACT = { name: 'Anonimizado', email: '', phone: undefined, locale: undefined };

export async function sweepEnquiries(
  db: Db,
  opts: { dryRun?: boolean; today?: string; years?: number } = {},
): Promise<{ due: string[]; anonymized: number }> {
  const today = opts.today ?? todayIso();
  const cutoff = addYears(today, -(opts.years ?? RETENTION.defaultPurgeYears));
  const rows = await db.select().from(schema.enquiries);
  const due = rows
    .filter((e) => e.createdAt.slice(0, 10) < cutoff)
    .filter((e) => e.contact.name !== SCRUBBED_CONTACT.name)
    .map((e) => e.id);

  if (opts.dryRun) return { due, anonymized: 0 };
  for (const id of due) {
    await db
      .update(schema.enquiries)
      .set({ contact: SCRUBBED_CONTACT, message: '' })
      .where(eq(schema.enquiries.id, id));
  }
  return { due, anonymized: due.length };
}

export type RetentionSweep = { scanned: number; due: string[]; anonymized: number };

/**
 * Purga por retención. La ejecuta el cron; con `dryRun` se puede mirar antes qué
 * haría, porque una anonimización no tiene vuelta atrás.
 */
export async function sweepRetention(
  db: Db,
  tenantSlug: string,
  opts: { dryRun?: boolean; today?: string; years?: number } = {},
): Promise<RetentionSweep> {
  const today = opts.today ?? todayIso();
  const guests = await db.select().from(schema.guests);
  const pending = guests.filter((g) => !g.anonymizedAt);

  const due: string[] = [];
  for (const g of pending) {
    if (isDueForAnonymization(await staysOf(db, g.id), today, opts.years)) due.push(g.id);
  }

  let anonymized = 0;
  if (!opts.dryRun) {
    for (const id of due) {
      // `userId: null` — la purga no la ejecuta una persona, y la auditoría debe decirlo.
      // NO se le pasa `years`: la comprobación individual usa siempre el plazo LEGAL,
      // así que la ventana de purga (más larga) nunca puede relajarlo por debajo.
      const r = await anonymizeGuest(db, tenantSlug, id, { today, userId: null });
      if (r.ok && !r.alreadyDone) anonymized++;
    }
  }
  return { scanned: pending.length, due, anonymized };
}
