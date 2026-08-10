/**
 * RGPD operativo (ADR 0026 §2) contra D1 real: export del interesado, supresión
 * por anonimización con el freno del plazo legal, consentimiento realmente
 * guardado y purga por retención.
 *
 * Estos tests existen porque `camp.logic2b.com/docs/tecnica/datos-rgpd/` afirma
 * cada una de estas cosas ante el informático de un cliente. Aquí es donde esa
 * página deja de ser una promesa.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { provisionUser } from '../src/auth';
import { CONSENT_VERSION } from '../src/consent';
import { anonymizeGuest, exportGuest, sweepEnquiries, sweepRetention } from '../src/rgpd';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa', LOGIC_CAMP_DEV_AUTH: '1' };

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

async function signIn(email: string, password: string): Promise<string> {
  const res = await app.request('/api/auth/sign-in/email', json({ email, password }), envA);
  expect(res.status).toBe(200);
  const setCookies = (res.headers as Headers & { getSetCookie(): string[] }).getSetCookie();
  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

const db = () => createDb(env.DB);

/** Crea un huésped suelto (sin estancias) directamente en la BD. */
async function makeGuest(id: string, extra: Partial<typeof schema.guests.$inferInsert> = {}) {
  await db()
    .insert(schema.guests)
    .values({
      id,
      tenantId: 'alfa',
      name: 'Nombre',
      surname: 'Apellido',
      docType: 'dni',
      docNumber: '12345678Z',
      birthdate: '1970-05-05',
      nationality: 'ES',
      email: 'persona@example.com',
      phone: '+34600000000',
      address: 'Calle Falsa 123',
      ...extra,
    });
}

/** Enlaza al huésped con una reserva que termina en `dateTo`. */
async function makeStay(guestId: string, bookingId: string, dateTo: string) {
  await db()
    .insert(schema.bookings)
    .values({
      id: bookingId,
      tenantId: 'alfa',
      code: `CS-${bookingId}`,
      status: 'completed',
      channel: 'web',
      dateFrom: '2020-01-01',
      dateTo,
      unitTypeId: 'ut_std',
      occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
      extras: [],
      priceBreakdown: {
        lines: [{ concept: 'price.base', detail: { nights: 2 }, amountCents: 10000 }],
        touristTaxCents: 0,
        totalCents: 10000,
        currency: 'EUR',
      },
      totalCents: 10000,
      paidCents: 10000,
      touristTaxCents: 0,
      depositCents: 0,
      locale: 'es',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    });
  await db().insert(schema.bookingGuests).values({ bookingId, guestId, isLead: true });
}

let owner = '';
let manager = '';
let reception = '';

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
  for (const [email, role] of [
    ['owner@rgpd.test', 'owner'],
    ['manager@rgpd.test', 'manager'],
    ['recepcion@rgpd.test', 'reception'],
  ] as const) {
    await provisionUser(envA, { email, password: 'secreto123', name: role, role });
  }
  owner = await signIn('owner@rgpd.test', 'secreto123');
  manager = await signIn('manager@rgpd.test', 'secreto123');
  reception = await signIn('recepcion@rgpd.test', 'secreto123');
});

