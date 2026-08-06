import { describe, expect, it } from 'vitest';
import { expandPlano, type PlanoDescriptor } from '@logic-camp/config';
import { generateSeed, nightsBetween, seedToSql } from './seed';

/** Ancla de referencia: el 15 de julio que fue ancla FIJA hasta ADR 0030. */
const ANCLA = '2026-07-15';
const data = generateSeed(ANCLA);

/**
 * Muestra de anclas (ADR 0030). Desde que el "hoy" del seed es el día real,
 * **el ancla es una variable de entrada**: un test sobre una fecha comprueba una
 * tirada, no una propiedad — la lección de las sesiones 54-56, aquí en su forma
 * literal. La muestra recorre los doce meses (el defecto que se arregla era
 * justamente estacional: fuera de abril-octubre no había nada sembrado), los
 * bordes duros del calendario (1 de enero, 31 de diciembre, 29 de febrero) y
 * **diez temporadas seguidas**, porque el reset re-siembra con el año en curso y
 * el PRNG cambia cada 1 de enero.
 */
const ANCLAS = [
  '2026-01-15',
  '2026-02-03',
  '2026-03-08',
  '2026-04-22',
  '2026-05-30',
  '2026-06-11',
  '2026-07-27',
  '2026-08-10',
  '2026-09-14',
  '2026-10-20',
  '2026-11-03',
  '2026-12-28',
  '2027-01-01',
  '2027-06-18',
  '2028-02-29',
  '2028-12-31',
  '2029-04-05',
  '2030-07-15',
  '2031-09-23',
  '2032-05-01',
  '2033-11-11',
  '2034-03-17',
  '2035-08-24',
];
/** Se genera UNA vez y la comparten las tres baterías que barren anclas. */
const MUESTRA = ANCLAS.map((anchor) => ({ anchor, seed: generateSeed(anchor) }));

