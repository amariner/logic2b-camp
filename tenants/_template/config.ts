import type { TenantWebConfig } from '@logic-camp/config';

/**
 * Plantilla de alta (ADR 0012 §4). Copia este directorio a `tenants/{slug}/`
 * y rellena cada TODO — un `diff -r tenants/_template tenants/{slug}` sin
 * TODOs restantes es la señal de que el alta está completa.
 */
export const config: TenantWebConfig = {
  slug: '__SLUG__', // TODO: mismo slug que en wrangler.jsonc y en seed.ts
  name: '__NOMBRE_DEL_CAMPING__', // TODO
  tier: 1, // TODO: 1 Camp Web · 2 Solicitudes · 3 Reservas (el 4 no se construye — ver docs/TIERS.md)
  locales: ['es'], // TODO: añade ca/en/fr/de/nl según lo que el camping quiera ofrecer
  defaultLocale: 'es',
  domain: 'https://__DOMINIO__', // TODO
  contact: {
    email: 'hola@__DOMINIO__', // TODO
    phone: '+34 000 000 000', // TODO
    address: '__DIRECCION__', // TODO
  },
  // Soporte Logic2B transversal. Ponlo a false solo si el contrato lo excluye.
  logic2bContact: true,
  // Identidad legal (ADR 0026 §2.5). El texto de las páginas legales (aviso legal,
  // privacidad, cookies) es de PRODUCTO y no se toca: solo se rellenan estos campos.
  legal: {
    razonSocial: '__RAZON_SOCIAL__', // TODO: razón social, o nombre y apellidos si es empresario individual
    nif: '__NIF__', // TODO
    domicilio: '__DOMICILIO_FISCAL__', // TODO: calle, CP, población y país
    // TODO: frase completa de datos registrales, o borra la línea si no los hay.
    registro: '__DATOS_REGISTRALES__',
    emailDerechos: 'privacidad@__DOMINIO__', // TODO: buzón donde se ejercen los derechos RGPD
  },
  // demoThemes: NO se rellena — es exclusivo de la demo comercial (ADR 0009).
  // Un cliente real tiene UN tema: el suyo, en theme.css.
};

export default config;
