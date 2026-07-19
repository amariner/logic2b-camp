/**
 * Config de tenant que consume la web pública (Fase 4) en BUILD time.
 * El `TenantConfig` de request time (política de tasa/cancelación — pagos y
 * notificaciones se quedan en sus paquetes, ver ADR 0012) vive en
 * `./tenant-config` y lo consume `apps/api`.
 */

export type BookingMode = 'none' | 'enquiry' | 'instant';

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
   * SOLO demo comercial (ADR 0009): temas alternativos seleccionables en vivo.
   * El primero es el de defecto. Sin este campo, el selector no se renderiza.
   */
  demoThemes?: string[];
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
  type CancellationPolicyConfig,
  type TaxPolicyName,
  type TenantConfig,
} from './tenant-config';
