/**
 * Salida del parte: interfaz del modo local seguro (ADR 0028 y addenda R12).
 *
 * La documentación técnica del servicio web solo se descarga desde el área
 * autenticada de una entidad registrada. Sin endpoint, request y acuse oficiales
 * verificables no existe un adaptador automático honesto: el único transporte
 * exportado es el modo manual y nunca hace red.
 */

export type SendResult = { ok: false; error: 'manual_transport' };

export interface HospedajesTransport {
  readonly mode: 'manual';
  send(xml: string): Promise<SendResult>;
}

/**
 * Modo con el que un camping opera desde el DÍA UNO, sin esperar al alta del
 * servicio web: los datos se revisan y el XML local se descarga como borrador.
 * La comunicación se completa en el procedimiento oficial hasta importar y
 * verificar la documentación técnica autenticada. Este adaptador no envía nada
 * por red y nunca presenta el borrador como acuse del Ministerio.
 */
export function manualTransport(): HospedajesTransport {
  return {
    mode: 'manual',
    async send() {
      return { ok: false, error: 'manual_transport' };
    },
  };
}
