import { describe, expect, it } from 'vitest';
import { parseTenantWebConfig } from './index';

const base = {
  slug: 'camping-real',
  name: 'Camping Real',
  tier: 1 as const,
  locales: ['es'],
  defaultLocale: 'es',
  domain: 'https://camping.example',
  contact: {
    email: 'hola@camping.example',
    phone: '+34 900 000 000',
    address: 'Calle Mayor 1, Castellón',
  },
  legal: {
    razonSocial: 'Camping Real, S.L.',
    nif: 'B12345678',
    domicilio: 'Calle Mayor 1, Castellón',
    emailDerechos: 'privacidad@camping.example',
  },
};

describe('parseTenantWebConfig', () => {
  it('acepta un tenant normal sin capacidades demo', () => {
    expect(parseTenantWebConfig(base)).toMatchObject({ slug: 'camping-real', tier: 1 });
  });

  it('permite desactivar explícitamente el contacto de plataforma', () => {
    expect(parseTenantWebConfig({ ...base, logic2bContact: false })).toMatchObject({
      logic2bContact: false,
    });
  });

  it('acepta vídeo ambiental local y encuadre opcional', () => {
    expect(
      parseTenantWebConfig({
        ...base,
        heroMotion: {
          desktop: 'hero-motion',
          mobile: 'hero-motion-mobile',
          position: '52% center',
        },
      }),
    ).toMatchObject({ heroMotion: { desktop: 'hero-motion', mobile: 'hero-motion-mobile' } });
  });

  it.each(['https://media.example/hero.mp4', '../hero', '/hero']) (
    'rechaza una fuente de vídeo no local: %s',
    (desktop) => {
      expect(() => parseTenantWebConfig({ ...base, heroMotion: { desktop } })).toThrow(
        'heroMotion.desktop: debe ser una clave de medio segura',
      );
    },
  );

  it('rechaza un locale por defecto que no se publica', () => {
    expect(() => parseTenantWebConfig({ ...base, defaultLocale: 'en' })).toThrow(
      'defaultLocale: debe estar incluido en locales',
    );
  });

  it.each([
    { enquiryTransport: 'demo' },
    { enquiryTransport: 'demo-session', demoManagerPath: '/demos/camping/gestion/' },
    { demoThemes: ['mar'] },
    { demoTierSwitch: true },
    {
      demoBookingPolicy: {
        touristTax: { adultCentsPerNight: 120, childCentsPerNight: 0, maxNights: 7 },
        depositPercent: 30,
        cancellation: { tiers: [{ minDaysBefore: 0, refundPct: 0 }] },
      },
    },
  ])('rechaza capacidad demo en un tenant normal: %o', (demoField) => {
    expect(() => parseTenantWebConfig({ ...base, ...demoField })).toThrow(
      'es exclusivo de una config con isDemo: true',
    );
  });

  it('exige gestor para el estado de sesión ficticio', () => {
    expect(() =>
      parseTenantWebConfig({
        ...base,
        tier: 2,
        isDemo: true,
        enquiryTransport: 'demo-session',
      }),
    ).toThrow('demoManagerPath: es obligatorio cuando el transporte es demo-session');
  });

  it('impide activar el transporte del motor por debajo de tier 3', () => {
    expect(() => parseTenantWebConfig({ ...base, bookingTransport: 'persisted' })).toThrow(
      'bookingTransport: requiere tier 3 o superior',
    );
  });

  it('acepta un escenario demo-session completo y explícito', () => {
    expect(
      parseTenantWebConfig({
        ...base,
        tier: 3,
        isDemo: true,
        bookingTransport: 'demo-session',
        demoManagerPath: '/demos/camping-real/gestion/',
        demoBookingPolicy: {
          touristTax: { adultCentsPerNight: 120, childCentsPerNight: 0, maxNights: 7 },
          depositPercent: 30,
          cancellation: {
            tiers: [
              { minDaysBefore: 14, refundPct: 100 },
              { minDaysBefore: 7, refundPct: 50 },
              { minDaysBefore: 0, refundPct: 0 },
            ],
          },
        },
      }),
    ).toMatchObject({
      bookingTransport: 'demo-session',
      isDemo: true,
      demoBookingPolicy: { depositPercent: 30 },
    });
  });
});
