/** Textos de los emails en los 6 idiomas del producto. Clave plana por plantilla. */
import type { Lang } from './types';

type Dict = Record<string, string>;

const es: Dict = {
  'c.price.base': 'Estancia',
  'c.price.extra_person': 'Personas adicionales',
  'c.price.child': 'Niños',
  'c.price.pet': 'Mascotas',
  'c.price.electricity': 'Electricidad',
  'c.price.vehicle': 'Vehículo adicional',
  'c.discount.early_booking': 'Descuento por reserva anticipada',
  'c.discount.long_stay': 'Descuento por estancia larga',
  'c.discount.acsi': 'Descuento ACSI',
  'enq.subject': 'Nueva solicitud de {name}',
  'enq.title': 'Nueva solicitud recibida',
  'enq.intro': 'Ha entrado una solicitud por la web. Está guardada en la bandeja del panel.',
  'enq.contact': 'Contacto',
  'enq.dates': 'Fechas solicitadas',
  'enq.persons': 'Personas',
  'enq.message': 'Mensaje',
  'auto.subject': 'Hemos recibido tu solicitud — {camp}',
  'auto.title': 'Gracias por tu solicitud',
  'auto.intro':
    'La hemos recibido correctamente y te responderemos lo antes posible. Este es un resumen de lo que nos has enviado.',
  'bkg.subject': 'Reserva confirmada {code} — {camp}',
  'bkg.title': 'Tu reserva está confirmada',
  'bkg.intro':
    'Gracias por reservar con nosotros. Guarda este email: contiene tu código de reserva.',
  'bkg.code': 'Código',
  'bkg.stay': 'Estancia',
  'bkg.nights': '{n} noches',
  'bkg.type': 'Alojamiento',
  'bkg.persons': 'Personas',
  'bkg.breakdown': 'Desglose',
  'bkg.total': 'Total',
  'bkg.tax': 'Tasa turística (se liquida en recepción)',
  'bkg.manage': 'Ver o gestionar la reserva',
  'cnl.subject': 'Reserva {code} cancelada — {camp}',
  'cnl.title': 'Tu reserva ha sido cancelada',
  'cnl.intro': 'Confirmamos la cancelación. Si no la has pedido tú, contesta a este email.',
  'stk.subject': 'Reserva {code} pendiente de pago sin confirmar — {camp}',
  'stk.title': 'Reserva pendiente sin confirmar',
  'stk.intro':
    'Esta reserva lleva más de dos horas esperando el pago, sin cobro ni cancelación. Puede que el cliente haya abandonado el pago — revisa si hace falta contactarlo o liberar la plaza.',
  'stk.holder': 'Titular',
  'rem.subject': 'Te esperamos mañana — {camp}',
  'rem.title': 'Tu llegada es mañana',
  'rem.intro': 'Estamos deseando recibirte. Aquí tienes un recordatorio de tu reserva.',
  'cnl.refund': 'Reembolso previsto',
  'sys.subject': 'Aviso técnico — {camp}',
  'sys.title': 'Algo ha fallado en el sistema',
  'sys.intro':
    'Una petición ha terminado en error. Puede que un cliente no haya podido completar lo que estaba haciendo. Pasa esta referencia a quien lleve el mantenimiento: con ella se localiza el detalle exacto.',
  'sys.ref': 'Referencia',
  'sys.route': 'Dónde',
  'sys.when': 'Cuándo',
  'sys.more': 'Fallos iguales silenciados',
  'sys.hint':
    'Este aviso no incluye el detalle técnico a propósito: viaja por email y podría contener datos internos. El detalle queda en el registro del servidor, con esta misma referencia.',
  'common.footer': 'Este email se ha enviado automáticamente desde {camp}.',
};

