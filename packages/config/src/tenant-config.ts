/**
 * TenantConfig (ADR 0012 §1): el superconjunto que lee `apps/api` en
 * request time desde `tenants.modules`. Consolida lo que hoy vive como
 * constantes duplicadas con el comentario "de TenantConfig en Fase 9"
 * (política de tasa turística y de cancelación, repetidas en
 * `public.ts` y `admin.ts`).
 *
 * `payments`/`notifications` se quedan sin tipar fuerte aquí a propósito:
 * `apps/api/src/payments.ts` y `notify.ts` ya validan y normalizan esas
 * dos claves con más matices (secrets del Worker, defaults por modo) de
 * los que le corresponde duplicar a este paquete — lo suyo es la política
 * de tasa/cancelación, que hasta ahora no tenía dueño.
 *
 * Distinto de `TenantWebConfig` (arriba en este paquete): ese es el
 * subconjunto que `apps/web` necesita en BUILD time y nunca toca D1.
 */
import { z } from 'zod';

export const taxPolicySchema = z.enum(['valencia', 'catalunya', 'none']);
export type TaxPolicyName = z.infer<typeof taxPolicySchema>;

export const cancellationPolicySchema = z.object({
  tiers: z
    .array(
      z.object({
        minDaysBefore: z.number().int().min(0),
        refundPct: z.number().min(0).max(100),
      }),
    )
    .min(1),
});
export type CancellationPolicyConfig = z.infer<typeof cancellationPolicySchema>;

/** Política por defecto hasta que el tenant fije la suya (misma que hoy en public.ts/admin.ts). */
export const DEFAULT_CANCELLATION_POLICY: CancellationPolicyConfig = {
  tiers: [
    { minDaysBefore: 30, refundPct: 100 },
    { minDaysBefore: 7, refundPct: 50 },
    { minDaysBefore: 0, refundPct: 0 },
  ],
};

/**
 * Identidad legal del titular del sitio (ADR 0026 §2.5).
 *
 * El TEXTO legal es de producto —se escribe una vez y sirve a todos los campings—;
 * lo único que varía por instancia son estos cinco campos, que las páginas de aviso
 * legal, privacidad y cookies interpolan. Escribir la prosa legal a mano por camping
 * sería justo lo que prohíbe CLAUDE.md.
 */
export const tenantLegalSchema = z.object({
  /** Razón social, o nombre y apellidos si el titular es empresario individual. */
  razonSocial: z.string().min(1),
  /** NIF/CIF del titular. */
  nif: z.string().min(1),
  /** Domicilio social o fiscal completo, con código postal y población. */
  domicilio: z.string().min(1),
  /**
   * Datos registrales, si los hay: **frase completa** lista para insertar en la prosa
   * ("Inscrita en el Registro Mercantil de Castellón, tomo…"). Se interpola en línea,
   * así que un titular sin registro (empresario individual) lo deja fuera y la frase
   * simplemente no aparece.
   */
  registro: z.string().optional(),
  /** Buzón donde el interesado ejerce sus derechos RGPD (arts. 15-22). */
  emailDerechos: z.string().email(),
});
export type TenantLegal = z.infer<typeof tenantLegalSchema>;

/**
 * Parte de viajeros (ADR 0028): datos del establecimiento que el parte SES.Hospedajes
 * repite en cada comunicación. Vive en `tenants.modules.hospedajes`, la misma capa que
 * `payments`/`notifications` — no una tabla nueva (eso sería trabajo por camping).
 *
 * Las CREDENCIALES del webservice (usuario/contraseña) NO van aquí: son secrets del
 * Worker (`wrangler secret`), como las claves de Stripe/Redsys/Resend. En `modules`
 * solo va lo que no es secreto: si está activo y con qué código de establecimiento.
 */
export const tenantHospedajesSchema = z.object({
  enabled: z.boolean(),
  /** Código de establecimiento asignado por SES.Hospedajes. */
  codigoEstablecimiento: z.string().min(1),
  establecimiento: z.object({
    nombre: z.string().min(1),
    direccion: z.string().min(1),
    municipio: z.string().min(1),
    provincia: z.string().min(1),
    cp: z.string().min(1),
  }),
});
export type TenantHospedajes = z.infer<typeof tenantHospedajesSchema>;

export type TenantConfig = {
  slug: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  timezone: string;
  currency: string;
  locales: string[];
  taxPolicy: TaxPolicyName;
  cancellationPolicy: CancellationPolicyConfig;
  /** ADR 0009: solo demo comercial */
  demoThemes?: string[];
};

type TenantRow = {
  slug: string;
  name: string;
  tier: number;
  timezone: string;
  currency: string;
  locales: unknown;
  modules: unknown;
};

const tenantRowSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  timezone: z.string().trim().min(1),
  currency: z.string().regex(/^[A-Z]{3}$/, 'debe ser un código ISO 4217 de tres letras'),
  locales: z.array(z.string().trim().min(2)).min(1),
  modules: z.record(z.string(), z.unknown()).nullish(),
});

const demoThemesSchema = z
  .array(z.string().trim().min(1))
  .min(1)
  .refine((themes) => new Set(themes).size === themes.length, 'no admite temas repetidos');

function invalidConfig(area: string, error: z.ZodError): never {
  const detail = error.issues
    .map((issue) => `${issue.path.join('.') || area}: ${issue.message}`)
    .join('; ');
  throw new Error(`TenantConfig inválida (${area}): ${detail}`);
}

function parseModule<T>(area: string, schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) invalidConfig(area, result.error);
  return result.data;
}

/**
 * Valida la fila persistida. Solo la ausencia de una política conserva el
 * default histórico; un valor presente pero inválido falla explícitamente.
 */
export function loadTenantConfig(row: TenantRow): TenantConfig {
  const parsedRow = tenantRowSchema.safeParse(row);
  if (!parsedRow.success) invalidConfig('fila', parsedRow.error);
  const { modules: rawModules, ...tenant } = parsedRow.data;
  const modules = rawModules ?? {};

  return {
    ...tenant,
    taxPolicy:
      modules.taxPolicy === undefined
        ? 'none'
        : parseModule('modules.taxPolicy', taxPolicySchema, modules.taxPolicy),
    cancellationPolicy:
      modules.cancellationPolicy === undefined
        ? DEFAULT_CANCELLATION_POLICY
        : parseModule(
            'modules.cancellationPolicy',
            cancellationPolicySchema,
            modules.cancellationPolicy,
          ),
    demoThemes:
      modules.demoThemes === undefined
        ? undefined
        : parseModule('modules.demoThemes', demoThemesSchema, modules.demoThemes),
  };
}
