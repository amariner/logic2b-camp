import type { TenantWebConfig } from '@logic-camp/config';

/** Els Tarongers — demo comercial Gestión, con escenario temporal local. */
export const config: TenantWebConfig = {
  slug: 'tarongers',
  name: 'Camping Els Tarongers',
  tier: 2,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@elstarongers.example',
    phone: '+34 961 000 100',
    address: 'Camí de la Séquia s/n, llanura litoral valenciana',
  },
  enquiryTransport: 'demo-session',
  demoManagerPath: '/demos/tarongers/gestion/',
  staticHeroImage: 'hero-azahar',
  isDemo: true,
  legal: {
    razonSocial: 'Camping Els Tarongers — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camí de la Séquia s/n, llanura litoral valenciana (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