const ca: Dict = {
  'c.price.base': 'Estada',
  'c.price.extra_person': 'Persones addicionals',
  'c.price.child': 'Nens',
  'c.price.pet': 'Mascotes',
  'c.price.electricity': 'Electricitat',
  'c.price.vehicle': 'Vehicle addicional',
  'c.discount.early_booking': 'Descompte per reserva anticipada',
  'c.discount.long_stay': 'Descompte per estada llarga',
  'c.discount.acsi': 'Descompte ACSI',
  'enq.subject': 'Nova sol·licitud de {name}',
  'enq.title': 'Nova sol·licitud rebuda',
  'enq.intro': 'Ha entrat una sol·licitud pel web. Està guardada a la safata del panell.',
  'enq.contact': 'Contacte',
  'enq.dates': 'Dates sol·licitades',
  'enq.persons': 'Persones',
  'enq.message': 'Missatge',
  'auto.subject': 'Hem rebut la teva sol·licitud — {camp}',
  'auto.title': 'Gràcies per la teva sol·licitud',
  'auto.intro':
    "L'hem rebut correctament i et respondrem al més aviat possible. Aquest és un resum del que ens has enviat.",
  'bkg.subject': 'Reserva confirmada {code} — {camp}',
  'bkg.title': 'La teva reserva està confirmada',
  'bkg.intro':
    'Gràcies per reservar amb nosaltres. Guarda aquest email: conté el teu codi de reserva.',
  'bkg.code': 'Codi',
  'bkg.stay': 'Estada',
  'bkg.nights': '{n} nits',
  'bkg.type': 'Allotjament',
  'bkg.persons': 'Persones',
  'bkg.breakdown': 'Desglossament',
  'bkg.total': 'Total',
  'bkg.tax': 'Taxa turística (es liquida a recepció)',
  'bkg.manage': 'Veure o gestionar la reserva',
  'cnl.subject': 'Reserva {code} cancel·lada — {camp}',
  'cnl.title': 'La teva reserva ha estat cancel·lada',
  'cnl.intro': "Confirmem la cancel·lació. Si no l'has demanat tu, respon a aquest email.",
  'stk.subject': 'Reserva {code} pendent de pagament sense confirmar — {camp}',
  'stk.title': 'Reserva pendent sense confirmar',
  'stk.intro':
    'Aquesta reserva porta més de dues hores esperant el pagament, sense cobrament ni cancel·lació. Pot ser que el client hagi abandonat el pagament — revisa si cal contactar-lo o alliberar la plaça.',
  'stk.holder': 'Titular',
  'rem.subject': "T'esperem demà — {camp}",
  'rem.title': 'La teva arribada és demà',
  'rem.intro': "Tenim moltes ganes de rebre't. Aquí tens un recordatori de la teva reserva.",
  'cnl.refund': 'Reemborsament previst',
  'sys.subject': 'Avís tècnic — {camp}',
  'sys.title': 'Alguna cosa ha fallat al sistema',
  'sys.intro':
    'Una petició ha acabat en error. Pot ser que un client no hagi pogut completar el que estava fent. Passa aquesta referència a qui porti el manteniment: amb ella es localitza el detall exacte.',
  'sys.ref': 'Referència',
  'sys.route': 'On',
  'sys.when': 'Quan',
  'sys.more': 'Errors iguals silenciats',
  'sys.hint':
    'Aquest avís no inclou el detall tècnic a propòsit: viatja per email i podria contenir dades internes. El detall queda al registre del servidor, amb aquesta mateixa referència.',
  'common.footer': "Aquest email s'ha enviat automàticament des de {camp}.",
};

const en: Dict = {
  'c.price.base': 'Stay',
  'c.price.extra_person': 'Extra persons',
  'c.price.child': 'Children',
  'c.price.pet': 'Pets',
  'c.price.electricity': 'Electricity',
  'c.price.vehicle': 'Extra vehicle',
  'c.discount.early_booking': 'Early booking discount',
  'c.discount.long_stay': 'Long stay discount',
  'c.discount.acsi': 'ACSI discount',
  'enq.subject': 'New enquiry from {name}',
  'enq.title': 'New enquiry received',
  'enq.intro': 'An enquiry has arrived from the website. It is saved in the panel inbox.',
  'enq.contact': 'Contact',
  'enq.dates': 'Requested dates',
  'enq.persons': 'Guests',
  'enq.message': 'Message',
  'auto.subject': 'We received your enquiry — {camp}',
  'auto.title': 'Thank you for your enquiry',
  'auto.intro':
    'We have received it and will get back to you as soon as possible. Here is a summary of what you sent us.',
  'bkg.subject': 'Booking confirmed {code} — {camp}',
  'bkg.title': 'Your booking is confirmed',
  'bkg.intro': 'Thank you for booking with us. Keep this email: it contains your booking code.',
  'bkg.code': 'Code',
  'bkg.stay': 'Stay',
  'bkg.nights': '{n} nights',
  'bkg.type': 'Accommodation',
  'bkg.persons': 'Guests',
  'bkg.breakdown': 'Breakdown',
  'bkg.total': 'Total',
  'bkg.tax': 'Tourist tax (paid at reception)',
  'bkg.manage': 'View or manage your booking',
  'cnl.subject': 'Booking {code} cancelled — {camp}',
  'cnl.title': 'Your booking has been cancelled',
  'cnl.intro': 'We confirm the cancellation. If you did not request it, reply to this email.',
  'stk.subject': 'Booking {code} pending payment, unconfirmed — {camp}',
  'stk.title': 'Unconfirmed pending booking',
  'stk.intro':
    'This booking has been waiting for payment for over two hours, with no charge or cancellation. The guest may have abandoned checkout — check if it needs a follow-up or the spot should be released.',
  'stk.holder': 'Holder',
  'rem.subject': 'See you tomorrow — {camp}',
  'rem.title': 'Your arrival is tomorrow',
  'rem.intro': "We can't wait to welcome you. Here's a reminder of your booking.",
  'cnl.refund': 'Expected refund',
  'sys.subject': 'Technical alert — {camp}',
  'sys.title': 'Something failed in the system',
  'sys.intro':
    'A request ended in an error. A guest may not have been able to finish what they were doing. Pass this reference to whoever handles maintenance: it pinpoints the exact detail.',
  'sys.ref': 'Reference',
  'sys.route': 'Where',
  'sys.when': 'When',
  'sys.more': 'Identical failures silenced',
  'sys.hint':
    'This alert deliberately omits the technical detail: it travels by email and could carry internal data. The detail stays in the server log, under this same reference.',
  'common.footer': 'This email was sent automatically from {camp}.',
};

