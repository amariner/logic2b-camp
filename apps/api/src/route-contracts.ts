/** Inventario ejecutable de las superficies HTTP propias y delegadas (ADR 0042). */
export type RouteContract = {
  owner: 'logic-camp' | 'better-auth';
  auth: 'none' | 'session' | 'provider-signature';
  validation: 'none' | 'query' | 'body' | 'path' | 'path+body' | 'provider-signature' | 'delegated';
  mutates: boolean;
  idempotency: 'n/a' | 'key' | 'natural' | 'provider-event' | 'none' | 'unspecified';
  rateLimit: 'general' | 'auth' | 'lead' | 'public-write' | 'booking-management' | 'webhook';
};

const read = (auth: RouteContract['auth'] = 'session'): RouteContract => ({
  owner: 'logic-camp',
  auth,
  validation: 'query',
  mutates: false,
  idempotency: 'n/a',
  rateLimit: 'general',
});

const write = (
  auth: RouteContract['auth'] = 'session',
  idempotency: RouteContract['idempotency'] = 'none',
): RouteContract => ({
  owner: 'logic-camp',
  auth,
  validation: 'path+body',
  mutates: true,
  idempotency,
  rateLimit: auth === 'none' ? 'public-write' : 'general',
});

export const ROUTE_CONTRACTS: Record<string, RouteContract> = {
  'GET /health': { ...read('none'), validation: 'none' },
  'GET /api/health': { ...read('none'), validation: 'none' },
  'GET /api/auth/*': {
    owner: 'better-auth',
    auth: 'none',
    validation: 'delegated',
    mutates: false,
    idempotency: 'n/a',
    rateLimit: 'auth',
  },
  'POST /api/auth/*': {
    owner: 'better-auth',
    auth: 'none',
    validation: 'delegated',
    mutates: true,
    idempotency: 'none',
    rateLimit: 'auth',
  },

  'GET /api/availability': read('none'),
  'POST /api/quote': { ...read('none'), validation: 'body' },
  'POST /api/holds': write('none', 'none'),
  'DELETE /api/holds/:id': { ...write('none', 'natural'), validation: 'path' },
  'POST /api/enquiries': write('none', 'none'),
  'POST /api/bookings': write('none', 'key'),
  'GET /api/bookings/:code': read('none'),
  'POST /api/bookings/:code/payment': {
    ...write('none', 'natural'),
    rateLimit: 'booking-management',
  },
  'POST /api/bookings/:code/cancel': {
    ...write('none', 'natural'),
    rateLimit: 'booking-management',
  },
  'POST /api/bookings/:code/modify': {
    ...write('none', 'none'),
    rateLimit: 'booking-management',
  },
  'POST /api/payments/webhook/:provider': {
    ...write('provider-signature', 'provider-event'),
    validation: 'provider-signature',
    rateLimit: 'webhook',
  },
  'POST /api/leads': {
    ...write('none', 'none'),
    validation: 'body',
    rateLimit: 'lead',
  },

  'GET /api/admin/planning': read(),
  'GET /api/admin/catalog': read(),
  'GET /api/admin/map': read(),
  'PATCH /api/admin/units/:id': write(),
  'GET /api/admin/bookings': read(),
  'GET /api/admin/bookings/:id': read(),
  'POST /api/admin/bookings': write('session', 'key'),
  'POST /api/admin/bookings/:id/requote': { ...read(), validation: 'path+body' },
  'PATCH /api/admin/bookings/:id': write(),
  'GET /api/admin/guests': read(),
  'GET /api/admin/guests/:id': read(),
  'GET /api/admin/guests/:id/export': read(),
  'DELETE /api/admin/guests/:id': { ...write('session', 'natural'), validation: 'path' },
  'GET /api/admin/rgpd/retention': read(),
  'GET /api/admin/hospedajes/parte': read(),
  'POST /api/admin/hospedajes/enviar': write(),
  'POST /api/admin/bookings/:id/guests': write(),
  'DELETE /api/admin/bookings/:id/guests/:guestId': {
    ...write('session', 'natural'),
    validation: 'path',
  },
  'PATCH /api/admin/guests/:id': write(),
  'POST /api/admin/blocks': write(),
  'DELETE /api/admin/blocks/:id': { ...write('session', 'natural'), validation: 'path' },
  'GET /api/admin/enquiries': read(),
  'PATCH /api/admin/enquiries/:id': write(),
  'GET /api/admin/notifications': read(),
  'GET /api/admin/payments': read(),
  'GET /api/admin/rates': read(),
  'PUT /api/admin/rates/:id': write(),
  'GET /api/admin/reports': read(),
  'GET /api/admin/settings': read(),
  'PATCH /api/admin/settings': write(),
  'GET /api/admin/users': read(),
  'POST /api/admin/users': write(),
};
