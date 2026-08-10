/**
 * Orquestación del parte de viajeros (ADR 0028): el ÚNICO sitio que junta lo que
 * `apps/api` lee de D1 con el motor puro `@logic-camp/hospedajes`. Mismo patrón que
 * `payments.ts`: lee la config del tenant de `modules.hospedajes`, resuelve el
 * transporte local seguro y deja el cálculo (validar + serializar) al paquete
 * puro. No decide nada de negocio que no esté ya en el paquete.
 */
import { tenantHospedajesSchema, type TenantHospedajes } from '@logic-camp/config';
import { schema, type Db } from '@logic-camp/db';
import {
  buildParte,
  manualTransport,
  serializeParte,
  type Establecimiento,
  type HospedajesTransport,
  type ParteEstancia,
  type ParteHuesped,
} from '@logic-camp/hospedajes';
import { and, eq, inArray } from 'drizzle-orm';
import type { Bindings } from './tenant';

/** Variables reservadas de SES; no activan red mientras el contrato siga gated. */
export type HospedajesEnv = Pick<
  Bindings,
  'SES_HOSPEDAJES_ENDPOINT' | 'SES_HOSPEDAJES_USER' | 'SES_HOSPEDAJES_PASSWORD'
>;

/** Config del módulo, o `null` si el tenant no lo tiene activo o está mal formado. */
export async function loadHospedajesConfig(db: Db): Promise<TenantHospedajes | null> {
  const row = (await db.select().from(schema.tenants))[0];
  const raw = (row?.modules as Record<string, unknown> | undefined)?.hospedajes;
  const parsed = tenantHospedajesSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.enabled) return null;
  return parsed.data;
}

/**
 * La especificación técnica se obtiene únicamente dentro del área autenticada de
 * una entidad. Las credenciales por sí solas nunca activan un contrato inferido:
 * hasta importar y verificar esa documentación, el resultado es siempre manual.
 */
export function resolveTransport(env: HospedajesEnv): {
  transport: HospedajesTransport;
  creds: null;
} {
  void env;
  return { transport: manualTransport(), creds: null };
}

function establecimientoDe(config: TenantHospedajes): Establecimiento {
  return { codigo: config.codigoEstablecimiento, ...config.establecimiento };
}

/**
 * Estancias que hay que comunicar en `date`: las LLEGADAS del día (date_from == date)
 * confirmadas, con sus huéspedes. Es el corte natural del parte de entrada — el mismo
 * "quién llega hoy" de la pantalla de Llegadas.
 */
export async function gatherEstancias(db: Db, date: string): Promise<ParteEstancia[]> {
  const bookings = await db
    .select()
    .from(schema.bookings)
    .where(and(eq(schema.bookings.dateFrom, date), eq(schema.bookings.status, 'confirmed')));
  if (bookings.length === 0) return [];

  const bookingIds = bookings.map((b) => b.id);
  const links = await db
    .select()
    .from(schema.bookingGuests)
    .where(inArray(schema.bookingGuests.bookingId, bookingIds));
  const guestIds = [...new Set(links.map((l) => l.guestId))];
  const guests = guestIds.length
    ? await db.select().from(schema.guests).where(inArray(schema.guests.id, guestIds))
    : [];
  const guestById = new Map(guests.map((g) => [g.id, g]));

  return bookings.map((b) => {
    const huespedes: ParteHuesped[] = links
      .filter((l) => l.bookingId === b.id)
      .map((l) => {
        const g = guestById.get(l.guestId);
        return g ? guestToParte(g, l.isLead) : null;
      })
      .filter((g): g is ParteHuesped => g !== null);
    return {
      bookingId: b.id,
      bookingCode: b.code,
      dateFrom: b.dateFrom,
      dateTo: b.dateTo,
      checkedInAt: b.checkedInAt,
      paymentKind: b.paymentKind,
      huespedes,
    };
  });
}

function guestToParte(g: typeof schema.guests.$inferSelect, isLead: boolean): ParteHuesped {
  return {
    guestId: g.id,
    name: g.name,
    surname: g.surname,
    secondSurname: g.secondSurname,
    sex: g.sex,
    docType: g.docType,
    docNumber: g.docNumber,
    docSupportNumber: g.docSupportNumber,
    birthdate: g.birthdate,
    nationality: g.nationality,
    kinship: g.kinship,
    address: g.address,
    phone: g.phone,
    email: g.email,
    isLead,
  };
}

/**
 * Reúne, valida y (si todo está) serializa el parte de un día. Devuelve un
 * resultado discriminado que la ruta traduce a HTTP y el dashboard a pantalla.
 */
export async function buildParteForDate(
  db: Db,
  date: string,
): Promise<
  | { status: 'disabled' }
  | { status: 'empty'; date: string; estancias: ParteEstancia[] }
  | {
      status: 'issues';
      date: string;
      estancias: ParteEstancia[];
      issues: Extract<ReturnType<typeof buildParte>, { ok: false }>['issues'];
    }
  | { status: 'ready'; date: string; estancias: ParteEstancia[]; xml: string }
> {
  const config = await loadHospedajesConfig(db);
  if (!config) return { status: 'disabled' };

  const estancias = await gatherEstancias(db, date);
  if (estancias.length === 0) return { status: 'empty', date, estancias };

  const built = buildParte(establecimientoDe(config), estancias);
  if (!built.ok) return { status: 'issues', date, estancias, issues: built.issues };

  return { status: 'ready', date, estancias, xml: serializeParte(built.payload) };
}
