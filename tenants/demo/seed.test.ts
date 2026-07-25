import { describe, expect, it } from 'vitest';
import { expandPlano, type PlanoDescriptor } from '@logic-camp/config';
import { generateSeed, nightsBetween, seedToSql } from './seed';

const data = generateSeed(2026);

describe('seed demo Cala Sereno', () => {
  it('es determinista', () => {
    expect(seedToSql(generateSeed(2026))).toBe(seedToSql(data));
  });

  it('tiene el inventario exigido: 60 parcelas, 18 bungalows/mobil, 5 glamping', () => {
    const byKind = (kind: string) =>
      data.units.filter((u) => {
        const t = data.unit_types.find((ut) => ut.id === u.unit_type_id)!;
        return t.kind === kind;
      }).length;
    expect(byKind('pitch')).toBe(60);
    expect(byKind('lodging')).toBe(23); // 18 bungalow/mobil + 5 glamping
    expect(data.units.filter((u) => u.unit_type_id === 'ut_glamp').length).toBe(5);
    expect(data.unit_types.length).toBe(8);
  });

  it('tiene 3 temporadas, 12 extras, ~40 reservas y 15 solicitudes', () => {
    expect(data.seasons_calendar.length).toBe(3);
    expect(data.extras.length).toBe(12);
    expect(data.bookings.length).toBeGreaterThanOrEqual(38);
    expect(data.enquiries.length).toBe(15);
  });

  it('PLANO (C7): modules.plano coloca TODAS las unidades y solo unidades que existen', () => {
    const plano = (data.tenants[0]!.modules as { plano?: PlanoDescriptor }).plano;
    expect(plano).toBeDefined();
    const placed = expandPlano(plano!).rects.map((r) => r.code);
    const real = data.units.map((u) => u.code as string);
    // cada unidad del seed tiene un sitio en el plano
    expect(new Set(placed)).toEqual(new Set(real));
    // sin códigos huérfanos ni duplicados
    expect(placed.length).toBe(real.length);
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('CHECK-IN (ADR 0022): hay huéspedes "en casa" en el ancla, y solo confirmadas', () => {
    const anchor = data.anchor;
    const checkedIn = data.bookings.filter((b) => b.checked_in_at !== null);
    // el planning/plano de la demo tienen que enseñar la mezcla "en casa"
    expect(checkedIn.length).toBeGreaterThan(0);
    // "en casa" solo se estampa sobre confirmadas presentes en el ancla; nadie
    // con check-in ha hecho check-out todavía (seguiría 'confirmed', no completada)
    for (const b of checkedIn) {
      expect(b.status).toBe('confirmed');
      expect(b.checked_out_at).toBeNull();
      expect(b.date_from <= anchor && anchor < b.date_to).toBe(true);
    }
  });

  it('incluye los casos límite: cancelada, no-show, sin asignar, larga estancia, grupo', () => {
    const statuses = data.bookings.map((b) => b.status);
    expect(statuses).toContain('cancelled');
    expect(statuses).toContain('no_show');
    expect(data.bookings.some((b) => b.unit_id === null)).toBe(true);
    expect(data.bookings.some((b) => nightsBetween(b.date_from, b.date_to) >= 14)).toBe(true);
    expect(
      data.bookings.some((b) => {
        const o = b.occupancy as { adults: number; childrenAges: number[] };
        return o.adults + o.childrenAges.length >= 6;
      }),
    ).toBe(true);
  });

  /**
   * SOLICITUDES (sesión 55). El reset nocturno re-siembra con el AÑO EN CURSO
   * (`reset.ts`: `new Date().getUTCFullYear()`), así que la tirada del PRNG
   * cambia cada 1 de enero. Un test que solo mira 2026 comprueba una tirada, no
   * una propiedad: estos corren sobre diez temporadas seguidas.
   */
  describe('SOLICITUDES: la bandeja no puede leerse como generada', () => {
    type Enq = {
      id: string;
      status: string;
      date_from: string | null;
      date_to: string | null;
      created_at: string;
      source: string;
      locale: string;
      message: string;
      unit_type_id: string | null;
      contact: { phone?: string };
      occupancy: { adults: number; childrenAges: number[] } | null;
    };
    const AÑOS = Array.from({ length: 10 }, (_, i) => 2026 + i);
    const porAño = new Map(
      AÑOS.map((y) => [y, generateSeed(y)] as const).map(([y, d]) => [
        y,
        { seed: d, enqs: d.enquiries as unknown as Enq[] },
      ]),
    );
    const cadaAño = (
      fn: (enqs: Enq[], seed: ReturnType<typeof generateSeed>, año: number) => void,
    ) => {
      for (const [año, { seed, enqs }] of porAño) fn(enqs, seed, año);
    };

    /**
     * La invariante de verdad: una solicitud pide una estancia FUTURA. Antes,
     * `date_from` salía de `${Y}-07-01` sin mirar la recepción, y había
     * solicitudes escritas el 15 de julio pidiendo del 3 al 10 de julio.
     */
    it('ninguna pide una estancia anterior a su propia recepción', () => {
      cadaAño((enqs, _s, año) => {
        for (const e of enqs) {
          if (!e.date_from) continue;
          const recibida = e.created_at.slice(0, 10);
          expect(
            e.date_from > recibida,
            `${año}/${e.id}: recibida ${recibida}, estancia ${e.date_from}`,
          ).toBe(true);
          expect(e.date_to! > e.date_from).toBe(true);
        }
      });
    });

    it('llegan escalonadas: nunca todas el mismo día', () => {
      cadaAño((enqs, _s, año) => {
        const dias = new Set(enqs.map((e) => e.created_at.slice(0, 10)));
        expect(dias.size, `${año}: ${dias.size} días distintos`).toBeGreaterThanOrEqual(9);
      });
    });

    it('el estado ordena por edad: lo "nuevo" es más reciente que lo resuelto', () => {
      cadaAño((enqs, _s, año) => {
        const t = (s: string, f: (n: number[]) => number) =>
          f(enqs.filter((e) => e.status === s).map((e) => Date.parse(e.created_at)));
        const min = (n: number[]) => Math.min(...n);
        const max = (n: number[]) => Math.max(...n);
        // ni la más antigua de las nuevas alcanza a la más antigua de las perdidas
        expect(t('new', min), `${año}`).toBeGreaterThan(t('lost', min));
        expect(t('new', max), `${año}`).toBeGreaterThan(t('converted', max));
      });
    });

    /**
     * El acoplamiento que traía el bloque: `source` y "trae fechas" salían los
     * dos de `n % 4`, así que NINGUNA solicitud de teléfono traía fechas y
     * NINGUNA de web las omitía. El test se escribe sobre el síntoma —existe la
     * combinación que era imposible—, no sobre el mecanismo. Y como la mezcla
     * está declarada y no sorteada, esto vale para cualquier temporada.
     */
    it('los rasgos no van atados: hay teléfono con fechas y web sin fechas', () => {
      cadaAño((enqs, _s, año) => {
        expect(
          enqs.some((e) => e.source === 'phone' && e.date_from !== null),
          `${año}`,
        ).toBe(true);
        expect(
          enqs.some((e) => e.source === 'web' && e.date_from === null),
          `${año}`,
        ).toBe(true);
        expect(
          enqs.some((e) => e.source === 'phone' && e.date_from === null),
          `${año}`,
        ).toBe(true);
        // «Cualquiera» también está plantado: la columna Tipo enseña las dos caras
        expect(
          enqs.some((e) => e.unit_type_id === null),
          `${año}`,
        ).toBe(true);
        expect(
          enqs.some((e) => e.unit_type_id !== null),
          `${año}`,
        ).toBe(true);
      });
    });

    /**
     * El otro acoplamiento: `unit_type_id` y los niños salían los dos de `n % 3`,
     * y «sin tipo» implicaba «sin niños», SIEMPRE. Los niños siguen sorteados —no
     * hay nada que la demo necesite garantizar de ellos—, así que este se mira
     * sobre las diez temporadas juntas: si siguieran atados, la combinación no
     * saldría **ninguna** de las 150 veces. Contar en una sola temporada sería
     * otra vez un umbral, y un umbral que se cumple es lo que dejó pasar esto.
     */
    it('el tipo pedido y los niños ya no son el mismo contador', () => {
      const todas = [...porAño.values()].flatMap(({ enqs }) => enqs);
      const con = (tipo: boolean, niños: boolean) =>
        todas.filter(
          (e) =>
            (e.unit_type_id !== null) === tipo &&
            (e.occupancy?.childrenAges.length ?? 0) > 0 === niños,
        ).length;
      for (const tipo of [true, false])
        for (const niños of [true, false])
          expect(con(tipo, niños), `tipo=${tipo} niños=${niños} no sale nunca`).toBeGreaterThan(0);
    });

    it('el teléfono solo entra con recepción abierta', () => {
      cadaAño((enqs, _s, año) => {
        for (const e of enqs) {
          if (e.source !== 'phone') continue;
          const h = Number(e.created_at.slice(11, 13));
          expect(h >= 9 && h < 20, `${año}/${e.id} por teléfono a las ${h}h`).toBe(true);
        }
      });
    });

    it('el tipo solicitado admite a la gente que viene', () => {
      cadaAño((enqs, seed, año) => {
        for (const e of enqs) {
          if (!e.unit_type_id || !e.occupancy) continue;
          const ut = seed.unit_types.find((u) => u.id === e.unit_type_id)!;
          const pax = e.occupancy.adults + e.occupancy.childrenAges.length;
          expect(pax, `${año}/${e.id} pide ${e.unit_type_id} para ${pax} pax`).toBeLessThanOrEqual(
            ut.capacity_max as number,
          );
        }
      });
    });

    it('cada una escribe en su idioma, y el prefijo del teléfono va con él', () => {
      const prefijos: Record<string, string> = {
        es: '+34',
        ca: '+34',
        fr: '+33',
        de: '+49',
        nl: '+31',
        en: '+44',
      };
      cadaAño((enqs, _s, año) => {
        // el mensaje ya no es el mismo párrafo quince veces
        expect(new Set(enqs.map((e) => e.locale)).size, `${año}`).toBeGreaterThanOrEqual(4);
        expect(new Set(enqs.map((e) => e.message)).size, `${año}`).toBeGreaterThanOrEqual(6);
        for (const e of enqs) {
          if (!e.contact.phone) continue;
          expect(
            e.contact.phone.startsWith(prefijos[e.locale]!),
            `${año}/${e.id}: ${e.locale} con ${e.contact.phone}`,
          ).toBe(true);
        }
      });
    });
  });

  it('INVARIANTE: ninguna unidad tiene dos reservas activas solapadas (to exclusive)', () => {
    const active = data.bookings.filter((b) =>
      ['confirmed', 'pending', 'completed'].includes(b.status),
    );
    const byUnit = new Map<string, typeof active>();
    for (const b of active) {
      if (!b.unit_id) continue;
      byUnit.set(b.unit_id, [...(byUnit.get(b.unit_id) ?? []), b]);
    }
    for (const [unit, list] of byUnit) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          const overlap = a.date_from < b.date_to && b.date_from < a.date_to;
          expect(overlap, `solape en ${unit}: ${a.id} vs ${b.id}`).toBe(false);
        }
      }
    }
  });

  it('INVARIANTE: sum(payments.amount_cents) == paid_cents por reserva', () => {
    for (const b of data.bookings) {
      const sum = data.payments
        .filter((p) => p.booking_id === b.id)
        .reduce((s, p) => s + p.amount_cents, 0);
      expect(sum, b.id).toBe(b.paid_cents);
    }
  });

  it('el desglose suma exactamente el total, en céntimos enteros', () => {
    for (const b of data.bookings) {
      const sum = b.price_breakdown.lines.reduce((s, l) => s + l.amountCents, 0);
      expect(sum, b.id).toBe(b.total_cents);
      expect(Number.isInteger(b.total_cents)).toBe(true);
      expect(b.price_breakdown.lines.length).toBeGreaterThan(0);
    }
  });

  it('reserva que cruza temporadas tiene el precio por tramos', () => {
    const cross = data.bookings.find(
      (b) => b.date_from < '2026-07-01' && b.date_to > '2026-07-01',
    )!;
    const baseSeasons = cross.price_breakdown.lines
      .filter((l) => l.concept === 'price.base')
      .map((l) => l.detail.season);
    expect(new Set(baseSeasons).size).toBeGreaterThan(1);
  });

  it('los niños <16 no pagan tasa turística pero cuentan para capacidad', () => {
    const fam = data.bookings.find((b) => b.notes?.toString().includes('exento'))!;
    const occ = fam.occupancy as { adults: number; childrenAges: number[] };
    const nights = nightsBetween(fam.date_from, fam.date_to);
    const taxable = occ.adults + occ.childrenAges.filter((a) => a >= 16).length;
    expect(fam.tourist_tax_cents).toBe(taxable * 100 * nights);
    expect(taxable).toBeLessThan(occ.adults + occ.childrenAges.length);
  });

  /* La lista de clientes es una pantalla de la demo comercial: si el generador
     acopla nombre y apellido al mismo índice, salen 20 personas repetidas ~100
     veces seguidas (y 20 correos para todos los clientes), que es exactamente
     lo que se veía hasta la sesión 53. Se fija aquí porque el síntoma no lo
     nota ningún test de invariantes: los datos son "válidos", solo son falsos. */
  it('no hay dos clientes que se llamen igual', () => {
    // Garantía por construcción, no estadística: el generador recorre las
    // 40 × 161 parejas a saltos coprimos con el total (sesión 54). Si alguien
    // cambia el tamaño de una lista o el salto y pierde la coprimalidad, el
    // recorrido empieza a repetir parejas y este test cae.
    const nombres = data.guests.map((g) => `${g.name} ${g.surname}`);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('la primera página de /clientes no es un bloque del mismo apellido', () => {
    // Se ordena igual que la API (apellido, luego nombre). Con 40 apellidos para
    // ~1 500 fichas tocaban a 38 por apellido y la primera página salía entera
    // "Andersen" — el mismo defecto de las 20 personas repetidas, en la columna
    // de al lado.
    const pagina = [...data.guests]
      .sort(
        (a, b) =>
          String(a.surname).localeCompare(String(b.surname)) ||
          String(a.name).localeCompare(String(b.name)),
      )
      .slice(0, 25);
    expect(new Set(pagina.map((g) => g.surname)).size).toBeGreaterThanOrEqual(3);
  });

  it('el sexo concuerda con el nombre (el parte de viajeros es un documento legal)', () => {
    const femeninos = new Set(['María', 'Sophie', 'Emma', 'Carmen', 'Julia', 'Sara', 'Eva']);
    const masculinos = new Set(['Jan', 'Pierre', 'Tom', 'Lars', 'David', 'Marc', 'Hugo']);
    for (const g of data.guests) {
      if (femeninos.has(String(g.name))) expect(g.sex, String(g.name)).toBe('F');
      if (masculinos.has(String(g.name))) expect(g.sex, String(g.name)).toBe('M');
    }
    // …y ambos sexos aparecen: un mapa vacío también pasaría las dos vueltas.
    expect(new Set(data.guests.map((g) => g.sex))).toEqual(new Set(['F', 'M']));
  });

  /* La pantalla de clientes vende UNA cosa: la memoria comercial del camping —
     quién ha estado antes y cuántas veces. Hasta la sesión 54 el generador creaba
     un huésped nuevo por reserva, así que la columna "Reservas" valía 1 en las
     2 000 fichas y el historial de la ficha tenía siempre una sola estancia: la
     demo enseñaba la pantalla sin enseñar nunca lo que la justifica. */
  describe('huéspedes que repiten (la memoria comercial)', () => {
    const estanciasPorFicha = () => {
      const porFicha = new Map<string, string[]>();
      for (const l of data.booking_guests) {
        const gid = l.guest_id as string;
        porFicha.set(gid, [...(porFicha.get(gid) ?? []), l.booking_id as string]);
      }
      return porFicha;
    };

    it('una parte de las fichas tiene varias estancias, y no todas las mismas', () => {
      const cuentas = [...estanciasPorFicha().values()].map((b) => b.length);
      const repiten = cuentas.filter((n) => n > 1);
      // que repita alguien no basta: tiene que verse al abrir la lista
      expect(repiten.length).toBeGreaterThan(cuentas.length / 10);
      // …y con formas distintas. Si todos los que vuelven tuvieran el mismo
      // número de estancias, la lista se delataría igual que con "todos 1".
      expect(new Set(repiten).size).toBeGreaterThanOrEqual(3);
      // pero la mayoría de la gente va a un camping una vez: si repitiera casi
      // todo el mundo, el dato dejaría de significar nada
      expect(cuentas.filter((n) => n === 1).length).toBeGreaterThan(cuentas.length / 2);
    });

    it('nadie está en dos sitios a la vez: sin estancias solapadas ni pegadas', () => {
      const porId = new Map(data.bookings.map((b) => [b.id, b]));
      for (const [gid, ids] of estanciasPorFicha()) {
        const estancias = ids
          .map((id) => porId.get(id)!)
          .sort((a, b) => (a.date_from < b.date_from ? -1 : 1));
        for (let i = 1; i < estancias.length; i++) {
          const previa = estancias[i - 1]!;
          const actual = estancias[i]!;
          // Holgura, no solo ausencia de solape: salir el 9 y volver a entrar el
          // 10 se lee como un fallo de datos, no como un cliente que vuelve.
          expect(nightsBetween(previa.date_to, actual.date_from), gid).toBeGreaterThanOrEqual(7);
        }
      }
    });

    it('cada ficha tiene su propio correo (dos fichas con el mismo son un duplicado)', () => {
      const correos = data.guests.map((g) => g.email);
      expect(new Set(correos).size).toBe(correos.length);
    });

    it('el idioma de la reserva concuerda con la nacionalidad del titular', () => {
      const porId = new Map(data.guests.map((g) => [g.id, g]));
      const porReserva = new Map(data.bookings.map((b) => [b.id, b]));
      for (const l of data.booking_guests) {
        const b = porReserva.get(l.booking_id as string)!;
        const g = porId.get(l.guest_id as string)!;
        const locale = String(b.locale);
        const esperada = locale === 'es' || locale === 'ca' ? 'ES' : locale.toUpperCase();
        expect(g.nationality, `${b.id} / ${g.id}`).toBe(esperada);
      }
    });
  });

  it('el SQL generado no contiene undefined ni NaN', () => {
    const sql = seedToSql(data);
    expect(sql).not.toMatch(/undefined|NaN/);
  });
});