describe('seed demo Cala Sereno', () => {
  it('es determinista', () => {
    expect(seedToSql(generateSeed(ANCLA))).toBe(seedToSql(data));
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

  it('siembra dos unidades fuera de servicio sin asignarles reservas', () => {
    for (const { anchor, seed } of MUESTRA) {
      const inactivas = seed.units.filter((u) => u.status === 'inactive');
      expect(inactivas.map((u) => u.code).sort(), anchor).toEqual(['C-10', 'MH-04']);
      const ids = new Set(inactivas.map((u) => u.id));
      expect(
        seed.bookings.some((b) => b.unit_id && ids.has(b.unit_id)),
        anchor,
      ).toBe(false);
    }
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

  /**
   * EL ANCLA MÓVIL (ADR 0030, sesión 57). El seed tenía un "hoy" —el 15 de
   * julio— y el dashboard tenía otro —el día real del navegador—, y las dos
   * líneas solo coincidían un día al año. Medido en la sesión 56: el botón de
   * check-out **no aparecía nunca, ningún día**, y fuera de abril-octubre la
   * pantalla de la operación diaria salía vacía.
   *
   * Toda esta batería se juzga sobre la MUESTRA de anclas, nunca sobre una
   * fecha: el defecto que arregla era estacional, así que un test estacional lo
   * habría dejado pasar exactamente igual que lo dejó pasar la aplicación.
   */
  describe('EL ANCLA MÓVIL: el "hoy" del seed es el día real', () => {
    type Bkg = (typeof data)['bookings'][number];
    const viva = (b: Bkg) => b.status !== 'cancelled' && b.status !== 'no_show';
    const enCasa = (b: Bkg) =>
      b.status === 'confirmed' && b.checked_in_at !== null && b.checked_out_at === null;
    const cada = (fn: (bkgs: Bkg[], anchor: string) => void) => {
      for (const { anchor, seed } of MUESTRA) fn(seed.bookings, anchor);
    };

    it('el ancla es exactamente el día que se le pasa', () => {
      for (const { anchor, seed } of MUESTRA) expect(seed.anchor).toBe(anchor);
    });

    it('cualquier día del año tiene llegadas y salidas', () => {
      cada((bkgs, a) => {
        const lleg = bkgs.filter((b) => b.date_from === a && viva(b));
        const sal = bkgs.filter((b) => b.date_to === a && viva(b));
        expect(lleg.length, `${a}: ${lleg.length} llegadas`).toBeGreaterThanOrEqual(3);
        expect(sal.length, `${a}: ${sal.length} salidas`).toBeGreaterThanOrEqual(3);
      });
    });

    /** El defecto de la sesión 56, escrito como test: el gesto tiene que existir. */
    it('cualquier día del año se puede CERRAR una salida (el botón de check-out)', () => {
      cada((bkgs, a) => {
        const conGesto = bkgs.filter((b) => b.date_to === a && enCasa(b));
        expect(conGesto.length, `${a}: ninguna salida ofrece check-out`).toBeGreaterThanOrEqual(2);
      });
    });

    it('cualquier día del año se puede REGISTRAR una llegada', () => {
      cada((bkgs, a) => {
        const conGesto = bkgs.filter(
          (b) => b.date_from === a && b.status === 'confirmed' && b.checked_in_at === null,
        );
        expect(conGesto.length, `${a}: ninguna llegada por registrar`).toBeGreaterThanOrEqual(2);
      });
    });

    it('cualquier día del año hay gente en casa (planning y plano no salen vacíos)', () => {
      cada((bkgs, a) => {
        const dentro = bkgs.filter(enCasa);
        expect(dentro.length, `${a}: ${dentro.length} en casa`).toBeGreaterThanOrEqual(5);
      });
    });

    it('hay pasado Y futuro: ni la demo empieza hoy ni se acaba hoy', () => {
      cada((bkgs, a) => {
        expect(bkgs.filter((b) => b.date_to < a).length, `${a}: sin histórico`).toBeGreaterThan(20);
        expect(bkgs.filter((b) => b.date_from > a).length, `${a}: sin futuro`).toBeGreaterThan(0);
      });
    });

    it('el año entero está sembrado: los doce meses tienen llegadas', () => {
      for (const { anchor, seed } of MUESTRA) {
        const meses = new Set(
          seed.bookings
            .filter((b) => b.date_from.startsWith(anchor.slice(0, 4)))
            .map((b) => b.date_from.slice(5, 7)),
        );
        expect(meses.size, `${anchor}: solo ${meses.size} meses con llegadas`).toBe(12);
      }
    });

    /**
     * Coherencia de los sellos con la línea temporal. Sin esto se cuelan los
     * datos "válidos y falsos" de siempre: un huésped registrado en una estancia
     * que aún no ha empezado, o un check-out sin check-in.
     */
    it('los sellos del mostrador no contradicen al calendario', () => {
      cada((bkgs, a) => {
        for (const b of bkgs) {
          if (b.checked_out_at) {
            expect(b.checked_in_at, `${a}/${b.id}: salió sin haber entrado`).not.toBeNull();
            expect(b.date_to <= a, `${a}/${b.id}: salió antes de irse`).toBe(true);
            expect(b.status, `${a}/${b.id}`).toBe('completed');
          }
          if (b.checked_in_at) {
            expect(b.date_from <= a, `${a}/${b.id}: registrado antes de llegar`).toBe(true);
            expect(['confirmed', 'completed']).toContain(b.status);
          }
          // nada que ya terminó puede seguir "confirmado": es la lista de
          // salidas de ayer que nadie cerró
          if (b.date_to < a && viva(b)) expect(b.status, `${a}/${b.id}`).toBe('completed');
        }
      });
    });

    it('el histórico dice que aquella gente llegó a entrar', () => {
      cada((bkgs, a) => {
        const pasadas = bkgs.filter((b) => b.date_to < a && b.status === 'completed');
        expect(pasadas.length, `${a}`).toBeGreaterThan(20);
        for (const b of pasadas) {
          expect(b.checked_in_at, `${a}/${b.id} sin check-in`).not.toBeNull();
          expect(b.checked_out_at, `${a}/${b.id} sin check-out`).not.toBeNull();
        }
      });
    });

    /**
     * La otra mitad de ADR 0030: el PRNG se siembra con el AÑO, no con el día.
     * Si colgara del ancla completa, la demo se reorganizaría entera cada
     * madrugada y el `CS-2026-0412` que un comercial enseñó ayer sería hoy otra
     * cosa. Lo que se mueve es la línea de HOY, no el camping.
     */
    it('el camping es el mismo todos los días del año: solo se mueve la línea de HOY', () => {
      const delMismoAño = (año: string) => MUESTRA.filter((m) => m.anchor.startsWith(año));
      const huella = (s: (typeof MUESTRA)[number]['seed']) =>
        s.bookings
          .filter((b) => !b.notes?.toString().startsWith('Salida de hoy'))
          .filter((b) => !b.notes?.toString().startsWith('Llegada de hoy'))
          .filter((b) => !b.notes?.toString().startsWith('Sin unidad'))
          .map((b) => `${b.date_from}|${b.date_to}|${b.unit_id}`)
          .join('\n');
      const doceMeses = delMismoAño('2026');
      expect(doceMeses.length).toBe(12); // la muestra recorre el año entero
      const base = huella(doceMeses[0]!.seed);
      for (const m of doceMeses.slice(1))
        expect(huella(m.seed), `${m.anchor} reparte la temporada de otra forma`).toBe(base);
    });

    /**
     * La reserva sin unidad llena la bandeja "sin asignar" del planning (ADR
     * 0023): es una TAREA del mostrador. Clavada en agosto como estaba, once
     * meses al año era historia — nadie asigna unidad a una estancia que ya
     * terminó, así que la bandeja enseñaba una tarea imposible.
     */
    it('la reserva sin unidad asignada es una TAREA, no historia', () => {
      cada((bkgs, a) => {
        const tarea = bkgs.filter((b) => b.notes?.toString().startsWith('Sin unidad asignada'));
        expect(tarea.length, `${a}`).toBe(1);
        expect(tarea[0]!.unit_id).toBeNull();
        expect(tarea[0]!.date_from > a, `${a}: sin asignar y ya terminó`).toBe(true);
      });
    });

    it('las llegadas de hoy no vienen todas pagadas ni todas debiendo', () => {
      const hoy = MUESTRA.flatMap(({ anchor, seed }) =>
        seed.bookings.filter((b) => b.date_from === anchor && b.status === 'confirmed'),
      );
      expect(hoy.filter((b) => b.paid_cents >= b.total_cents).length).toBeGreaterThan(0);
      expect(hoy.filter((b) => b.paid_cents < b.total_cents).length).toBeGreaterThan(0);
    });
  });

  /**
   * SALDO (sesión 56). La columna de la derecha de `/llegadas` decía
   * «Pendiente: …» en las veinte filas del día y nunca «Pagada»: todas las
   * confirmadas se sembraban con el mismo 30 %. Dato válido y falso a la vez,
   * la tercera vez que aparece el patrón (53: 2 032 fichas que eran 20
   * personas; 55: quince solicitudes recibidas el mismo día).
   *
   * Se comprueba sobre diez temporadas seguidas por lo de siempre: el reset
   * nocturno re-siembra con el año en curso, así que un test sobre 2026
   * comprueba una tirada, no una propiedad.
   */
  describe('SALDO: lo cobrado no puede ser una constante', () => {
    type Bkg = {
      id: string;
      status: string;
      channel: string;
      date_from: string;
      date_to: string;
      total_cents: number;
      paid_cents: number;
      payment_kind: string | null;
      checked_in_at: string | null;
    };
    const porAño = MUESTRA.map(({ anchor, seed }) => ({
      año: anchor,
      anchor,
      bkgs: seed.bookings as unknown as Bkg[],
    }));
    /** confirmadas que en el ancla todavía no han empezado: las que se ven llegar */
    const futuras = (b: Bkg[], anchor: string) =>
      b.filter((x) => x.status === 'confirmed' && x.date_from > anchor);

    it('las dos palabras salen: hay llegadas pagadas y llegadas con saldo', () => {
      for (const { año, anchor, bkgs } of porAño) {
        const f = futuras(bkgs, anchor);
        const pagadas = f.filter((b) => b.paid_cents >= b.total_cents);
        const conSaldo = f.filter((b) => b.paid_cents < b.total_cents);
        expect(pagadas.length, `${año}: ninguna llegada pagada de ${f.length}`).toBeGreaterThan(0);
        expect(conSaldo.length, `${año}: ninguna llegada con saldo`).toBeGreaterThan(0);
        // y ninguna de las dos es una anécdota de una fila suelta
        const ratio = pagadas.length / f.length;
        expect(ratio, `${año}: ${Math.round(ratio * 100)}% pagadas`).toBeGreaterThan(0.1);
        expect(ratio).toBeLessThan(0.6);
      }
    });

    it('nadie pasa la estancia dentro debiendo: lo ya empezado está liquidado', () => {
      for (const { año, anchor, bkgs } of porAño) {
        for (const b of bkgs) {
          const activa = b.status === 'confirmed' || b.status === 'completed';
          // `>=`, no `>`: quien entra HOY todavía no ha pasado por el mostrador
          // — el saldo que se le cobra al registrar la llegada es justo lo que
          // la pantalla de Llegadas existe para enseñar (ADR 0030).
          if (!activa || b.date_from >= anchor) continue;
          expect(
            b.paid_cents,
            `${año}/${b.id}: entró el ${b.date_from} y debe ${b.total_cents - b.paid_cents}`,
          ).toBe(b.total_cents);
        }
      }
    });

    it('el canal manda: quien llega a mostrador no ha pagado por adelantado', () => {
      for (const { año, anchor, bkgs } of porAño) {
        const mostrador = futuras(bkgs, anchor).filter((b) => b.channel === 'walkin');
        expect(mostrador.length, `${año}: sin reservas de mostrador`).toBeGreaterThan(0);
        for (const b of mostrador) expect(b.paid_cents, `${año}/${b.id}`).toBe(0);
      }
    });

    it('nunca se cobra de más, ni en negativo', () => {
      for (const { año, bkgs } of porAño) {
        for (const b of bkgs) {
          expect(b.paid_cents, `${año}/${b.id}`).toBeGreaterThanOrEqual(0);
          expect(b.paid_cents, `${año}/${b.id}`).toBeLessThanOrEqual(b.total_cents);
          expect(Number.isInteger(b.paid_cents)).toBe(true);
        }
      }
    });

    /**
     * El saldo NO puede colgar del mismo contador que el medio de pago ni que el
     * idioma (ambos cuelgan de `bkgN`): si colgara, la ficha diría cosas atadas
     * entre sí —"todas las de tarjeta van pagadas"— y eso se lee como generado.
     * Por eso sale de un PRNG propio; esto lo comprueba desde fuera.
     */
    it('el saldo no va atado al medio de pago', () => {
      for (const { año, anchor, bkgs } of porAño) {
        for (const kind of ['card', 'cash', 'transfer', 'platform']) {
          const delKind = futuras(bkgs, anchor).filter((b) => b.payment_kind === kind);
          if (delKind.length < 4) continue;
          const pagadas = delKind.filter((b) => b.paid_cents >= b.total_cents).length;
          expect(
            pagadas,
            `${año}/${kind}: ${pagadas} de ${delKind.length} pagadas`,
          ).toBeGreaterThan(0);
          expect(pagadas).toBeLessThan(delKind.length);
        }
      }
    });
  });

  /**
   * ANTIGÜEDAD DE RESERVA. Hasta la sesión 78 todas las reservas nacían en
   * `anchor`, incluso las estancias terminadas muchos meses antes. El dato era
   * válido para SQLite pero imposible para un camping y dejaba cualquier
   * lectura por fecha de alta sin historia.
   */
  describe('CREATED_AT: la fecha de alta cuenta una historia posible', () => {
    type Bkg = {
      id: string;
      channel: string;
      date_from: string;
      created_at: string;
      updated_at: string;
    };

    const diasEntre = (from: string, to: string) =>
      Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

    const mediana = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)]!;
    };

    it('ninguna reserva se crea después de la llegada ni en el futuro del seed', () => {
      for (const { anchor, seed } of MUESTRA) {
        for (const booking of seed.bookings as unknown as Bkg[]) {
          const creada = booking.created_at.slice(0, 10);
          expect(creada <= booking.date_from, `${anchor}/${booking.id}: alta tras llegada`).toBe(
            true,
          );
          expect(creada <= anchor, `${anchor}/${booking.id}: alta futura`).toBe(true);
          expect(
            booking.updated_at >= booking.created_at,
            `${anchor}/${booking.id}: actualizada antes de existir`,
          ).toBe(true);
        }
      }
    });

    it('la web se reserva con más antelación que el teléfono', () => {
      for (const { anchor, seed } of MUESTRA) {
        const bookings = seed.bookings as unknown as Bkg[];
        const anticipacion = (channel: string) =>
          bookings
            .filter((b) => b.channel === channel)
            .map((b) => diasEntre(b.created_at.slice(0, 10), b.date_from));
        const web = anticipacion('web');
        const phone = anticipacion('phone');
        expect(web.length, `${anchor}: sin muestra web`).toBeGreaterThan(20);
        expect(phone.length, `${anchor}: sin muestra teléfono`).toBeGreaterThan(20);
        expect(mediana(web), `${anchor}: web sin antelación reconocible`).toBeGreaterThanOrEqual(
          30,
        );
        expect(mediana(web), `${anchor}: web no adelanta al teléfono`).toBeGreaterThan(
          mediana(phone),
        );
      }
    });

    it('el mostrador queda pegado a la llegada, no meses antes', () => {
      for (const { anchor, seed } of MUESTRA) {
        const walkins = (seed.bookings as unknown as Bkg[]).filter((b) => b.channel === 'walkin');
        expect(walkins.length, `${anchor}: sin muestra de mostrador`).toBeGreaterThan(20);
        for (const booking of walkins) {
          const creada = booking.created_at.slice(0, 10);
          const anticipacion = diasEntre(creada, booking.date_from);
          if (booking.date_from <= anchor) expect(anticipacion, `${anchor}/${booking.id}`).toBe(0);
          else expect(diasEntre(creada, anchor), `${anchor}/${booking.id}`).toBeLessThanOrEqual(2);
        }
      }
    });

    it('el histórico no nace entero el día del reset', () => {
      for (const { anchor, seed } of MUESTRA) {
        const fechas = new Set(
          (seed.bookings as unknown as Bkg[]).map((b) => b.created_at.slice(0, 10)),
        );
        expect(fechas.size, `${anchor}: solo ${fechas.size} fechas de alta`).toBeGreaterThan(180);
      }
    });
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
    const porAño = new Map(
      MUESTRA.map(({ anchor, seed }) => [
        anchor,
        { seed, enqs: seed.enquiries as unknown as Enq[] },
      ]),
    );
    const cadaAño = (
      fn: (enqs: Enq[], seed: ReturnType<typeof generateSeed>, año: string) => void,
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
    // Garantía por construcción, no estadística: cada apellido tiene como
    // máximo 40 plazas y sus nombres se recorren sin repetir. Se barre la
    // muestra temporal porque el censo cambia con el ancla móvil.
    for (const { anchor, seed } of MUESTRA) {
      const nombres = seed.guests.map((g) => `${g.name} ${g.surname}`);
      expect(new Set(nombres).size, anchor).toBe(nombres.length);
    }
  });

  it('la primera página de /clientes refleja una cola larga de apellidos', () => {
    // La API ordena por apellido y luego nombre. La población real no reparte
    // los apellidos a partes iguales: unos pocos son frecuentes y hay una cola
    // larga de apellidos poco comunes. El seed debe conservar esa lectura sin
    // repetir una misma persona ni volver a enseñar once "Aalto" seguidos.
    for (const { anchor, seed } of MUESTRA) {
      const pagina = [...seed.guests]
        .sort(
          (a, b) =>
            String(a.surname).localeCompare(String(b.surname)) ||
            String(a.name).localeCompare(String(b.name)),
        )
        .slice(0, 25);
      const apellidos = pagina.map((g) => String(g.surname));
      const repeticiones = [...new Set(apellidos)].map(
        (apellido) => apellidos.filter((a) => a === apellido).length,
      );
      expect(new Set(apellidos).size, anchor).toBeGreaterThanOrEqual(7);
      expect(Math.max(...repeticiones), anchor).toBeLessThanOrEqual(4);

      const frecuencias = new Map<string, number>();
      for (const guest of seed.guests)
        frecuencias.set(String(guest.surname), (frecuencias.get(String(guest.surname)) ?? 0) + 1);
      expect(Math.max(...frecuencias.values()), anchor).toBeGreaterThanOrEqual(25);
      expect(Math.min(...frecuencias.values()), anchor).toBeLessThanOrEqual(4);
    }
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
