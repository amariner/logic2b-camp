import { secureHeaders } from 'hono/secure-headers';

/**
 * Cabeceras comunes a todas las respuestas del Worker.
 *
 * La web estática no atraviesa este middleware (`assets.run_worker_first` solo
 * incluye `/api/*`), por eso el mismo contrato vive también en
 * `apps/site/public/_headers` y se verifica al construir el artefacto.
 *
 * No activamos COOP/CORP/COEP: endurecerían el aislamiento del documento, pero
 * también podrían romper pasarelas de pago y recursos externos cuando se
 * activen. Ese cambio necesita probar cada integración real, no hacerse a
 * ciegas en esta auditoría.
 */
export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000',
  xContentTypeOptions: true,
  xDnsPrefetchControl: false,
  xDownloadOptions: false,
  xFrameOptions: 'DENY',
  xPermittedCrossDomainPolicies: false,
  xXssProtection: false,
  permissionsPolicy: { camera: [], geolocation: [], microphone: [] },
});
