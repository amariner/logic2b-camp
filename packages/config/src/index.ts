/**
 * Config de tenant que consume la web pública (Fase 4) en BUILD time.
 * El `TenantConfig` de request time (política de tasa/cancelación — pagos y
 * notificaciones se quedan en sus paquetes, ver ADR 0012) vive en
 * `./tenant-config` y lo consume `apps/api`.
 */

import { z } from 'zod';
import { tenantLegalSchema } from './tenant-config';

export type BookingMode = 'none' | 'enquiry' | 'instant';
export type EnquiryTransport = 'persisted' | 'demo' | 'demo-session';
export type BookingTransport = 'persisted' | 'demo-session';

const localeSchema = z.string().trim().min(2, 'debe ser un locale no vacío');
const demoThemeSchema = z.string().trim().min(1, 'el tema no puede estar vacío');
export const tenantTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const tenantWebConfigSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'debe ser un slug seguro'),
    name: z.string().trim().min(1),
    /** 1 Camp Web · 2 Solicitudes · 3 Reservas · 4 Motor (no construir) */
    tier: tenantTierSchema,
    locales: z.array(localeSchema).min(1),
    defaultLocale: localeSchema,
    domain: z.string().url(),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().trim().min(1),
      address: z.string().trim().min(1),
    }),
    /**
     * Destino del formulario público. Ausente equivale a `persisted` para no
     * cambiar tenants existentes. `demo` nunca hace red ni conserva datos;
     * `demo-session` guarda ficción reversible solo en el navegador.
     */
    enquiryTransport: z.enum(['persisted', 'demo', 'demo-session']).optional(),
    /**
     * Transporte del motor público. Ausente equivale a `persisted`.
     * `demo-session` intercepta solo `/api/*` del funnel en el navegador,
     * conserva ficción reversible y nunca toca un proveedor ni una D1.
     */
    bookingTransport: z.enum(['persisted', 'demo-session']).optional(),
    /** Ruta del gestor de escenario; solo se usa con `demo-session`. */
    demoManagerPath: z
      .string()
      .regex(/^\/.*\/$/, 'debe ser una ruta absoluta terminada en /')
      .optional(),
    /** Foto de héroe del carril estático; por defecto conserva `hero-anochecer`. */
    staticHeroImage: z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]*$/)
      .optional(),
    /**
     * Identidad legal del titular (ADR 0026 §2.5). Obligatorio: un camping español
     * no puede publicar sin aviso legal, y sin estos datos las páginas legales no
     * se pueden generar. El texto es de producto; esto es lo único que varía.
     */
    legal: tenantLegalSchema,
    /**
     * SOLO demo comercial (ADR 0009): temas alternativos seleccionables en vivo.
     * El primero es el de defecto. Sin este campo, el selector no se renderiza.
     */
    demoThemes: z.array(demoThemeSchema).min(1).optional(),
    /**
     * SOLO demo comercial (ADR 0013): banner "entorno de demostración" en
     * todas las páginas. Un camping real nunca define esto — ni el nodo se
     * genera en su HTML.
     */
    isDemo: z.boolean().optional(),
    /**
     * SOLO demo comercial (ADR 0013): interruptor nivel 1/3 en vivo (atrezzo,
     * NO un segundo build — el motor sigue en el bundle debajo). Sin este
     * campo, la home renderiza un único héroe según el `tier` de build, como
     * siempre.
     */
    demoTierSwitch: z.boolean().optional(),
  })
  .strict()
  .superRefine((config, ctx) => {
    if (!config.locales.includes(config.defaultLocale)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultLocale'],
        message: 'debe estar incluido en locales',
      });
    }

    const demoOnlyFields = [
      config.enquiryTransport === 'demo' || config.enquiryTransport === 'demo-session'
        ? 'enquiryTransport'
        : null,
      config.bookingTransport === 'demo-session' ? 'bookingTransport' : null,
      config.demoManagerPath ? 'demoManagerPath' : null,
      config.demoThemes ? 'demoThemes' : null,
      config.demoTierSwitch === true ? 'demoTierSwitch' : null,
    ].filter((field): field is string => field !== null);

    if (config.isDemo !== true && demoOnlyFields.length > 0) {
      for (const field of demoOnlyFields) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'es exclusivo de una config con isDemo: true',
        });
      }
    }

    const usesSession =
      config.enquiryTransport === 'demo-session' || config.bookingTransport === 'demo-session';
    if (usesSession && !config.demoManagerPath) {
      ctx.addIssue({
        code: 'custom',
        path: ['demoManagerPath'],
        message: 'es obligatorio cuando el transporte es demo-session',
      });
    }
    if (config.demoManagerPath && !usesSession) {
      ctx.addIssue({
        code: 'custom',
        path: ['demoManagerPath'],
        message: 'solo se admite junto a un transporte demo-session',
      });
    }
    if (config.bookingTransport && config.tier < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['bookingTransport'],
        message: 'requiere tier 3 o superior',
      });
    }
    if (config.demoTierSwitch && (!config.demoThemes || config.tier < 3)) {
      ctx.addIssue({
        code: 'custom',
        path: ['demoTierSwitch'],
        message: 'requiere demoThemes y tier 3 o superior',
      });
    }
    if (config.demoThemes && new Set(config.demoThemes).size !== config.demoThemes.length) {
      ctx.addIssue({ code: 'custom', path: ['demoThemes'], message: 'no admite temas repetidos' });
    }
  });

export type TenantWebConfig = z.infer<typeof tenantWebConfigSchema>;

/** Frontera runtime: los tipos no protegen un config.ts importado o generado. */
export function parseTenantWebConfig(input: unknown): TenantWebConfig {
  const result = tenantWebConfigSchema.safeParse(input);
  if (result.success) return result.data;
  const detail = result.error.issues
    .map((issue) => `- ${issue.path.join('.') || 'config'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Config web de tenant inválida:\n${detail}`);
}

/** Nivel → comportamiento del héroe y del bundle (regla dura: nivel 1 sin motor). */
export function bookingMode(tier: TenantWebConfig['tier']): BookingMode {
  if (tier >= 3) return 'instant';
  if (tier === 2) return 'enquiry';
  return 'none';
}

export {
  cancellationPolicySchema,
  DEFAULT_CANCELLATION_POLICY,
  loadTenantConfig,
  taxPolicySchema,
  tenantHospedajesSchema,
  tenantLegalSchema,
  type CancellationPolicyConfig,
  type TaxPolicyName,
  type TenantConfig,
  type TenantHospedajes,
  type TenantLegal,
} from './tenant-config';

export {
  autoPlano,
  computeViewBox,
  expandPlano,
  ocupacionDeLaNoche,
  OCUPA_LA_NOCHE,
  PLANO_GRID,
  unitStateOn,
  type PlanoBlock,
  type PlanoBlockRange,
  type PlanoBooking,
  type PlanoCellKind,
  type PlanoDecor,
  type PlanoDescriptor,
  type PlanoLayout,
  type PlanoRect,
  type PlanoServiceIcon,
  type PlanoUnit,
  type PlanoUnitType,
  type PlanoViewBox,
  type UnitDayState,
} from './plano';

export {
  addDaysIso,
  barGeometry,
  daysBetweenIso,
  isoDay,
  seasonBands,
  snapDays,
  todayOffset,
  weekendBackground,
  type BarGeometry,
  type SeasonBand,
  type SeasonSpan,
} from './planning';
