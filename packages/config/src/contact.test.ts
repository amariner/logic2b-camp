import { describe, expect, it } from 'vitest';
import {
  LOGIC2B_CONTACT_CONTEXTS,
  LOGIC2B_CONTACT_LOCALES,
  LOGIC2B_CONTACT_SCROLL_PX,
  LOGIC2B_WHATSAPP_PHONE,
  LOGIC2B_WHATSAPP_URL,
  logic2bContact,
  logic2bContactEnabled,
} from './contact';

describe('contacto Logic2B', () => {
  it('normaliza un único destino y el umbral aprobado', () => {
    expect(LOGIC2B_WHATSAPP_PHONE).toBe('+34 626 432 316');
    expect(LOGIC2B_WHATSAPP_URL).toBe('https://wa.me/34626432316');
    expect(LOGIC2B_CONTACT_SCROLL_PX).toBe(280);
  });

  it.each(LOGIC2B_CONTACT_LOCALES)('entrega los cuatro contextos en %s', (locale) => {
    for (const context of LOGIC2B_CONTACT_CONTEXTS) {
      const contact = logic2bContact(locale, context);
      const url = new URL(contact.href);
      expect(url.origin + url.pathname).toBe(LOGIC2B_WHATSAPP_URL);
      expect(url.searchParams.get('text')).toBe(contact.message);
      expect(contact.label.trim()).not.toBe('');
      expect(contact.ariaLabel).toMatch(/Logic2B/i);
      expect(contact.phone).toBe(LOGIC2B_WHATSAPP_PHONE);
    }
  });

  it('usa español como fallback y no incorpora datos personales o de reserva', () => {
    expect(logic2bContact('pt-BR', 'commercial')).toEqual(logic2bContact('es', 'commercial'));
    for (const locale of LOGIC2B_CONTACT_LOCALES) {
      for (const context of LOGIC2B_CONTACT_CONTEXTS) {
        const { href, message } = logic2bContact(locale, context);
        expect(message).not.toMatch(/@|\b\d{3,}\b|reserva|booking|check-?in|https?:/i);
        expect(Array.from(new URL(href).searchParams.keys())).toEqual(['text']);
      }
    }
  });

  it('activa por defecto y respeta la desactivación explícita del tenant', () => {
    expect(logic2bContactEnabled({})).toBe(true);
    expect(logic2bContactEnabled({ logic2bContact: true })).toBe(true);
    expect(logic2bContactEnabled({ logic2bContact: false })).toBe(false);
  });
});
