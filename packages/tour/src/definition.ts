export type TourLocale = 'es' | 'en';
type Localized = Record<TourLocale, string>;

export interface GuidedTourStep {
  id: string;
  phase: Localized;
  title: Localized;
  description: Localized;
  evidence: Localized;
  route: Localized;
  target: string;
  finalCta?: { label: Localized; route: Localized };
}

export const CAMP_TOUR_ID = 'camp-como-funciona-v1';

export const CAMP_TOUR_STEPS: readonly GuidedTourStep[] = [
  {
    id: 'entry-models',
    phase: { es: 'La oferta', en: 'The offer' },
    title: { es: 'Tres formas de empezar', en: 'Three ways to get started' },
    description: {
      es: 'Inicial activa una web que recibe solicitudes; Gestión añade reserva directa y el espacio de recepción; Avanzado suma automatización, integraciones e inteligencia supervisada. Puedes crecer sin cambiar de plataforma.',
      en: 'Start launches a website that receives enquiries; Management adds direct booking and the reception workspace; Advanced adds automation, integrations and supervised intelligence. You can grow without changing platform.',
    },
    evidence: {
      es: 'En pantalla: los planes Inicial, Gestión y Avanzado comparan web, operativa y precio en la misma sección.',
      en: 'On screen: Start, Management and Advanced compare website, operations and pricing in the same section.',
    },
    route: { es: '/#precios', en: '/en/#precios' },
    target: '#precios',
  },
  {
    id: 'themes',
    phase: { es: 'La oferta', en: 'The offer' },
    title: { es: 'Tu identidad, no una plantilla', en: 'Your identity, not a template' },
    description: {
      es: 'El tema se personaliza para cada camping: marca, tipografía, color, fotografía y ritmo. La colección ya reúne doce direcciones creadas sobre el mismo motor.',
      en: 'Every campsite gets its own brand, type, colour, photography and rhythm. The collection already contains twelve directions built on the same engine.',
    },
    evidence: {
      es: 'En pantalla: doce demos navegables con identidades y tamaños distintos.',
      en: 'On screen: twelve live demos with different identities and scales.',
    },
    route: { es: '/temas/', en: '/en/temas/' },
    target: '.theme-catalog-grid',
  },
  {
    id: 'medium-site',
    phase: { es: 'Web mediana', en: 'Medium-sized website' },
    title: { es: 'Pinada del Mar', en: 'Pinada del Mar' },
    description: {
      es: 'Esta demo representa un camping costero mediano: contenido propio, alojamientos, instalaciones, tarifas y contacto dentro de una experiencia coherente y responsive.',
      en: 'This demo represents a medium-sized coastal campsite: its own content, stays, facilities, rates and contact experience in one responsive website.',
    },
    evidence: {
      es: 'En pantalla: una web real de demostración para un camping ficticio de 110 unidades.',
      en: 'On screen: a real demo website for a fictional 110-unit campsite.',
    },
    route: { es: '/demos/pinadamar/', en: '/demos/pinadamar/' },
    target: '[data-tour-medium-web]',
  },
  {
    id: 'forms',
    phase: { es: 'Web mediana', en: 'Medium-sized website' },
    title: { es: 'Formularios que llegan al gestor', en: 'Forms connected to management' },
    description: {
      es: 'La solicitud recoge estancia, fechas, grupo y mensaje. En esta demo solo usa datos ficticios: no envía correos ni toca servicios externos, pero sí enseña el recorrido completo.',
      en: 'The enquiry captures stay, dates, party and message. This demo only uses fictional data: it sends no email and touches no external service, while showing the full journey.',
    },
    evidence: {
      es: 'En pantalla: formulario de solicitud con aviso de demostración y acceso directo al gestor.',
      en: 'On screen: an enquiry form with a demo notice and direct access to management.',
    },
    route: { es: '/demos/pinadamar/#contacto', en: '/demos/pinadamar/#contacto' },
    target: '#contacto',
  },
  {
    id: 'admin-home',
    phase: { es: 'El gestor', en: 'Management' },
    title: { es: 'El día, de un vistazo', en: 'The day at a glance' },
    description: {
      es: 'Inicio reúne ocupación, llegadas, salidas, solicitudes recientes y saldo pendiente. Es el punto de partida de recepción antes de entrar en cada panel.',
      en: 'Home brings together occupancy, arrivals, departures, recent enquiries and pending balance before reception opens each workspace.',
    },
    evidence: {
      es: 'En pantalla: indicadores y accesos a los trabajos prioritarios del día.',
      en: 'On screen: indicators and shortcuts for today’s priority work.',
    },
    route: { es: '/demos/pinadamar/gestion/#/', en: '/demos/pinadamar/gestion/#/' },
    target: 'main',
  },
  {
    id: 'admin-planning',
    phase: { es: 'El gestor', en: 'Management' },
    title: { es: 'Planning y plano', en: 'Planning and map' },
    description: {
      es: 'El planning ordena estancias por unidad y fecha; el plano traduce lo mismo al espacio físico. Juntos permiten detectar huecos, bloqueos, entradas y cambios sin hojas paralelas.',
      en: 'Planning organises stays by unit and date; the map translates the same state into physical space, exposing gaps, blocks, arrivals and changes.',
    },
    evidence: {
      es: 'En pantalla: calendario operativo con unidades, estados y reservas visibles.',
      en: 'On screen: an operational calendar with visible units, states and bookings.',
    },
    route: {
      es: '/demos/pinadamar/gestion/#/planning',
      en: '/demos/pinadamar/gestion/#/planning',
    },
    target: 'main',
  },
  {
    id: 'admin-flow',
    phase: { es: 'El gestor', en: 'Management' },
    title: { es: 'Solicitudes, reservas y clientes', en: 'Enquiries, bookings and guests' },
    description: {
      es: 'Solicitudes conserva cada contacto y su estado; Reservas reúne las estancias; Clientes aporta el histórico, y Llegadas concentra las entradas y salidas del día.',
      en: 'Enquiries keeps every contact and status; Bookings gathers stays; Guests adds history, while Arrivals focuses today’s check-ins and departures.',
    },
    evidence: {
      es: 'En pantalla: bandeja con filtros, recuentos y estados de seguimiento.',
      en: 'On screen: an inbox with filters, counts and follow-up states.',
    },
    route: {
      es: '/demos/pinadamar/gestion/#/solicitudes',
      en: '/demos/pinadamar/gestion/#/solicitudes',
    },
    target: 'main',
  },
  {
    id: 'admin-control',
    phase: { es: 'El gestor', en: 'Management' },
    title: { es: 'Informes y control operativo', en: 'Reports and operational control' },
    description: {
      es: 'Informes resume ocupación e ingresos. Parte de viajeros, Inventario y Tarifas completan el control legal, físico y comercial sin duplicar la información.',
      en: 'Reports summarises occupancy and revenue. Guest reporting, Inventory and Rates complete legal, physical and commercial control without duplicating data.',
    },
    evidence: {
      es: 'En pantalla: métricas por periodo y ocupación por tipo de unidad.',
      en: 'On screen: period metrics and occupancy by unit type.',
    },
    route: {
      es: '/demos/pinadamar/gestion/#/informes',
      en: '/demos/pinadamar/gestion/#/informes',
    },
    target: 'main',
  },
  {
    id: 'admin-settings',
    phase: { es: 'El gestor', en: 'Management' },
    title: { es: 'Notificaciones, pagos y ajustes', en: 'Notifications, payments and settings' },
    description: {
      es: 'El último grupo deja trazabilidad de comunicaciones, separa lo cobrado de lo pendiente y centraliza la configuración. La demo es segura: no cobra, publica ni envía nada.',
      en: 'The final group traces communications, separates collected and pending money, and centralises configuration. The demo is safe: it charges, publishes and sends nothing.',
    },
    evidence: {
      es: 'En pantalla: registro de notificaciones con canal, intentos y estado.',
      en: 'On screen: notification log with channel, attempts and status.',
    },
    route: {
      es: '/demos/pinadamar/gestion/#/notificaciones',
      en: '/demos/pinadamar/gestion/#/notificaciones',
    },
    target: 'main',
    finalCta: {
      label: { es: 'Ver planes y alcance', en: 'See plans and scope' },
      route: { es: '/precios/', en: '/en/precios/' },
    },
  },
];