describe('consentimiento — la doc promete guardarlo con su fecha (ADR 0026 §2.3)', () => {
  it('una reserva WEB sin consentimiento no se puede crear', async () => {
    const res = await app.request(
      '/api/bookings',
      json({
        unitTypeId: 'ut_std',
        dateFrom: '2026-10-02',
        dateTo: '2026-10-05',
        occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
        extraIds: [],
        holder: { name: 'Sin Consentir', email: 'sin@example.com' },
        locale: 'es',
      }),
      envA,
    );
    expect(res.status).toBe(400);
  });

  it('con consentimiento, se guarda fecha Y versión', async () => {
    const res = await app.request(
      '/api/bookings',
      json({
        unitTypeId: 'ut_std',
        dateFrom: '2026-10-10',
        dateTo: '2026-10-13',
        occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
        extraIds: [],
        holder: { name: 'Consiente', email: 'consiente@example.com' },
        locale: 'es',
        gdprConsent: true,
      }),
      envA,
    );
    expect(res.status).toBe(201);
    const guest = (
      await db()
        .select()
        .from(schema.guests)
        .where(eq(schema.guests.email, 'consiente@example.com'))
    )[0];
    expect(guest?.gdprConsentAt).toBeTruthy();
    expect(guest?.gdprConsentVersion).toBe(CONSENT_VERSION);
  });

  it('el alta de MOSTRADOR no queda bloqueada, pero sin marcar no inventa una fecha', async () => {
    const res = await app.request(
      '/api/admin/bookings',
      json(
        {
          unitTypeId: 'ut_std',
          dateFrom: '2026-10-20',
          dateTo: '2026-10-22',
          occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
          extraIds: [],
          holder: { name: 'Mostrador', email: 'mostrador-rgpd@example.com' },
          locale: 'es',
          channel: 'phone',
        },
        { cookie: reception },
      ),
      envA,
    );
    expect(res.status).toBe(201);
    const guest = (
      await db()
        .select()
        .from(schema.guests)
        .where(eq(schema.guests.email, 'mostrador-rgpd@example.com'))
    )[0];
    expect(guest?.gdprConsentAt).toBeNull();
    expect(guest?.gdprConsentVersion).toBeNull();
  });

  it('recepción puede registrarlo después desde la ficha, y retirarlo', async () => {
    await makeGuest('gst_consent');
    const set = await app.request(
      '/api/admin/guests/gst_consent',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ gdprConsent: true }),
      },
      envA,
    );
    expect(set.status).toBe(200);
    let guest = (
      await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_consent'))
    )[0];
    expect(guest?.gdprConsentAt).toBeTruthy();
    expect(guest?.gdprConsentVersion).toBe(CONSENT_VERSION);

    // revocable: se van fecha Y versión juntas, sin dejar una versión huérfana
    const unset = await app.request(
      '/api/admin/guests/gst_consent',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ gdprConsent: false }),
      },
      envA,
    );
    expect(unset.status).toBe(200);
    guest = (await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_consent')))[0];
    expect(guest?.gdprConsentAt).toBeNull();
    expect(guest?.gdprConsentVersion).toBeNull();
  });
});

describe('export del interesado — art. 15 y 20 (ADR 0026 §2.1)', () => {
  it('devuelve ficha, reservas, pagos y rastro de auditoría', async () => {
    await makeGuest('gst_export');
    await makeStay('gst_export', 'bkg_export', '2021-08-10');

    const data = await exportGuest(db(), 'alfa', 'gst_export');
    expect(data).not.toBeNull();
    expect(data?.guest.id).toBe('gst_export');
    expect(data?.bookings).toHaveLength(1);
    expect(data?.bookings[0]?.code).toBe('CS-bkg_export');
    expect(Array.isArray(data?.payments)).toBe(true);
    expect(Array.isArray(data?.auditTrail)).toBe(true);
  });

  it('el export no entrega el payload raw heredado del proveedor de pago', async () => {
    await makeGuest('gst_export_raw');
    await makeStay('gst_export_raw', 'bkg_export_raw', '2021-08-10');
    await db()
      .insert(schema.payments)
      .values({
        id: 'pay_export_raw',
        bookingId: 'bkg_export_raw',
        provider: 'stripe',
        providerRef: 'cs_test',
        amountCents: 10000,
        status: 'succeeded',
        raw: { customer_email: 'raw-secret@example.com', token: 'tok_secret' },
        createdAt: '2021-08-01T00:00:00.000Z',
      });

    const data = await exportGuest(db(), 'alfa', 'gst_export_raw');
    const dump = JSON.stringify(data?.payments);
    expect(dump).not.toContain('raw-secret@example.com');
    expect(dump).not.toContain('tok_secret');
    expect(data?.payments[0]).not.toHaveProperty('raw');
  });

  it('la ruta pide rol gerencia — no es una consulta de mostrador', async () => {
    await makeGuest('gst_export');
    const res = await app.request(
      '/api/admin/guests/gst_export/export',
      { headers: { cookie: reception } },
      envA,
    );
    expect(res.status).toBe(403);

    const ok = await app.request(
      '/api/admin/guests/gst_export/export',
      { headers: { cookie: manager } },
      envA,
    );
    expect(ok.status).toBe(200);
  });

  it('entregar un export también se audita: queda quién lo pidió', async () => {
    await makeGuest('gst_export');
    const res = await app.request(
      '/api/admin/guests/gst_export/export',
      { headers: { cookie: manager } },
      envA,
    );
    expect(res.status).toBe(200);
    const rows = await db()
      .select()
      .from(schema.auditLog)
      .where(eq(schema.auditLog.entityId, 'gst_export'));
    expect(rows.some((r) => r.action === 'export')).toBe(true);
  });

  it('un id que no existe → 404', async () => {
    expect(await exportGuest(db(), 'alfa', 'gst_no_existe')).toBeNull();
  });
});

