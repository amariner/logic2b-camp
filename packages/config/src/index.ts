/**
 * Config de tenant que consume la web pública (Fase 4).
 * El TenantConfig completo (pagos, notificaciones, dominios…) llega en Fase 9.
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
};

/** Nivel → comportamiento del héroe y del bundle (regla dura: nivel 1 sin motor). */
export function bookingMode(tier: TenantWebConfig['tier']): BookingMode {
  if (tier >= 3) return 'instant';
  if (tier === 2) return 'enquiry';
  return 'none';
}
