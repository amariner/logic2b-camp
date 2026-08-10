import type { TenantWebConfig } from '@logic-camp/config';

/** La Duna — demo comercial del plan Inicio, sin Worker ni D1 propios. */
export const config: TenantWebConfig = {
  slug: 'duna',
  name: 'Camping La Duna',
  tier: 1,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@laduna.example',
    phone: '+34 965 000 020',
    address: 'Camino de la Restinga s/n, costa de Levante',
  },
  enquiryTransport: 'demo',
  staticHeroImage: 'hero-amanecer',
  isDemo: true,
  legal: {
    razonSocial: 'Camping La Duna — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino de la Restinga s/n, costa de Levante (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
