/**
 * Parte de viajeros (ADR 0028): la ORQUESTACIÓN — config del tenant + reunión de las
 * llegadas desde D1 + `buildParte`. El motor puro tiene sus propios tests en
 * `@logic-camp/hospedajes`; aquí se prueba el cableado con la base y los secrets.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildParteForDate, loadHospedajesConfig, resolveTransport } from '../src/hospedajes';
import { seedTenant } from './fixtures';

const db = createDb(env.DB);
const T = 'ten_alfa';
const DATE = '2026-08-10';

/** Activa el módulo hospedajes en el tenant ya sembrado (fusiona sobre modules). */
async function enableHospedajes() {
  const row = (await db.select().from(schema.tenants).where(eq(schema.tenants.slug, 'alfa')))[0]!;
  await db
    .update(schema.tenants)
    .set({
      modules: {
        ...(row.modules as Record<string, unknown>),
        hospedajes: {
          enabled: true,
          codigoEstablecimiento: 'CE-ALFA',
          establecimiento: {
            nombre: 'Camping alfa',
            direccion: 'Ctra. del Faro s/n',
            municipio: 'Alcossebre',
            provincia: 'Castellón',
            cp: '12579',
          },
        },
      },
    })
    .where(eq(schema.tenants.slug, 'alfa'));
}

async function insertBooking(id: string, over: Partial<typeof schema.bookings.$inferInsert> = {}) {
  await db.insert(schema.bookings).values({
    id,
    tenantId: T,
    code: id.toUpperCase(),
    status: 'confirmed',
    channel: 'phone',
    dateFrom: DATE,
    dateTo: '2026-08-13',
    unitTypeId: 'ut_std',
    unitId: 'unt_1',
    occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
    extras: [],
    priceBreakdown: { lines: [], totalCents: 11400, touristTaxCents: 0, currency: 'EUR' },
    totalCents: 11400,
    paidCents: 0,
    touristTaxCents: 0,
    depositCents: 0,
    paymentKind: 'card',
    locale: 'es',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
    ...over,
  });
}

async function insertGuest(
  bookingId: string,
  guestId: string,
  over: Partial<typeof schema.guests.$inferInsert> = {},
  isLead = true,
) {
  await db.insert(schema.guests).values({
    id: guestId,
    tenantId: T,
    name: 'Ada',
    surname: 'Lovelace',
    secondSurname: 'Byron',
    sex: 'F',
    docType: 'dni',
    docNumber: '12345678Z',
    docSupportNumber: 'BAA123456',
    birthdate: '1990-12-10',
    nationality: 'ES',
    ...over,
  });
  await db.insert(schema.bookingGuests).values({ bookingId, guestId, isLead });
}

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
});

describe('loadHospedajesConfig', () => {
  it('sin módulo configurado → null', async () => {
    expect(await loadHospedajesConfig(db)).toBeNull();
  });

  it('con el módulo activo → la config validada', async () => {
    await enableHospedajes();
    const config = await loadHospedajesConfig(db);
    expect(config?.codigoEstablecimiento).toBe('CE-ALFA');
    expect(config?.establecimiento.cp).toBe('12579');
  });
});

describe('resolveTransport', () => {
  it('sin secrets SES → modo manual, sin credenciales', () => {
    const { transport, creds } = resolveTransport({});
    expect(transport.mode).toBe('manual');
    expect(creds).toBeNull();
  });

  it('con los tres secrets → modo ses con credenciales', () => {
    const { transport, creds } = resolveTransport({
      SES_HOSPEDAJES_ENDPOINT: 'https://ses.example/ws',
      SES_HOSPEDAJES_USER: 'u',
      SES_HOSPEDAJES_PASSWORD: 'p',
    });
    expect(transport.mode).toBe('ses');
    expect(creds?.endpoint).toBe('https://ses.example/ws');
  });
});

describe('buildParteForDate', () => {
  it('sin día con llegadas → empty', async () => {
    await enableHospedajes();
    const r = await buildParteForDate(db, '2026-09-30');
    expect(r.status).toBe('empty');
  });

  it('llegada con huésped completo y forma de pago → ready + XML', async () => {
    await enableHospedajes();
    await insertBooking('bkg_ok');
    await insertGuest('bkg_ok', 'gst_ok');
    const r = await buildParteForDate(db, DATE);
    expect(r.status).toBe('ready');
    if (r.status === 'ready') {
      expect(r.xml).toContain('<referencia>BKG_OK</referencia>');
      expect(r.xml).toContain('codigo="CE-ALFA"');
    }
  });

  it('huésped sin documento → issues, sin XML', async () => {
    await enableHospedajes();
    await insertBooking('bkg_bad', { code: 'BKG_BAD', unitId: 'unt_2' });
    await insertGuest('bkg_bad', 'gst_bad', { docType: null, docNumber: null, docSupportNumber: null });
    const r = await buildParteForDate(db, DATE);
    // el almacenamiento se aísla por test: solo existe esta reserva, con doc incompleto
    expect(r.status).toBe('issues');
    if (r.status === 'issues') {
      expect(r.issues.some((i) => i.guestId === 'gst_bad')).toBe(true);
    }
  });
});
