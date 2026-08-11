import type { TenantWebConfig } from '@logic-camp/config';

/** Entre Vinyes — demo comercial Gestión, con escenario temporal local. */
export const config: TenantWebConfig = {
  slug: 'vinyes',
  name: 'Camping Entre Vinyes',
  tier: 2,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@entrevinyes.example',
    phone: '+34 964 000 070',
    address: 'Camí de les Vinyes s/n, interior mediterráneo',
  },
  enquiryTransport: 'demo-session',
  demoManagerPath: '/demos/vinyes/gestion/',
  staticHeroImage: 'hero-vendimia',
  isDemo: true,
  legal: {
    razonSocial: 'Camping Entre Vinyes — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camí de les Vinyes s/n, interior mediterráneo (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
