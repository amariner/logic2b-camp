/**
 * Config de tenant que consume la web pública (Fase 4) en BUILD time.
 * El `TenantConfig` de request time (política de tasa/cancelación — pagos y
 * notificaciones se quedan en sus paquetes, ver ADR 0012) vive en
 * `./tenant-config` y lo consume `apps/api`.
 */

import type { TenantLegal } from './tenant-config';

export type BookingMode = 'none' | 'enquiry' | 'instant';
export type EnquiryTransport = 'persisted' | 'demo';

export type TenantWebConfig = {
  slug: string;
  name: string;
  /** 1 Camp Web · 2 Solicitudes · 3 Reservas · 4 Motor (no construir) */
  tier: 1 | 2 | 3 | 4;
  locales: string[];
  defaultLocale: string;
  domain: string;
  contact: { email: string; phone: string; address: string };
  /**
   * Destino del formulario público. Ausente equivale a `persisted` para no
   * cambiar tenants existentes. `demo` nunca hace red ni conserva PII.
   */
  enquiryTransport?: EnquiryTransport;
  /** Foto de héroe del carril estático; por defecto conserva `hero-anochecer`. */
  staticHeroImage?: string;
  /**
   * Identidad legal del titular (ADR 0026 §2.5). Obligatorio: un camping español
   * no puede publicar sin aviso legal, y sin estos datos las páginas legales no
   * se pueden generar. El texto es de producto; esto es lo único que varía.
   */
  legal: TenantLegal;
  /**
   * SOLO demo comercial (ADR 0009): temas alternativos seleccionables en vivo.
   * El primero es el de defecto. Sin este campo, el selector no se renderiza.
   */
  demoThemes?: string[];
  /**
   * SOLO demo comercial (ADR 0013): banner "entorno de demostración" en
   * todas las páginas. Un camping real nunca define esto — ni el nodo se
   * genera en su HTML.
   */
  isDemo?: boolean;
  /**
   * SOLO demo comercial (ADR 0013): interruptor nivel 1/3 en vivo (atrezzo,
   * NO un segundo build — el motor sigue en el bundle debajo). Sin este
   * campo, la home renderiza un único héroe según el `tier` de build, como
   * siempre.
   */
  demoTierSwitch?: boolean;
};

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
