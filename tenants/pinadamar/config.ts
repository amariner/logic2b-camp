import type { TenantWebConfig } from '@logic-camp/config';

/** Pinada del Mar — demo comercial Gestión, con escenario temporal local. */
export const config: TenantWebConfig = {
  slug: 'pinadamar',
  name: 'Camping Pinada del Mar',
  tier: 2,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@pinadamar.example',
    phone: '+34 977 000 110',
    address: 'Camí de la Platja s/n, 43890 Costa Daurada, Tarragona',
  },
  enquiryTransport: 'demo-session',
  demoManagerPath: '/demos/pinadamar/gestion/',
  staticHeroImage: 'hero-calle',
  staticHeroMobileImage: 'hero-mobile',
  isDemo: true,
  legal: {
    razonSocial: 'Camping Pinada del Mar — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camí de la Platja s/n, 43890 Costa Daurada, Tarragona (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