const fr: Dict = {
  'c.price.base': 'Séjour',
  'c.price.extra_person': 'Personnes supplémentaires',
  'c.price.child': 'Enfants',
  'c.price.pet': 'Animaux',
  'c.price.electricity': 'Électricité',
  'c.price.vehicle': 'Véhicule supplémentaire',
  'c.discount.early_booking': 'Remise réservation anticipée',
  'c.discount.long_stay': 'Remise long séjour',
  'c.discount.acsi': 'Remise ACSI',
  'enq.subject': 'Nouvelle demande de {name}',
  'enq.title': 'Nouvelle demande reçue',
  'enq.intro': 'Une demande est arrivée depuis le site. Elle est enregistrée dans le panneau.',
  'enq.contact': 'Contact',
  'enq.dates': 'Dates demandées',
  'enq.persons': 'Personnes',
  'enq.message': 'Message',
  'auto.subject': 'Nous avons bien reçu votre demande — {camp}',
  'auto.title': 'Merci pour votre demande',
  'auto.intro':
    'Nous l’avons bien reçue et vous répondrons au plus vite. Voici un résumé de votre envoi.',
  'bkg.subject': 'Réservation confirmée {code} — {camp}',
  'bkg.title': 'Votre réservation est confirmée',
  'bkg.intro':
    'Merci d’avoir réservé chez nous. Conservez cet email : il contient votre code de réservation.',
  'bkg.code': 'Code',
  'bkg.stay': 'Séjour',
  'bkg.nights': '{n} nuits',
  'bkg.type': 'Hébergement',
  'bkg.persons': 'Personnes',
  'bkg.breakdown': 'Détail',
  'bkg.total': 'Total',
  'bkg.tax': 'Taxe de séjour (réglée à la réception)',
  'bkg.manage': 'Voir ou gérer la réservation',
  'cnl.subject': 'Réservation {code} annulée — {camp}',
  'cnl.title': 'Votre réservation a été annulée',
  'cnl.intro':
    'Nous confirmons l’annulation. Si vous n’en êtes pas à l’origine, répondez à cet email.',
  'stk.subject': 'Réservation {code} en attente de paiement, non confirmée — {camp}',
  'stk.title': 'Réservation en attente non confirmée',
  'stk.intro':
    "Cette réservation attend le paiement depuis plus de deux heures, sans encaissement ni annulation. Le client a peut-être abandonné le paiement — vérifiez s'il faut le relancer ou libérer l'emplacement.",
  'stk.holder': 'Titulaire',
  'rem.subject': 'À demain — {camp}',
  'rem.title': 'Votre arrivée est demain',
  'rem.intro': 'Nous avons hâte de vous accueillir. Voici un rappel de votre réservation.',
  'cnl.refund': 'Remboursement prévu',
  'sys.subject': 'Alerte technique — {camp}',
  'sys.title': 'Une erreur est survenue dans le système',
  'sys.intro':
    "Une requête s'est terminée en erreur. Un client n'a peut-être pas pu finir ce qu'il faisait. Transmettez cette référence à la personne chargée de la maintenance : elle permet de retrouver le détail exact.",
  'sys.ref': 'Référence',
  'sys.route': 'Où',
  'sys.when': 'Quand',
  'sys.more': 'Erreurs identiques masquées',
  'sys.hint':
    'Cette alerte omet volontairement le détail technique : elle circule par email et pourrait contenir des données internes. Le détail reste dans le journal du serveur, sous cette même référence.',
  'common.footer': 'Cet email a été envoyé automatiquement depuis {camp}.',
};

