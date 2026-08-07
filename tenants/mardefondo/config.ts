import type { TenantWebConfig } from '@logic-camp/config';

/** Mar de Fondo — demo comercial Visión sobre el motor compartido. */
export const config: TenantWebConfig = {
  slug: 'mardefondo',
  name: 'Camping Resort Mar de Fondo',
  tier: 3,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'reservas@mardefondo.example',
    phone: '+34 965 000 300',
    address: 'Camí de la Marjal s/n, 03700 Costa Blanca, Alicante',
  },
  staticHeroImage: 'hero-laguna',
  bookingTransport: 'demo-session',
  isDemo: true,
  legal: {
    razonSocial: 'Camping Resort Mar de Fondo — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camí de la Marjal s/n, 03700 Costa Blanca, Alicante (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
