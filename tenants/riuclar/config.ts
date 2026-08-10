import type { TenantWebConfig } from '@logic-camp/config';

/** Riu Clar — demo comercial del plan Inicio, sin Worker ni D1 propios. */
export const config: TenantWebConfig = {
  slug: 'riuclar',
  name: 'Càmping Riu Clar',
  tier: 1,
  locales: ['ca'],
  defaultLocale: 'ca',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@riuclar.example',
    phone: '+34 973 000 024',
    address: 'Camí del Riu s/n, Prepirineu, Catalunya',
  },
  enquiryTransport: 'demo',
  staticHeroImage: 'hero-boira',
  isDemo: true,
  legal: {
    razonSocial: 'Càmping Riu Clar — demostració fictícia de Logic2B',
    nif: 'No aplicable (demostració)',
    domicilio: 'Camí del Riu s/n, Prepirineu, Catalunya (adreça fictícia)',
    emailDerechos: 'privacitat@logic2b.com',
  },
};

export default config;
