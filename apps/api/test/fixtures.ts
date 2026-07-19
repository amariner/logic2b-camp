/** Datos mínimos de un tenant para los tests de integración de la API. */
import { createDb, schema } from '@logic-camp/db';

export async function seedTenant(d1: D1Database, slug: string) {
  const db = createDb(d1);
  const T = `ten_${slug}`;

  await db.insert(schema.tenants).values({
    id: T,
    slug,
    name: `Camping ${slug}`,
    tier: 3,
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    locales: ['es', 'en'],
    modules: {
      booking: 'instant',
      notifications: {
        notifyTo: 'recepcion@alfa.test',
        from: `Camping ${slug} <reservas@${slug}.test>`,
      },
    },
  });

  await db.insert(schema.seasonsCalendar).values([
    {
      id: `sea_${slug}_base`,
      tenantId: T,
      name: 'Apertura',
      dateFrom: '2026-03-15',
      dateTo: '2026-11-01',
      priority: 0,
      isOpen: true,
    },
    {
      id: `sea_${slug}_alta`,
      tenantId: T,
      name: 'Alta',
      dateFrom: '2026-07-01',
      dateTo: '2026-08-31',
      priority: 20,
      isOpen: true,
    },
  ]);

  await db.insert(schema.unitTypes).values({
    id: 'ut_std',
    tenantId: T,
    kind: 'pitch',
    nameI18n: { es: 'Parcela Estándar' },
    capacityMin: 1,
    capacityMax: 6,
    includedPersons: 2,
    features: { electricityAmps: 6, pets: true },
    photos: [],
  });

  await db.insert(schema.units).values(
    [1, 2, 3].map((i) => ({
      id: `unt_${i}`,
      tenantId: T,
      unitTypeId: 'ut_std',
      code: `A-0${i}`,
      attributes: {},
      status: 'active' as const,
    })),
  );

  await db.insert(schema.ratePlans).values(
    [
      { seasonId: `sea_${slug}_base`, baseCents: 2000, minStay: 1 },
      { seasonId: `sea_${slug}_alta`, baseCents: 3800, minStay: 3 },
    ].map((p, i) => ({
      id: `rp_${slug}_${i}`,
      tenantId: T,
      unitTypeId: 'ut_std',
      seasonId: p.seasonId,
      baseCents: p.baseCents,
      extraPersonCents: 500,
      childCents: 300,
      petCents: 350,
      electricityCents: 550,
      vehicleCents: 400,
      minStay: p.minStay,
      maxStay: null,
      arrivalDays: null,
      departureDays: null,
    })),
  );

  await db.insert(schema.extras).values({
    id: 'ext_limpieza',
    tenantId: T,
    nameI18n: { es: 'Limpieza final' },
    priceCents: 1500,
    per: 'stay',
    required: true,
  });
}
