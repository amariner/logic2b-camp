import type { TenantWebConfig } from '@logic-camp/config';

/** La Carrasca — demo comercial Visión sobre el motor compartido. */
export const config: TenantWebConfig = {
  slug: 'carrasca',
  name: 'Camping La Carrasca',
  tier: 3,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'reservas@lacarrasca.example',
    phone: '+34 978 000 150',
    address: 'Camino del Carrascal s/n, interior mediterráneo',
  },
  staticHeroImage: 'hero-encinar',
  bookingTransport: 'demo-session',
  demoManagerPath: '/demos/carrasca/gestion/',
  demoBookingPolicy: {
    bookingCodePrefix: 'CR',
    touristTax: {
      adultCentsPerNight: 120,
      childCentsPerNight: 0,
      maxNights: 7,
    },
    depositPercent: 30,
    cancellation: {
      tiers: [
        { minDaysBefore: 14, refundPct: 100 },
        { minDaysBefore: 7, refundPct: 50 },
        { minDaysBefore: 0, refundPct: 0 },
      ],
    },
  },
  isDemo: true,
  legal: {
    razonSocial: 'Camping La Carrasca — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino del Carrascal s/n, interior mediterráneo (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
