import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Fase 0: solo el marcador de versión de esquema. El modelo real (§4) es Fase 1.
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
