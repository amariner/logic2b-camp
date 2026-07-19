import { createCipheriv, randomBytes as nodeRandomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { tripleDesCbcEncrypt } from './des';

/**
 * Cloudflare Workers no soporta 3DES en `crypto.subtle` (ver ADR 0011 §7),
 * así que aquí no queda otra que implementarlo a mano. `node:crypto` SÍ lo
 * soporta de forma nativa (OpenSSL) — solo en el entorno de test (Node), no
 * en producción (Workers) — así que sirve de oráculo para verificar que la
 * implementación propia es bit a bit idéntica, en vez de fiarse de memoria.
 */
function nodeReference(plaintext: Uint8Array, key24: Uint8Array): Uint8Array {
  const cipher = createCipheriv('des-ede3-cbc', Buffer.from(key24), Buffer.alloc(8, 0));
  cipher.setAutoPadding(false);
  return new Uint8Array(Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]));
}

function randomBytes(n: number): Uint8Array {
  return new Uint8Array(nodeRandomBytes(n));
}

describe('tripleDesCbcEncrypt', () => {
  it('coincide con node:crypto (des-ede3-cbc, IV cero, sin padding) en 500 casos aleatorios', () => {
    for (let i = 0; i < 500; i++) {
      const blocks = 1 + Math.floor(Math.random() * 4);
      const plaintext = randomBytes(blocks * 8);
      const key24 = randomBytes(24);
      expect(Buffer.from(tripleDesCbcEncrypt(plaintext, key24))).toEqual(
        Buffer.from(nodeReference(plaintext, key24)),
      );
    }
  });

  it('encadena CBC entre bloques (dos bloques iguales no cifran igual)', () => {
    const key24 = randomBytes(24);
    const plaintext = new Uint8Array(16); // dos bloques de ceros
    const out = tripleDesCbcEncrypt(plaintext, key24);
    expect(Buffer.from(out.slice(0, 8))).not.toEqual(Buffer.from(out.slice(8, 16)));
  });

  it('rechaza claves que no sean de 24 bytes y texto que no sea múltiplo de 8', () => {
    expect(() => tripleDesCbcEncrypt(new Uint8Array(8), new Uint8Array(16))).toThrow();
    expect(() => tripleDesCbcEncrypt(new Uint8Array(5), new Uint8Array(24))).toThrow();
  });

  it('deriva la clave de pedido de Redsys con la clave de test pública sin lanzar', () => {
    // clave de test estándar publicada en la documentación de Redsys
    const key24 = new Uint8Array(Buffer.from('sq7HjrUOBfKmC576ILgskD5srU870gJ7', 'base64'));
    const order = new TextEncoder().encode('1234test0001'); // 12 bytes, múltiplo de 4
    const padded = new Uint8Array(16); // relleno con \0 a múltiplo de 8
    padded.set(order);
    const orderKey = tripleDesCbcEncrypt(padded, key24);
    expect(orderKey).toHaveLength(16);
    expect(Buffer.from(orderKey).toString('base64')).toBe(
      Buffer.from(nodeReference(padded, key24)).toString('base64'),
    );
  });
});
