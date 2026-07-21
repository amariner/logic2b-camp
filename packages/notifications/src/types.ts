/**
 * Tipos del sistema de notificaciones (ADR 0010).
 * Este paquete es PURO: render y contrato de envío. La base de datos
 * (notifications_log) vive en la API, no aquí.
 */

export type Lang = 'es' | 'ca' | 'en' | 'fr' | 'de' | 'nl';

export type NotificationKind =
  | 'enquiry_received'
  | 'enquiry_autoreply'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_pending_stuck'
  | 'booking_reminder'
  | 'system_error';

/** Línea de desglose ya formateada para el email (el dinero llega en céntimos). */
export type EmailPriceLine = { label: string; amountCents: number };

export type EnquiryPayload = {
  campName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  dateFrom?: string;
  dateTo?: string;
  persons?: number;
  message: string;
};

export type BookingPayload = {
  campName: string;
  code: string;
  holderName: string;
  dateFrom: string;
  dateTo: string;
  nights: number;
  persons: number;
  unitTypeName: string;
  lines: EmailPriceLine[];
  totalCents: number;
  touristTaxCents: number;
  currency: string;
  /** URL de gestión (ver/cancelar/modificar) */
  manageUrl?: string;
  /** solo booking_cancelled: reembolso previsto */
  refundCents?: number;
};

/**
 * Aviso técnico al buzón de la casa (ADR 0026 §3): "algo ha reventado".
 *
 * Deliberadamente NO lleva ni el mensaje del error ni el stack. El correo sale
 * del sistema y puede acabar en cualquier bandeja: lo que viaja es la
 * REFERENCIA, y el detalle se queda en el log del servidor bajo esa misma
 * referencia. Quien mantiene el sistema cruza una con otro.
 */
export type SystemErrorPayload = {
  campName: string;
  /** identificador de correlación — el mismo que ha visto el cliente y el del log */
  ref: string;
  /** identificador del suceso en snake_case (p. ej. `unhandled_error`) */
  event: string;
  /** método y patrón de ruta donde ha fallado, sin querystring ni identificadores */
  route: string;
  /** ISO del momento del fallo */
  occurredAt: string;
  /** cuántos avisos iguales se callaron en la ventana anterior (cortafuegos del buzón) */
  suppressed: number;
};

export type NotificationPayload =
  | { kind: 'enquiry_received'; data: EnquiryPayload }
  | { kind: 'enquiry_autoreply'; data: EnquiryPayload }
  | { kind: 'booking_confirmed'; data: BookingPayload }
  | { kind: 'booking_cancelled'; data: BookingPayload }
  | { kind: 'booking_pending_stuck'; data: BookingPayload }
  | { kind: 'booking_reminder'; data: BookingPayload }
  | { kind: 'system_error'; data: SystemErrorPayload };

export type EmailMessage = { subject: string; html: string; text: string };

export type SendResult = { ok: true; id?: string } | { ok: false; error: string };

/** Contrato de envío: Resend hoy, lo que haga falta mañana. */
export type EmailSender = (input: {
  from: string;
  to: string;
  replyTo?: string;
  message: EmailMessage;
}) => Promise<SendResult>;

/** Config por tenant (vive en tenants.modules.notifications). */
export type NotificationsConfig = {
  /** on/off por evento SIN deploy (criterio de fase) */
  enabled?: Partial<Record<NotificationKind, boolean>>;
  /** remitente del tenant (dominio verificado en Resend) */
  from?: string;
  /** buzón del camping para avisos internos */
  notifyTo?: string;
};