const de: Dict = {
  'c.price.base': 'Aufenthalt',
  'c.price.extra_person': 'Zusätzliche Personen',
  'c.price.child': 'Kinder',
  'c.price.pet': 'Haustiere',
  'c.price.electricity': 'Strom',
  'c.price.vehicle': 'Zusätzliches Fahrzeug',
  'c.discount.early_booking': 'Frühbucherrabatt',
  'c.discount.long_stay': 'Langzeitrabatt',
  'c.discount.acsi': 'ACSI-Rabatt',
  'enq.subject': 'Neue Anfrage von {name}',
  'enq.title': 'Neue Anfrage eingegangen',
  'enq.intro':
    'Über die Website ist eine Anfrage eingegangen. Sie liegt im Posteingang des Panels.',
  'enq.contact': 'Kontakt',
  'enq.dates': 'Gewünschte Daten',
  'enq.persons': 'Personen',
  'enq.message': 'Nachricht',
  'auto.subject': 'Wir haben Ihre Anfrage erhalten — {camp}',
  'auto.title': 'Vielen Dank für Ihre Anfrage',
  'auto.intro':
    'Wir haben sie erhalten und melden uns so schnell wie möglich. Hier eine Zusammenfassung Ihrer Angaben.',
  'bkg.subject': 'Buchung bestätigt {code} — {camp}',
  'bkg.title': 'Ihre Buchung ist bestätigt',
  'bkg.intro':
    'Danke für Ihre Buchung. Bewahren Sie diese E-Mail auf: Sie enthält Ihren Buchungscode.',
  'bkg.code': 'Code',
  'bkg.stay': 'Aufenthalt',
  'bkg.nights': '{n} Nächte',
  'bkg.type': 'Unterkunft',
  'bkg.persons': 'Personen',
  'bkg.breakdown': 'Aufstellung',
  'bkg.total': 'Gesamt',
  'bkg.tax': 'Kurtaxe (an der Rezeption zu zahlen)',
  'bkg.manage': 'Buchung ansehen oder verwalten',
  'cnl.subject': 'Buchung {code} storniert — {camp}',
  'cnl.title': 'Ihre Buchung wurde storniert',
  'cnl.intro':
    'Wir bestätigen die Stornierung. Falls Sie sie nicht veranlasst haben, antworten Sie auf diese E-Mail.',
  'stk.subject': 'Buchung {code} wartet auf Zahlung, unbestätigt — {camp}',
  'stk.title': 'Unbestätigte ausstehende Buchung',
  'stk.intro':
    'Diese Buchung wartet seit über zwei Stunden auf die Zahlung, ohne Abbuchung oder Stornierung. Der Gast hat die Zahlung möglicherweise abgebrochen — prüfen Sie, ob eine Nachfrage nötig ist oder der Platz freigegeben werden soll.',
  'stk.holder': 'Hauptgast',
  'rem.subject': 'Bis morgen — {camp}',
  'rem.title': 'Ihre Anreise ist morgen',
  'rem.intro': 'Wir freuen uns auf Sie. Hier eine Erinnerung an Ihre Buchung.',
  'cnl.refund': 'Voraussichtliche Erstattung',
  'sys.subject': 'Technische Meldung — {camp}',
  'sys.title': 'Im System ist ein Fehler aufgetreten',
  'sys.intro':
    'Eine Anfrage endete mit einem Fehler. Möglicherweise konnte ein Gast seinen Vorgang nicht abschließen. Geben Sie diese Referenz an die Wartung weiter: damit lässt sich das genaue Detail finden.',
  'sys.ref': 'Referenz',
  'sys.route': 'Wo',
  'sys.when': 'Wann',
  'sys.more': 'Gleiche Fehler unterdrückt',
  'sys.hint':
    'Diese Meldung enthält bewusst keine technischen Details: Sie wird per E-Mail versendet und könnte interne Daten enthalten. Das Detail bleibt im Serverprotokoll, unter derselben Referenz.',
  'common.footer': 'Diese E-Mail wurde automatisch von {camp} gesendet.',
};

