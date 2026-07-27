/** Emite seed.sql con el día en curso como ancla (determinista dado el ancla). */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSeed, seedToSql } from './seed';

// `SEED_ANCHOR=YYYY-MM-DD` para reproducir un día concreto (ADR 0030).
const anchor = process.env.SEED_ANCHOR ?? new Date().toISOString().slice(0, 10);
const sql = seedToSql(generateSeed(anchor));
const out = join(dirname(fileURLToPath(import.meta.url)), 'seed.sql');
writeFileSync(out, sql);
console.log(`seed.sql generado (ancla ${anchor}, ${sql.split('\n').length} sentencias)`);
