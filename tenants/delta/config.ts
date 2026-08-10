import type { TenantWebConfig } from '@logic-camp/config';

/** El Delta — demo comercial del plan Inicio, sin Worker ni D1 propios. */
export const config: TenantWebConfig = {
  slug: 'delta',
  name: 'Camping El Delta',
  tier: 1,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@delta.example',
    phone: '+34 977 000 016',
    address: 'Camino del Ullal s/n, humedales del Mediterráneo',
  },
  enquiryTransport: 'demo',
  staticHeroImage: 'hero-amanecer',
  isDemo: true,
  legal: {
    razonSocial: 'Camping El Delta — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino del Ullal s/n, humedales del Mediterráneo (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
