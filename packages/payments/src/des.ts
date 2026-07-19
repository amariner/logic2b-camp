/**
 * DES/3DES puro en TypeScript (ADR 0011 §7).
 *
 * Bloqueo técnico real: Cloudflare Workers no implementa DES/3DES en
 * `crypto.subtle` (solo AES/RSA/EC/HMAC/SHA), y Redsys firma con 3DES-CBC
 * para derivar la clave por pedido — no hay forma de evitarlo sin esta
 * implementación. Tablas estándar FIPS 46-3. Representación por bits
 * (array de 0/1, bit 1 = MSB del primer byte) para máxima claridad frente a
 * velocidad: el volumen (una firma por operación de pago) es irrelevante.
 *
 * Verificado en `des.test.ts` contra `node:crypto` ('des-ede3-cbc', IV cero,
 * sin padding) para lotes de casos aleatorios — Node sí soporta 3DES nativo,
 * así que sirve de oráculo en los tests aunque el código de producción no
 * pueda usarlo (Workers).
 */

const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64,
  56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53,
  45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];

const FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37,
  5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2,
  42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];

const E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19,
  20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];

const P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13,
  30, 6, 22, 11, 4, 25,
];

const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60,
  52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21,
  13, 5, 28, 20, 12, 4,
];

const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52,
  31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

const S_BOXES = [
  [
    14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11,
    9, 5, 3, 8, 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5,
    11, 3, 14, 10, 0, 6, 13,
  ],
  [
    15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10,
    6, 9, 11, 5, 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2,
    11, 6, 7, 12, 0, 5, 14, 9,
  ],
  [
    10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12,
    11, 15, 1, 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4,
    15, 14, 3, 11, 5, 2, 12,
  ],
  [
    7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1,
    10, 14, 9, 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9,
    4, 5, 11, 12, 7, 2, 14,
  ],
  [
    2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10,
    3, 9, 8, 6, 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6,
    15, 0, 9, 10, 4, 5, 3,
  ],
  [
    12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14,
    0, 11, 3, 8, 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10,
    11, 14, 1, 7, 6, 0, 8, 13,
  ],
  [
    4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12,
    2, 15, 8, 6, 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9,
    5, 0, 15, 14, 2, 3, 12,
  ],
  [
    13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11,
    0, 14, 9, 2, 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13,
    15, 12, 9, 0, 3, 5, 6, 11,
  ],
];

type Bits = number[]; // 0|1

function bytesToBits(bytes: Uint8Array): Bits {
  const bits: Bits = new Array(bytes.length * 8);
  for (let i = 0; i < bytes.length; i++) {
    for (let b = 0; b < 8; b++) bits[i * 8 + b] = (bytes[i]! >> (7 - b)) & 1;
  }
  return bits;
}

function bitsToBytes(bits: Bits): Uint8Array {
  const out = new Uint8Array(bits.length / 8);
  for (let i = 0; i < out.length; i++) {
    let v = 0;
    for (let b = 0; b < 8; b++) v = (v << 1) | bits[i * 8 + b]!;
    out[i] = v;
  }
  return out;
}

/** table entries son índices 1-based sobre `input` (convención FIPS 46-3). */
function permute(input: Bits, table: number[]): Bits {
  return table.map((i) => input[i - 1]!);
}

function xorBits(a: Bits, b: Bits): Bits {
  return a.map((v, i) => v ^ b[i]!);
}

function leftRotate(bits: Bits, n: number): Bits {
  return [...bits.slice(n), ...bits.slice(0, n)];
}

/** 16 subclaves de 48 bits a partir de una clave DES de 8 bytes (56 bits útiles). */
function keySchedule(key8: Uint8Array): Bits[] {
  const keyBits = bytesToBits(key8);
  let c = permute(keyBits, PC1).slice(0, 28);
  let d = permute(keyBits, PC1).slice(28);
  const subkeys: Bits[] = [];
  for (let round = 0; round < 16; round++) {
    c = leftRotate(c, SHIFTS[round]!);
    d = leftRotate(d, SHIFTS[round]!);
    subkeys.push(permute([...c, ...d], PC2));
  }
  return subkeys;
}

function feistel(r: Bits, subkey: Bits): Bits {
  const expanded = permute(r, E); // 48 bits
  const x = xorBits(expanded, subkey);
  const sOut: Bits = [];
  for (let s = 0; s < 8; s++) {
    const chunk = x.slice(s * 6, s * 6 + 6);
    const row = (chunk[0]! << 1) | chunk[5]!;
    const col = (chunk[1]! << 3) | (chunk[2]! << 2) | (chunk[3]! << 1) | chunk[4]!;
    const val = S_BOXES[s]![row * 16 + col]!;
    sOut.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1);
  }
  return permute(sOut, P);
}

/** Un bloque DES de 8 bytes. `subkeys` en orden de aplicación (cifrar: 0..15, descifrar: 15..0). */
function desBlock(block8: Uint8Array, subkeys: Bits[]): Uint8Array {
  const bits = permute(bytesToBits(block8), IP);
  let l = bits.slice(0, 32);
  let r = bits.slice(32);
  for (const subkey of subkeys) {
    const nextL = r;
    const nextR = xorBits(l, feistel(r, subkey));
    l = nextL;
    r = nextR;
  }
  return bitsToBytes(permute([...r, ...l], FP));
}

const desEncryptBlock = (block8: Uint8Array, key8: Uint8Array) =>
  desBlock(block8, keySchedule(key8));
const desDecryptBlock = (block8: Uint8Array, key8: Uint8Array) =>
  desBlock(block8, [...keySchedule(key8)].reverse());

const xorBytes = (a: Uint8Array, b: Uint8Array): Uint8Array =>
  Uint8Array.from(a, (v, i) => v ^ b[i]!);

/**
 * 3DES-EDE-CBC con IV de ceros y SIN padding (el llamador rellena a múltiplo
 * de 8 con \0, igual que Redsys). `key24` = K1(0-7) + K2(8-15) + K3(16-23).
 */
export function tripleDesCbcEncrypt(plaintext: Uint8Array, key24: Uint8Array): Uint8Array {
  if (key24.length !== 24) throw new Error('tripleDesCbcEncrypt: la clave debe ser de 24 bytes');
  if (plaintext.length % 8 !== 0)
    throw new Error('tripleDesCbcEncrypt: el texto debe ser múltiplo de 8 bytes');
  const k1 = key24.slice(0, 8);
  const k2 = key24.slice(8, 16);
  const k3 = key24.slice(16, 24);
  const out = new Uint8Array(plaintext.length);
  let prevCipher: Uint8Array = new Uint8Array(8); // IV = 0
  for (let off = 0; off < plaintext.length; off += 8) {
    const block = plaintext.slice(off, off + 8);
    const chained = xorBytes(block, prevCipher);
    const encrypted = desEncryptBlock(chained, k1);
    const decrypted = desDecryptBlock(encrypted, k2);
    const cipher = desEncryptBlock(decrypted, k3);
    out.set(cipher, off);
    prevCipher = cipher;
  }
  return out;
}
