/**
 * Textos del dashboard vía diccionario desde el día 1 (regla del contrato).
 * Arranca en es (la usuaria es la recepcionista); añadir un idioma = un objeto más.
 */
const es = {
  'app.nombre': 'Logic Camp',
  'app.cerrarSesion': 'Salir',
  'login.titulo': 'Entrar al mostrador',
  'login.email': 'Email',
  'login.password': 'Contraseña',
  'login.entrar': 'Entrar',
  'login.entrando': 'Entrando…',
  'login.error': 'Email o contraseña incorrectos.',
  'nav.planning': 'Planning',
  'planning.hoy': 'Hoy',
  'planning.semana': 'Semana',
  'planning.mes': 'Mes',
  'planning.temporada': 'Temporada',
  'planning.unidades': '{n} unidades',
  'planning.reservas': '{n} reservas a la vista',
  'planning.sinAsignar': 'Sin asignar',
  'planning.cargando': 'Cargando el planning…',
  'planning.error': 'No se ha podido cargar el planning.',
  'planning.pax': '{n} pax',
  'planning.reasignada': 'Reserva movida a {unit}.',
  'planning.reasignarError': 'No se ha podido reasignar (solape o estado): se ha restaurado.',
  'estado.pending': 'Pendiente',
  'estado.confirmed': 'Confirmada',
  'estado.no_show': 'No presentada',
  'estado.completed': 'Completada',
  'bloqueo.maintenance': 'Mantenimiento',
  'bloqueo.owner': 'Propietario',
  'bloqueo.longstay': 'Larga estancia',
  'bloqueo.manual': 'Manual',
} as const;

type Key = keyof typeof es;

export function t(key: Key, vars?: Record<string, string | number>): string {
  const raw: string = es[key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : raw;
}