export const TOUR_COPY = {
  es: {
    trigger: 'Ver recorrido',
    resume: 'Reanudar recorrido',
    dialogLabel: 'Elegir cómo conocer Logic2B Campings',
    eyebrow: 'Recorrido del servicio',
    introTitle: 'De la web al trabajo de recepción',
    introText:
      'En menos de 4 minutos verás las tres formas de empezar, cómo personalizamos cada web y cómo una solicitud llega al gestor de un camping mediano.',
    duration: '9 hitos · menos de 4 minutos · datos ficticios',
    guided: 'Visita guiada',
    free: 'Explorar libremente',
    close: 'Salir del recorrido',
    pause: 'Pausar',
    next: 'Siguiente hito',
    continue: 'Seguir explorando',
    progress: 'Progreso del recorrido',
    step: 'Hito',
    visibleEvidence: 'Qué estás viendo',
  },
  en: {
    trigger: 'View tour',
    resume: 'Resume tour',
    dialogLabel: 'Choose how to explore Logic2B Campings',
    eyebrow: 'Service tour',
    introTitle: 'From the website to reception work',
    introText:
      'In under 4 minutes, see three ways to start, how every website is personalised, and how an enquiry reaches a medium-sized campsite’s management area.',
    duration: '9 milestones · under 4 minutes · fictional data',
    guided: 'Guided tour',
    free: 'Explore freely',
    close: 'Exit tour',
    pause: 'Pause',
    next: 'Next milestone',
    continue: 'Keep exploring',
    progress: 'Tour progress',
    step: 'Milestone',
    visibleEvidence: 'What you are seeing',
  },
} as const;

export function tourLocale(value: string | undefined): TourLocale {
  return value?.toLowerCase().startsWith('en') ? 'en' : 'es';
}
