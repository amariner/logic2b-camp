/** Emite seed.sql con el año actual como ancla (determinista dado el año). */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSeed, seedToSql } from './seed';

const year = Number(process.env.SEED_YEAR ?? new Date().getUTCFullYear());
const sql = seedToSql(generateSeed(year));
const out = join(dirname(fileURLToPath(import.meta.url)), 'seed.sql');
writeFileSync(out, sql);
console.log(`seed.sql generado (ancla ${year}, ${sql.split('\n').length} sentencias)`);
