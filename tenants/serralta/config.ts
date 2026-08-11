import type { TenantWebConfig } from '@logic-camp/config';

/** Serralta — demo comercial Gestión, con escenario temporal local. */
export const config: TenantWebConfig = {
  slug: 'serralta',
  name: 'Camping Serralta',
  tier: 2,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@serralta.example',
    phone: '+34 974 000 080',
    address: 'Pista del Collado s/n, sierra prepirenaica',
  },
  enquiryTransport: 'demo-session',
  demoManagerPath: '/demos/serralta/gestion/',
  staticHeroImage: 'hero-bosque',
  isDemo: true,
  legal: {
    razonSocial: 'Camping Serralta — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Pista del Collado s/n, sierra prepirenaica (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