describe('supresión — anonimizar, y negar CON FECHA (ADR 0026 §2.2)', () => {
  it('sin estancias se puede suprimir ya, y la ficha queda vaciada', async () => {
    await makeGuest('gst_libre');
    const res = await anonymizeGuest(db(), 'alfa', 'gst_libre', { today: '2026-07-21' });
    expect(res).toEqual({ ok: true, alreadyDone: false });

    const g = (await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_libre')))[0];
    expect(g?.anonymizedAt).toBeTruthy();
    expect(g?.docNumber).toBeNull();
    expect(g?.email).toBeNull();
    expect(g?.phone).toBeNull();
    expect(g?.birthdate).toBeNull();
    expect(g?.nationality).toBeNull();
    expect(g?.address).toBeNull();
    // la fila SOBREVIVE: reservas y pagos la referencian
    expect(g).toBeDefined();
  });

  it('vacía también los campos del parte, el consentimiento y las notas libres vinculadas', async () => {
    await makeGuest('gst_pii_completo', {
      secondSurname: 'Personal',
      sex: 'F',
      docSupportNumber: 'SOPORTE-SECRETO',
      kinship: 'Madre',
      gdprConsentAt: '2020-01-01T00:00:00.000Z',
      gdprConsentVersion: 'privacy-2020',
    });
    await makeStay('gst_pii_completo', 'bkg_pii_completo', '2021-01-03');
    await db()
      .update(schema.bookings)
      .set({ notes: 'Alergia y teléfono privado +34699999999' })
      .where(eq(schema.bookings.id, 'bkg_pii_completo'));

    const result = await anonymizeGuest(db(), 'alfa', 'gst_pii_completo', {
      today: '2026-07-21',
    });
    expect(result).toEqual({ ok: true, alreadyDone: false });

    const guest = (
      await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_pii_completo'))
    )[0]!;
    for (const field of [
      'secondSurname',
      'sex',
      'docSupportNumber',
      'kinship',
      'gdprConsentAt',
      'gdprConsentVersion',
    ] as const) {
      expect(guest[field]).toBeNull();
    }
    const booking = (
      await db().select().from(schema.bookings).where(eq(schema.bookings.id, 'bkg_pii_completo'))
    )[0]!;
    expect(booking.notes).toBeNull();
  });

  it('una estancia dentro del plazo legal la BLOQUEA, y dice hasta cuándo', async () => {
    await makeGuest('gst_reciente');
    await makeStay('gst_reciente', 'bkg_reciente', '2026-03-14');

    const res = await anonymizeGuest(db(), 'alfa', 'gst_reciente', { today: '2026-07-21' });
    expect(res).toEqual({ ok: false, reason: 'retention_hold', until: '2029-03-14' });

    // y no ha tocado nada
    const g = (
      await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_reciente'))
    )[0];
    expect(g?.docNumber).toBe('12345678Z');
    expect(g?.anonymizedAt).toBeNull();
  });

  it('la ruta devuelve 409 con la fecha, no un "no" a secas', async () => {
    await makeGuest('gst_reciente');
    await makeStay('gst_reciente', 'bkg_reciente', '2026-03-14');
    const res = await app.request(
      '/api/admin/guests/gst_reciente',
      { method: 'DELETE', headers: { cookie: manager } },
      envA,
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      error: 'retention_hold',
      until: '2029-03-14',
      basis: 'traveller_registry',
    });
  });

  it('una estancia ya vencida no bloquea', async () => {
    await makeGuest('gst_viejo');
    await makeStay('gst_viejo', 'bkg_viejo', '2021-06-01');
    const res = await anonymizeGuest(db(), 'alfa', 'gst_viejo', { today: '2026-07-21' });
    expect(res).toEqual({ ok: true, alreadyDone: false });
  });

  it('es idempotente: repetir no da error ni duplica auditoría', async () => {
    await makeGuest('gst_viejo');
    await makeStay('gst_viejo', 'bkg_viejo', '2021-06-01');
    expect(await anonymizeGuest(db(), 'alfa', 'gst_viejo', { today: '2026-07-21' })).toEqual({
      ok: true,
      alreadyDone: false,
    });
    const before = (
      await db().select().from(schema.auditLog).where(eq(schema.auditLog.entityId, 'gst_viejo'))
    ).filter((r) => r.action === 'anonymize').length;
    const res = await anonymizeGuest(db(), 'alfa', 'gst_viejo', { today: '2026-07-21' });
    expect(res).toEqual({ ok: true, alreadyDone: true });
    const after = (
      await db().select().from(schema.auditLog).where(eq(schema.auditLog.entityId, 'gst_viejo'))
    ).filter((r) => r.action === 'anonymize').length;
    expect(after).toBe(before);
  });

  it('una ficha anonimizada no se puede volver a rellenar', async () => {
    await makeGuest('gst_viejo');
    await anonymizeGuest(db(), 'alfa', 'gst_viejo', { today: '2026-07-21' });
    const res = await app.request(
      '/api/admin/guests/gst_viejo',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ name: 'Reaparecido' }),
      },
      envA,
    );
    expect(res.status).toBe(409);
  });

  it('la supresión queda auditada, y su propio rastro no lleva dato personal', async () => {
    await makeGuest('gst_libre');
    await anonymizeGuest(db(), 'alfa', 'gst_libre', { today: '2026-07-21' });
    const rows = await db()
      .select()
      .from(schema.auditLog)
      .where(eq(schema.auditLog.entityId, 'gst_libre'));
    const entry = rows.find((r) => r.action === 'anonymize');
    expect(entry).toBeDefined();
    expect(JSON.stringify(entry?.diff)).not.toContain('12345678Z');
  });

  it('LIMPIA el PII que el audit_log había copiado — si no, la anonimización sería de mentira', async () => {
    await makeGuest('gst_rastro');
    // recepción edita la ficha: `PATCH /guests/:id` vuelca el patch entero en audit_log
    const edit = await app.request(
      '/api/admin/guests/gst_rastro',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ docNumber: '99999999R', phone: '+34611111111' }),
      },
      envA,
    );
    expect(edit.status).toBe(200);

    const antes = await db()
      .select()
      .from(schema.auditLog)
      .where(eq(schema.auditLog.entityId, 'gst_rastro'));
    expect(JSON.stringify(antes)).toContain('99999999R');

    await anonymizeGuest(db(), 'alfa', 'gst_rastro', { today: '2026-07-21' });

    const despues = await db()
      .select()
      .from(schema.auditLog)
      .where(eq(schema.auditLog.entityId, 'gst_rastro'));
    const dump = JSON.stringify(despues);
    expect(dump).not.toContain('99999999R');
    expect(dump).not.toContain('+34611111111');
    // pero se conserva QUÉ campos se tocaron: la auditoría sigue sirviendo
    expect(dump).toContain('docNumber');
    expect(dump).toContain('scrubbed');
  });

  it('la ruta pide rol gerencia', async () => {
    await makeGuest('gst_rol');
    const res = await app.request(
      '/api/admin/guests/gst_rol',
      { method: 'DELETE', headers: { cookie: reception } },
      envA,
    );
    expect(res.status).toBe(403);
  });
});

