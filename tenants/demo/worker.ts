/**
 * Punto de entrada del Worker del tenant `demo` (ADR 0013). Envuelve el
 * Worker genérico de `@logic-camp/api` sin tocarlo — SOLO aquí, dentro de
 * `tenants/demo/`, viven el reset nocturno y la puerta de acceso anónimo
 * (ADR 0029): ningún camping real (que sigue apuntando `main` a
 * `apps/api/src/index.ts` directamente) carga un byte de este fichero ni de
 * los datos ficticios de Cala Sereno.
 */
import apiWorker, { type Bindings } from '@logic-camp/api';
import { resetDemoData } from './reset';
import { DEMO_LOGIN } from './seed';

// distinto del cron de purga de holds cada 15 min (ADR 0007), que sigue igual
const RESET_CRON = '0 3 * * *';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Reenvía al Worker genérico conservando la IP real para su rate limit. */
function interna(request: Request, path: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('cf-connecting-ip', ip);
  return new Request(new URL(path, request.url), { ...init, headers });
}

/**
 * Las tres rutas de la demo (ADR 0029 §4). Devuelve `null` si la petición no es
 * de ninguna de ellas, y entonces sigue su camino hacia el Worker genérico.
 *
 * Todas viven bajo `/api/demo`, un prefijo que la API genérica no usa: en el
 * Worker de un camping real este código ni siquiera está, así que `GET /api/demo`
 * allí es un 404 — y eso es exactamente lo que el dashboard lee como "aquí no
 * hay acceso de demostración", sin necesidad de ningún flag de build.
 */
async function rutasDemo(
  request: Request,
  env: Bindings,
  ctx: ExecutionContext,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);

  // Sonda de capacidad: lo único que el dashboard necesita para decidir si
  // pinta el botón "Ver la demo".
  if (pathname === '/api/demo' && request.method === 'GET') {
    return json({ enabled: true });
  }

  // La puerta. No inventa mecanismo de sesión ninguno: reenvía al sign-in de
  // Better Auth con las credenciales sembradas y devuelve SU respuesta, con su
  // Set-Cookie. Lo que sale es una sesión normal y revocable (ADR 0005), y la
  // contraseña no ha salido del Worker.
  if (pathname === '/api/demo/sign-in' && request.method === 'POST') {
    return apiWorker.fetch(
      interna(request, '/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(DEMO_LOGIN),
      }),
      env,
      ctx,
    );
  }

  // Restablecer los datos: la MISMA función del cron nocturno, sin duplicar
  // nada. Exige sesión válida — no es una barrera de seguridad seria y no
  // pretende serlo: es el pestillo que impide que un desconocido con `curl`
  // deje la demo en un bucle de wipes sin haber entrado siquiera.
  if (pathname === '/api/demo/reset' && request.method === 'POST') {
    const cookie = request.headers.get('cookie');
    if (!cookie) return json({ error: 'unauthorized' }, 401);
    const sesion = await apiWorker.fetch(
      interna(request, '/api/auth/get-session', { method: 'GET', headers: { cookie } }),
      env,
      ctx,
    );
    const cuerpo: unknown = sesion.ok ? await sesion.json().catch(() => null) : null;
    const hayUsuario =
      typeof cuerpo === 'object' && cuerpo !== null && 'user' in cuerpo && cuerpo.user !== null;
    if (!hayUsuario) return json({ error: 'unauthorized' }, 401);

    await resetDemoData(env.DB);
    // El wipe incluye `sessions`: la sesión de quien acaba de pulsar el botón
    // ya no existe. El cliente tiene que volver a entrar por la puerta, y se
    // le dice aquí para que eso no dependa de que alguien lo recuerde.
    return json({ ok: true, sessionInvalidated: true });
  }

  return null;
}

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    // misma doble guarda que el cron: el tenant correcto Y la ruta correcta
    if (env.TENANT_SLUG === 'demo') {
      const res = await rutasDemo(request, env, ctx);
      if (res) return res;
    }
    return apiWorker.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledController, env: Bindings): Promise<void> {
    await apiWorker.scheduled(event, env);
    // doble guarda: el cron correcto Y el tenant correcto, aunque este
    // fichero nunca se referencia desde el wrangler.jsonc de otro tenant.
    if (event.cron === RESET_CRON && env.TENANT_SLUG === 'demo') {
      await resetDemoData(env.DB);
    }
  },
};
