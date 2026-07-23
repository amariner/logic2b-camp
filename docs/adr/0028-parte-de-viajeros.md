# 0028 — Parte de viajeros (SES.Hospedajes / RD 933/2021)

- **Fecha**: 2026-07-23
- **Fase**: propia (post-Fase 11 — el hueco funcional mayor para un camping español real)
- **Estado**: aceptado (validado por Andreu, sesión 43, 2026-07-23)

## Contexto

El RD 933/2021 obliga a todo alojamiento a comunicar a SES.Hospedajes los datos de
identidad de sus viajeros y el registro documental de la operación (estancia y medio
de pago). Hoy Logic Camp **captura el núcleo** de lo que el parte necesita — el hueco
es sobre todo de salida, pero **no solo**:

- `guests` (packages/db/src/schema.ts:263): name, surname, docType (dni|nie|passport|other),
  docNumber, birthdate, nationality, email, phone, address + sellos RGPD.
  La ficha los edita desde ADR 0022.
- `bookings`: dateFrom/dateTo, checkedInAt, channel, `price_breakdown` y `payments`.
- La retención ya respeta el plazo: `RETENTION.travellerRegistryYears = 3`
  (packages/core/src/retention.ts) y la supresión niega con fecha (ADR 0026 §2.2).
  **Esta fase no toca retención.**

**Dos huecos honestos que este ADR reconoce por adelantado** (no se cierran de
memoria; se confirman contra la especificación oficial del webservice):

1. **Faltan casi con seguridad columnas de captura.** El parte SES suele exigir campos
   que hoy no existen en `guests`: sexo, segundo apellido, **fecha y país de expedición
   del documento**, y para menores de 14 el **parentesco** con el acompañante. Cuando
   se confirmen, se añaden como **columnas nulables aditivas** con su migración
   (`0006`) y la ficha se amplía. Es decir: el alcance real es salida **+** unas pocas
   columnas + ampliar la ficha, no solo salida.
2. **El medio de pago NO se puede derivar del proveedor.** `payments.provider` es
   `'stripe' | 'redsys' | 'manual' | 'none'` — el proveedor, no el medio: `manual`
   puede ser efectivo o transferencia; `stripe`/`redsys` son tarjeta pero no siempre.
   Si SES exige el medio de pago como dato tipado, **hay que capturarlo explícitamente**,
   no inferirlo.

Restricciones: ~6h/semana; nada que multiplique trabajo por camping (el alta de un
camping nuevo debe seguir costando una tarde: su código de establecimiento y
credenciales son config, no código). No hay credenciales reales de SES.Hospedajes en
esta sesión, y **no se inventa el formato oficial de memoria**: este ADR fija la
arquitectura; los campos exactos del XML se cierran contra la especificación oficial
del webservice cuando se implemente el adaptador de envío.

## Decisión

**Espejar PaymentProvider (ADR 0011)**: paquete PURO y testeable + adaptador de I/O
+ orquestación en `apps/api`.

### 1. Paquete nuevo `packages/hospedajes` (puro, sin D1, sin fetch)

```ts
// types.ts — entrada plana, derivada de lo que la API ya lee de D1
export interface ParteHuesped {
  name: string; surname: string;
  docType: 'dni' | 'nie' | 'passport' | 'other' | null;
  docNumber: string | null;
  birthdate: IsoDate | null;      // menores sin documento: birthdate obligatorio, doc no
  nationality: string | null;     // ISO 3166-1 alpha-3 (lo que ya guarda la ficha)
  address: string | null; phone: string | null; email: string | null;
}
export interface ParteEstancia {
  bookingCode: string;
  dateFrom: IsoDate; dateTo: IsoDate;   // from inclusive / to exclusive, como todo el sistema
  checkedInAt: string | null;
  // Medio de pago: dato PROPIO, no derivado de payments.provider (que es el proveedor,
  // no el medio). Nulo hasta que se capture; su enum exacto se fija contra la espec SES.
  paymentKind: PaymentKind | null;
  huespedes: ParteHuesped[];
}
export interface Establecimiento {
  codigo: string;                  // código de establecimiento asignado por SES
  nombre: string; direccion: string; municipio: string; provincia: string; cp: string;
}

// Generador — el equivalente a computeChargeAmount: puro, 100 % testeable aquí
export function buildParte(est: Establecimiento, estancias: ParteEstancia[]):
  { ok: true; payload: PartePayload } | { ok: false; issues: ParteIssue[] };
```

