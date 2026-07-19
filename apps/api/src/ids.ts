/** IDs y timestamps compartidos — separado de bookings.ts para evitar el
 * ciclo bookings↔payments (ambos necesitan uid/nowIso). */
export const uid = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
export const nowIso = () => new Date().toISOString();
