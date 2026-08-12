import type { TenantWebConfig } from '@logic-camp/config';

/** Sol d'Hivern — larga estancia mediterránea sobre el motor compartido. */
export const config: TenantWebConfig = {
  slug: 'soldhivern',
  name: "Camping Sol d'Hivern",
  tier: 3,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camp.logic2b.com',
  contact: {
    email: 'estancias@solhivern.example',
    phone: '+34 966 000 200',
    address: 'Camino de los Almendros s/n, costa mediterránea',
  },
  staticHeroImage: 'hero-invierno',
  bookingTransport: 'demo-session',
  demoManagerPath: '/demos/soldhivern/gestion/',
  demoBookingPolicy: {
    bookingCodePrefix: 'SH',
    touristTax: {
      adultCentsPerNight: 0,
      childCentsPerNight: 0,
      maxNights: 1,
    },
    depositPercent: 15,
    cancellation: {
      tiers: [
        { minDaysBefore: 30, refundPct: 100 },
        { minDaysBefore: 15, refundPct: 50 },
        { minDaysBefore: 0, refundPct: 0 },
      ],
    },
  },
  isDemo: true,
  legal: {
    razonSocial: "Camping Sol d'Hivern — demostración ficticia de Logic2B",
    nif: 'No aplicable (demostración)',
    domicilio: 'Camino de los Almendros s/n, costa mediterránea (dirección ficticia)',
    emailDerechos: 'privacidad@logic2b.com',
  },
};

export default config;
