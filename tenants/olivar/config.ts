import type { TenantWebConfig } from '@logic-camp/config';

/** L'Olivar — demo comercial del plan Inicio, sin Worker ni D1 propios. */
export const config: TenantWebConfig = {
  slug: 'olivar',
  name: "Camping L'Olivar",
  tier: 1,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@olivar.example',
    phone: '+34 964 000 049',
    address: 'Camí dels Bancals s/n, 12160 el Maestrat, Castelló',
  },
  enquiryTransport: 'demo',
  staticHeroImage: 'hero-dia',
  isDemo: true,
  legal: {
    razonSocial: "Camping L'Olivar — demostración ficticia de Logic2B",
    nif: 'No aplicable (demostración)',
    domicilio: 'Camí dels Bancals s/n, 12160 el Maestrat, Castelló (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
