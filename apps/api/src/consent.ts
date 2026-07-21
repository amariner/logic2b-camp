/**
 * Versión del texto de privacidad vigente (ADR 0026 §2.3).
 *
 * Módulo propio porque lo comparten tres sitios que sellan consentimiento —el alta
 * pública (`bookings.ts`), el alta de mostrador y la edición de ficha
 * (`routes/admin.ts`)— y la versión tiene que ser LA MISMA en los tres. Un solo
 * sitio que subir cuando cambie el texto.
 *
 * Se sella en el SERVIDOR, nunca la manda el cliente: un consentimiento cuya versión
 * declara el propio consentidor no prueba nada.
 *
 * SUBIR ESTA FECHA cada vez que cambie el texto de la política de privacidad de la
 * web pública. Los consentimientos anteriores conservan la versión que aceptaron,
 * que es justamente lo que los hace demostrables.
 */
export const CONSENT_VERSION = '2026-07-21';