- `buildParte` **valida antes de generar**: cada huésped sin documento (adulto), sin
  fecha de nacimiento o sin nacionalidad produce un `ParteIssue` con bookingCode y
  campo — la recepcionista ve QUÉ falta y en qué reserva, no un rechazo genérico
  del ministerio. La serialización al XML oficial es una función aparte
  (`serializeParte(payload): string`) que se escribe contra la especificación real.
- Tests como los de `redsys.ts`/`modes.ts`: validación, casos frontera (menores,
  pasaporte, estancia sin check-in), serialización con fixtures.

### 2. Envío: interfaz + adaptadores, real diferido a credenciales

```ts
export interface HospedajesTransport {
  send(xml: string, config: SesCredentials): Promise<SendResult>;
}
```

Dos adaptadores: `sesTransport` (webservice real — **se implementa, pero queda sin
verificar contra el entorno real hasta tener credenciales**, exactamente como
Stripe/Redsys/Resend) y `manualTransport` (descarga del fichero para subirlo a mano
en la sede — es el modo con el que un camping puede operar desde el día uno, sin
esperar al alta del webservice).

### 3. Config por tenant: `tenants.modules.hospedajes` — capa existente, no nueva

Mismo SELECT que payments/notifications. Parte tipada junto a `tenantLegalSchema`
(packages/config/src/tenant-config.ts):

```ts
export const tenantHospedajesSchema = z.object({
  enabled: z.boolean(),
  codigoEstablecimiento: z.string(),
  // datos del establecimiento que el XML repite en cada parte
  establecimiento: z.object({ nombre: z.string(), direccion: z.string(),
    municipio: z.string(), provincia: z.string(), cp: z.string() }),
});
```

Las credenciales del webservice **NO van en `modules`** (JSON legible en D1): van
como secrets del Worker (`wrangler secret`), igual que las claves de
Stripe/Redsys/Resend.

### 4. Orquestación en `apps/api`

- `GET /api/admin/hospedajes/parte?date=YYYY-MM-DD` — reúne los check-ins del día
  desde D1, llama a `buildParte`, devuelve o el XML (descarga) o los issues.
- `POST /api/admin/hospedajes/enviar` — mismo build + `sesTransport`, con registro
  en `audit_log` (qué se comunicó y cuándo: la obligación incluye poder probarlo).
- Ambas rutas nacen cubiertas por el barrido de `isolation.test.ts` (automático por
  `app.routes`).
- Dashboard: pantalla mínima "Parte de viajeros" (lista del día, avisos de datos
  incompletos con enlace a la ficha del huésped, botón descargar/enviar). El `?`
  apunta a una página nueva de la guía de gestión.

## Alternativas descartadas

- **Generar el XML de memoria en este ADR** — el formato oficial cambia y no está en
  contexto fiable; inventarlo garantiza retrabajo. La arquitectura no depende de él.
- **Config en una tabla/capa nueva** — `tenants.modules` ya existe y ya lo leen
  payments/notifications; una capa nueva es trabajo por camping y por sesión.
- **Solo envío automático (sin descarga manual)** — bloquearía el valor entero
  detrás del alta de credenciales SES de cada camping; la descarga manual opera hoy.
- **Cron que envía solo** — un envío legal fallando en silencio es peor que un botón
  que la recepcionista pulsa al cerrar las llegadas; automatizar es un remate
  posterior, cuando el transporte real esté verificado.
- **Guardar el parte generado en D1** — el fichero se regenera determinista desde
  los datos; lo que hay que conservar es el hecho del envío, y eso es `audit_log`.

## Consecuencias

- Se gana el mayor hueco funcional para un camping español real, con el motor de
  generación 100 % testeado en el repo y el riesgo (webservice) acotado al adaptador.
- Un camping sin credenciales SES ya cumple con la descarga manual desde el día uno.
- Queda pendiente y señalizado: verificación contra el webservice real (credenciales
  + código de establecimiento — misma categoría que Stripe/Redsys), cierre de campos
  contra la especificación oficial, y la página de guía del `?`.
- Vigilar: el medio de pago y el trato de menores se fijan contra la espec oficial,
  no contra suposiciones; el medio de pago se **captura**, no se infiere del proveedor.
  Los datos que hoy no se capturan (sexo, 2º apellido, expedición del documento,
  parentesco del menor, medio de pago) se añadirán como **columnas nulables aditivas**
  con su migración `0006`, ampliando la ficha, nunca rompiéndola.
