import type { TenantWebConfig } from '@logic-camp/config';

/** La Ballena — demo familiar de alta rotación sobre el motor compartido. */
export const config: TenantWebConfig = {
  slug: 'ballena',
  name: 'Camping La Ballena',
  tier: 3,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'reservas@laballena.example',
    phone: '+34 966 000 250',
    address: 'Camino de las Salinas s/n, costa mediterránea',
  },
  staticHeroImage: 'hero-olas',
  bookingTransport: 'demo-session',
  enquiryTransport: 'demo',
  demoManagerPath: '/demos/ballena/gestion/',
  demoBookingPolicy: {
    bookingCodePrefix: 'BL',
    touristTax: {
      adultCentsPerNight: 0,
      childCentsPerNight: 0,
      maxNights: 1,
    },
    depositPercent: 25,
    cancellation: {
      tiers: [
        { minDaysBefore: 21, refundPct: 100 },
        { minDaysBefore: 8, refundPct: 50 },
        { minDaysBefore: 0, refundPct: 0 },
      ],
    },
  },
  isDemo: true,
  legal: {
    razonSocial: 'Camping La Ballena — demostración ficticia de Logic2B',
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino de las Salinas s/n, costa mediterránea (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
