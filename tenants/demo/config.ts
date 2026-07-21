import type { TenantWebConfig } from '@logic-camp/config';

/** Camping Cala Sereno — tenant de la demo comercial. */
export const config: TenantWebConfig = {
  slug: 'demo',
  name: 'Camping Cala Sereno',
  tier: 3,
  locales: ['es', 'ca', 'en', 'fr', 'de', 'nl'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@calasereno.example',
    phone: '+34 964 000 000',
    address: 'Partida Cala Sereno s/n, 12500 Castellón',
  },
  // identidad legal (ADR 0026 §2.5) — FICTICIA: Cala Sereno no existe. El texto de
  // las páginas legales es de producto y solo interpola estos campos.
  legal: {
    razonSocial: 'Cala Sereno Turisme, S.L.',
    nif: 'B00000000',
    domicilio: 'Partida Cala Sereno s/n, 12500 Castellón (España)',
    registro: 'Inscrita en el Registro Mercantil de Castellón, tomo 0000, folio 00, hoja CS-00000.',
    emailDerechos: 'privacidad@calasereno.example',
  },
  // atrezzo comercial (ADR 0009): la demo se re-viste en vivo delante del cliente
  demoThemes: ['pinada', 'mar', 'garriga', 'nit'],
  // banner + conmutador de nivel 1/3 en vivo (ADR 0013) — solo esta demo
  isDemo: true,
  demoTierSwitch: true,
};

export default config;
