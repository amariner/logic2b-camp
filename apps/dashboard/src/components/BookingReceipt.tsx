/**
 * Recibo/ticket imprimible del check-out (BACKLOG C4→C4.3): el desglose auditable
 * y los cobros de la ficha en una hoja limpia que la recepcionista imprime y
 * entrega al huésped al cerrar la cuenta. Reutiliza el patrón `@media print` de
 * la web (`.lc-print`), aquí adaptado al dashboard.
 *
 * Se monta con un portal a `document.body` (hermano de `#root`) y vive oculto en
 * pantalla (`.lc-receipt { display:none }`); al imprimir, `#root` se oculta y el
 * recibo pasa a `block` (ver `styles.css`). Así no hay que teñir el planning para
 * imprimir ni pelear con contenedores posicionados.
 *
 * Presentacional puro: no llama a la API. Todo llega ya cargado desde la ficha.
 */
import { createPortal } from 'react-dom';
import type { BookingDetail } from '../api';
import { t } from '../i18n';
import { conceptLabel, eur, fecha, noches } from '../lib/format';

export default function BookingReceipt({
  data,
  establishment,
}: {
  data: BookingDetail;
  establishment: string | null;
}) {
  const n = noches(data.dateFrom, data.dateTo);
  const pax = data.occupancy.adults + data.occupancy.childrenAges.length;
  const pendingCents = data.totalCents - data.paidCents;
  const lead = data.guests.find((g) => g.isLead) ?? data.guests[0] ?? null;
  const currency = data.priceBreakdown.currency;
  // fecha de emisión = hoy (runtime del navegador, no el sandbox de workflows)
  const emitted = fecha(new Date().toISOString());

  return createPortal(
    <div className="lc-receipt" aria-hidden="true">
      <div className="lc-receipt-box">
        <header className="lc-receipt-head">
          <div>
            {establishment && <p className="lc-receipt-estab">{establishment}</p>}
            <h1 className="lc-receipt-title">{t('recibo.titulo')}</h1>
          </div>
          <p className="lc-receipt-meta">
            {t('recibo.reserva')} <strong>{data.code}</strong>
            <br />
            {t('recibo.emitido', { fecha: emitted })}
          </p>
        </header>

        {lead && (
          <p className="lc-receipt-line">
            {t('recibo.titular')}:{' '}
            <strong>
              {[lead.name, lead.surname, lead.secondSurname].filter(Boolean).join(' ')}
            </strong>
          </p>
        )}

        <table className="lc-receipt-table lc-receipt-stay">
          <tbody>
            <tr>
              <th scope="row">{t('ficha.fechas')}</th>
              <td>
                {fecha(data.dateFrom)} → {fecha(data.dateTo)} ·{' '}
                {n === 1 ? t('ficha.noche') : t('ficha.noches', { n })}
              </td>
            </tr>
            <tr>
              <th scope="row">{t('ficha.unidad')}</th>
              <td>{data.unitCode ?? t('ficha.sinAsignar')}</td>
            </tr>
            <tr>
              <th scope="row">{t('ficha.ocupacion')}</th>
              <td>
                {t('planning.pax', { n: pax })} · {data.occupancy.adults}A
                {data.occupancy.childrenAges.length > 0 &&
                  ` + ${data.occupancy.childrenAges.length}N`}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="lc-receipt-h">{t('ficha.desglose')}</h2>
        <table className="lc-receipt-table">
          <tbody>
            {data.priceBreakdown.lines.map((line, i) => (
              <tr key={i}>
                <td>{conceptLabel(line.concept)}</td>
                <td className="lc-receipt-num">{eur(line.amountCents, currency)}</td>
              </tr>
            ))}
            <tr className="lc-receipt-total">
              <td>{t('ficha.total')}</td>
              <td className="lc-receipt-num">{eur(data.totalCents, currency)}</td>
            </tr>
            {data.touristTaxCents > 0 && (
              <tr>
                <td>{t('ficha.tasa')}</td>
                <td className="lc-receipt-num">{eur(data.touristTaxCents, currency)}</td>
              </tr>
            )}
            {data.depositCents > 0 && (
              <tr>
                <td>{t('ficha.fianza')}</td>
                <td className="lc-receipt-num">{eur(data.depositCents, currency)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2 className="lc-receipt-h">{t('ficha.pagos')}</h2>
        <table className="lc-receipt-table">
          <tbody>
            {data.payments.length === 0 && (
              <tr>
                <td colSpan={2}>{t('ficha.sinPagos')}</td>
              </tr>
            )}
            {data.payments.map((p) => (
              <tr key={p.id}>
                <td>
                  {t(`pago.${p.provider}`)} · {t(`pago.${p.status}`)} · {fecha(p.createdAt)}
                </td>
                <td className="lc-receipt-num">{eur(p.amountCents, currency)}</td>
              </tr>
            ))}
            <tr className="lc-receipt-total">
              <td>{t('ficha.pagado')}</td>
              <td className="lc-receipt-num">{eur(data.paidCents, currency)}</td>
            </tr>
            {pendingCents > 0 && (
              <tr className="lc-receipt-pending">
                <td>{t('ficha.pendientePago')}</td>
                <td className="lc-receipt-num">{eur(pendingCents, currency)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="lc-receipt-foot">{t('recibo.gracias')}</p>
        <p className="lc-receipt-note">{t('recibo.nota')}</p>
      </div>
    </div>,
    document.body,
  );
}
