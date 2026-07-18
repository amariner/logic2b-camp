import type { TenantWebConfig } from '@logic-camp/config';

/** Camping Cala Sereno — tenant de la demo comercial. */
export const config: TenantWebConfig = {
  slug: 'demo',
  name: 'Camping Cala Sereno',
  tier: 3,
  locales: ['es', 'en'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@calasereno.example',
    phone: '+34 964 000 000',
    address: 'Partida Cala Sereno s/n, 12500 Castellón',
  },
};

export default config;
