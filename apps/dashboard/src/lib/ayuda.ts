/**
 * Ayuda contextual: pantalla → su página de la guía (ADR 0025 §5).
 *
 * Las guías son del PRODUCTO, no del tenant: se escriben una vez y sirven a todos
 * los campings. Por eso la URL es ABSOLUTA contra camp.logic2b.com y no relativa al
 * dominio del camping — si cada tenant sirviera su copia, dar de alta uno nuevo
 * incluiría "desplegar y mantener su documentación", que es justo lo prohibido.
 *
 * El mapa vive AQUÍ y solo aquí: así se ve de un vistazo qué pantalla se quedó sin
 * documentar, en vez de tener que abrir las doce.
 */
export const DOCS_BASE = 'https://camp.logic2b.com/docs';

/**
 * `null` = pantalla todavía sin página propia en la guía. No se inventa un enlace
 * aproximado: el botón simplemente no se pinta. Un `?` que lleva a un sitio que no
 * responde la pregunta es peor que no tener `?`.
 */
const MAPA: Record<string, string | null> = {
  '/': 'recepcion/planning',
  '/plano': 'recepcion/plano',
  '/llegadas': 'recepcion/el-dia',
  '/solicitudes': 'recepcion/solicitudes',
  '/reservas': 'recepcion/nueva-reserva',
  '/clientes': 'recepcion/huespedes',
  '/inventario': 'recepcion/bloqueos',
  '/pagos': 'recepcion/cobrar',
  '/notificaciones': 'recepcion/problemas',
  // Pantallas de gestión (gerencia/dirección), fuera del alcance de la guía de
  // recepción de C6. Pendientes en BACKLOG.
  '/informes': null,
  '/tarifas': null,
  '/ajustes': null,
};

/**
 * URL de ayuda de una ruta, o `null` si esa pantalla no tiene página.
 * Las rutas con parámetro (`/reservas/abc123`) heredan la de su lista.
 */
export function ayudaDe(pathname: string): string | null {
  const raiz = '/' + (pathname.split('/')[1] ?? '');
  const destino = MAPA[pathname] ?? MAPA[raiz] ?? null;
  return destino ? `${DOCS_BASE}/${destino}/` : null;
}