describe('purga de solicitudes — el caso del nivel 1 (ADR 0026 §2.4)', () => {
  async function makeEnquiry(id: string, createdAt: string) {
    await db()
      .insert(schema.enquiries)
      .values({
        id,
        tenantId: 'alfa',
        status: 'lost',
        message: 'Quería una parcela con sombra',
        contact: { name: 'Marta Solicitante', email: 'marta@example.com', phone: '+34622222222' },
        locale: 'es',
        source: 'web',
        createdAt,
      });
  }

  it('anonimiza el contacto de las solicitudes vencidas y CONSERVA la fila', async () => {
    await makeEnquiry('enq_vieja', '2019-05-02T10:00:00.000Z');
    const res = await sweepEnquiries(db(), { today: '2026-07-21' });
    expect(res.due).toContain('enq_vieja');

    const row = (
      await db().select().from(schema.enquiries).where(eq(schema.enquiries.id, 'enq_vieja'))
    )[0];
    // la fila sigue ahí: el histórico de solicitudes es lo que hace renovar al nivel 1
    expect(row).toBeDefined();
    expect(row?.createdAt).toBe('2019-05-02T10:00:00.000Z');
    expect(row?.status).toBe('lost');
    // pero no queda rastro de quién era
    expect(JSON.stringify(row?.contact)).not.toContain('marta@example.com');
    expect(JSON.stringify(row?.contact)).not.toContain('+34622222222');
    expect(row?.message).toBe('');
  });

  it('no toca las solicitudes recientes', async () => {
    await makeEnquiry('enq_nueva', '2026-06-01T10:00:00.000Z');
    const res = await sweepEnquiries(db(), { today: '2026-07-21' });
    expect(res.due).not.toContain('enq_nueva');
  });

  it('el dry-run no muta nada', async () => {
    await makeEnquiry('enq_dry', '2018-01-01T10:00:00.000Z');
    const res = await sweepEnquiries(db(), { dryRun: true, today: '2026-07-21' });
    expect(res.due).toContain('enq_dry');
    expect(res.anonymized).toBe(0);
    const row = (
      await db().select().from(schema.enquiries).where(eq(schema.enquiries.id, 'enq_dry'))
    )[0];
    expect(row?.contact.email).toBe('marta@example.com');
  });

  it('es idempotente: una ya anonimizada no vuelve a salir', async () => {
    await makeEnquiry('enq_rep', '2018-01-01T10:00:00.000Z');
    await sweepEnquiries(db(), { today: '2026-07-21' });
    const segunda = await sweepEnquiries(db(), { today: '2026-07-21' });
    expect(segunda.due).not.toContain('enq_rep');
  });
});

