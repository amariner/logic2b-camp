/**
 * El aviso de error de una mutación, en UN solo sitio (ADR 0029 §5).
 *
 * Cada pantalla tiene su mensaje de error propio ("no se ha podido guardar la
 * tarifa", "recarga la ficha"…) y eso está bien: dice lo que ha fallado en ese
 * contexto. Pero cuando quien pincha es el visitante de la demo, ese mensaje
 * **miente** — no ha fallado nada, es que ahí no puede escribir. Así que el
 * caso se intercepta aquí, una vez, y no en veinte `onError` distintos.
 *
 * El `id` fijo hace que pinchar tres botones seguidos no apile tres avisos.
 */
import { toast } from '@logic-camp/ui';
import { esDemoSoloLectura } from './api';
import { t } from './i18n';

export function errorMutacion(error: unknown, mensaje: string): void {
  if (esDemoSoloLectura(error)) {
    toast.info(t('demo.soloLectura'), { id: 'demo-solo-lectura' });
    return;
  }
  toast.error(mensaje);
}