const nl: Dict = {
  'c.price.base': 'Verblijf',
  'c.price.extra_person': 'Extra personen',
  'c.price.child': 'Kinderen',
  'c.price.pet': 'Huisdieren',
  'c.price.electricity': 'Elektriciteit',
  'c.price.vehicle': 'Extra voertuig',
  'c.discount.early_booking': 'Vroegboekkorting',
  'c.discount.long_stay': 'Langverblijfkorting',
  'c.discount.acsi': 'ACSI-korting',
  'enq.subject': 'Nieuwe aanvraag van {name}',
  'enq.title': 'Nieuwe aanvraag ontvangen',
  'enq.intro':
    'Er is een aanvraag binnengekomen via de website. Ze staat in de inbox van het paneel.',
  'enq.contact': 'Contact',
  'enq.dates': 'Gevraagde data',
  'enq.persons': 'Personen',
  'enq.message': 'Bericht',
  'auto.subject': 'We hebben je aanvraag ontvangen — {camp}',
  'auto.title': 'Bedankt voor je aanvraag',
  'auto.intro':
    'We hebben ze goed ontvangen en antwoorden zo snel mogelijk. Dit is een samenvatting van je bericht.',
  'bkg.subject': 'Boeking bevestigd {code} — {camp}',
  'bkg.title': 'Je boeking is bevestigd',
  'bkg.intro': 'Bedankt voor je boeking. Bewaar deze e-mail: hij bevat je boekingscode.',
  'bkg.code': 'Code',
  'bkg.stay': 'Verblijf',
  'bkg.nights': '{n} nachten',
  'bkg.type': 'Accommodatie',
  'bkg.persons': 'Personen',
  'bkg.breakdown': 'Specificatie',
  'bkg.total': 'Totaal',
  'bkg.tax': 'Toeristenbelasting (te betalen bij de receptie)',
  'bkg.manage': 'Boeking bekijken of beheren',
  'cnl.subject': 'Boeking {code} geannuleerd — {camp}',
  'cnl.title': 'Je boeking is geannuleerd',
  'cnl.intro':
    'We bevestigen de annulering. Heb je die niet aangevraagd, antwoord dan op deze e-mail.',
  'stk.subject': 'Boeking {code} wacht op betaling, onbevestigd — {camp}',
  'stk.title': 'Onbevestigde openstaande boeking',
  'stk.intro':
    'Deze boeking wacht al meer dan twee uur op betaling, zonder afschrijving of annulering. De gast heeft het afrekenen mogelijk afgebroken — controleer of navraag nodig is of de plek vrijgegeven moet worden.',
  'stk.holder': 'Hoofdboeker',
  'rem.subject': 'Tot morgen — {camp}',
  'rem.title': 'Uw aankomst is morgen',
  'rem.intro': 'We kijken ernaar uit u te verwelkomen. Hier een herinnering aan uw boeking.',
  'cnl.refund': 'Verwachte terugbetaling',
  'sys.subject': 'Technische melding — {camp}',
  'sys.title': 'Er is iets misgegaan in het systeem',
  'sys.intro':
    'Een verzoek is op een fout uitgelopen. Mogelijk kon een gast niet afmaken waar hij mee bezig was. Geef deze referentie door aan wie het onderhoud doet: daarmee is het exacte detail terug te vinden.',
  'sys.ref': 'Referentie',
  'sys.route': 'Waar',
  'sys.when': 'Wanneer',
  'sys.more': 'Identieke fouten onderdrukt',
  'sys.hint':
    'Deze melding bevat bewust geen technisch detail: ze reist per e-mail en zou interne gegevens kunnen bevatten. Het detail blijft in het serverlogboek, onder dezelfde referentie.',
  'common.footer': 'Deze e-mail is automatisch verzonden vanuit {camp}.',
};

const DICTS: Record<Lang, Dict> = { es, ca, en, fr, de, nl };

/** Texto de plantilla en el idioma pedido (fallback: es) con placeholders {x}. */
export function tr(lang: string, key: string, vars?: Record<string, string | number>): string {
  const dict = DICTS[lang as Lang] ?? DICTS.es;
  const raw = dict[key] ?? DICTS.es[key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : raw;
}

/** Idioma soportado más cercano (p.ej. 'en-GB' → 'en'; desconocido → 'es'). */
export function normalizeLang(locale: string): Lang {
  const short = locale.slice(0, 2).toLowerCase();
  return (['es', 'ca', 'en', 'fr', 'de', 'nl'] as const).find((l) => l === short) ?? 'es';
}

/** Concepto del desglose → etiqueta del email; extras sin traducción se humanizan. */
export function conceptLabel(lang: string, concept: string): string {
  const direct = tr(lang, `c.${concept}`);
  if (direct !== `c.${concept}`) return direct;
  if (concept.startsWith('extra.'))
    return concept.slice('extra.'.length).replace(/^ext_/, '').replace(/_/g, ' ');
  return concept;
}
