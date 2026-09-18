import type { TenantWebConfig } from '@logic-camp/config';

/** Riu Clar — demo comercial del plan Inicio, sin Worker ni D1 propios. */
export const config: TenantWebConfig = {
  slug: 'riuclar',
  name: 'Riu Clar',
  tier: 1,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'hola@riuclar.example',
    phone: '+34 973 000 024',
    address: 'Camino del Río s/n, Prepirineo, Cataluña',
  },
  enquiryTransport: 'demo',
  presentation: 'outdoor',
  staticHeroImage: 'hero-riu-editorial',
  staticHeroMobileImage: 'hero-riu-mobile',
  heroMotion: { desktop: 'hero-motion', mobile: 'hero-motion-mobile' },
  isDemo: true,
  legal: {
    razonSocial: 'Riu Clar — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino del Río s/n, Prepirineo, Cataluña (dirección ficticia)',
    emailDerechos: 'privacitat@logic2b.com',
  },
};

export default config;
