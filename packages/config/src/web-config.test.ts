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
      }),
    ).toMatchObject({ bookingTransport: 'demo-session', isDemo: true });
  });
});