describe('purga por retención (ADR 0026 §2.4)', () => {
  it('el dry-run no toca nada', async () => {
    await makeGuest('gst_purga');
    await makeStay('gst_purga', 'bkg_purga', '2019-08-01');

    const preview = await sweepRetention(db(), 'alfa', { dryRun: true, today: '2026-07-21' });
    expect(preview.due).toContain('gst_purga');
    expect(preview.anonymized).toBe(0);

    const g = (await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_purga')))[0];
    expect(g?.anonymizedAt).toBeNull();
  });

  it('la ruta de previsualización es de dirección y no muta', async () => {
    const res = await app.request(
      '/api/admin/rgpd/retention',
      { headers: { cookie: manager } },
      envA,
    );
    expect(res.status).toBe(403);

    const ok = await app.request('/api/admin/rgpd/retention', { headers: { cookie: owner } }, envA);
    expect(ok.status).toBe(200);
  });

  it('ejecutada de verdad, anonimiza lo vencido y deja lo que está en plazo', async () => {
    await makeGuest('gst_purga');
    await makeStay('gst_purga', 'bkg_purga', '2019-08-01');
    await makeGuest('gst_en_plazo');
    await makeStay('gst_en_plazo', 'bkg_en_plazo', '2025-08-01');

    const result = await sweepRetention(db(), 'alfa', { today: '2026-07-21' });
    expect(result.due).toContain('gst_purga');
    expect(result.due).not.toContain('gst_en_plazo');
    expect(result.anonymized).toBeGreaterThan(0);

    const purgado = (
      await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_purga'))
    )[0];
    expect(purgado?.anonymizedAt).toBeTruthy();
    expect(purgado?.docNumber).toBeNull();

    const vivo = (
      await db().select().from(schema.guests).where(eq(schema.guests.id, 'gst_en_plazo'))
    )[0];
    expect(vivo?.anonymizedAt).toBeNull();
    expect(vivo?.docNumber).toBe('12345678Z');
  });
});
