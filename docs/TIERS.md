# TIERS — Los cuatro niveles de Logic Camp

Un único código base. Subir de nivel = **cambiar config**, nunca un proyecto nuevo. Los niveles son la escalera comercial: el 1 es el caballo de Troya (barato de vender y mantener; cuando el camping crece, ya estás dentro y tienes su histórico).

## Matriz de niveles

| | **1 · Camp Web** | **2 · Camp Solicitudes** | **3 · Camp Reservas** | **4 · Camp Motor** |
|---|---|---|---|---|
| Web pública | ✅ | ✅ | ✅ | ❌ (la suya) |
| Formulario → email | ✅ | ✅ | ✅ | — |
| Solicitudes guardadas | ✅ (silenciosas) | ✅ | ✅ | ✅ |
| Bandeja + calendario | ❌ | ✅ lite | ✅ | ✅ |
| Motor disponibilidad | ❌ | ❌ | ✅ | ✅ |
| Precio automático | ❌ | ❌ | ✅ | ✅ |
| Confirmación instantánea | ❌ | ❌ | ✅ | ✅ |
| Pagos | ❌ | ❌ | opcional | opcional |
| Dashboard | ❌ | lite | completo | completo |
| Para quién | Solo presencia digital | No da abasto con el correo | Quiere dejar de pagar a Booking | Ya tiene web y no la tocará |
| Estado | Fase 4 | Fase 4+6 | Fases 2–8 | **Fase 12 — no construir hasta que se pague** |

## Config por nivel

```ts
// tenants/{slug}/config.ts (forma orientativa; se cierra en Fase 9)
tier1: { web: true,  booking: 'email',   dashboard: false }
tier2: { web: true,  booking: 'request', dashboard: 'lite' }
tier3: { web: true,  booking: 'instant', dashboard: 'full', payments: { provider: 'stripe'|'redsys'|'none', mode: 'none'|'deposit'|'full' } } // forma real desde ADR 0011
tier4: { web: false, booking: 'instant', dashboard: 'full' }  // NO CONSTRUIR AÚN
```

## Regla de degradación — qué sigue funcionando con cada módulo apagado

**Regla dura**: cada nivel debe funcionar sin arrastrar código de los módulos que tiene apagados. Se verifica en build (nivel 1 no incluye el motor en el bundle) y en runtime.

| Módulo apagado | Debe seguir funcionando | Debe desaparecer limpiamente |
|---|---|---|
| `booking: 'email'` (sin motor) | Web completa, formulario de solicitud, guardado en `enquiries`, email vía Resend | Widget de disponibilidad (no existe, no se bundlea), precios automáticos, confirmación |
| `dashboard: false` | Todo el nivel 1 | Todo el dashboard; el login no ofrece nada |
| `dashboard: 'lite'` | Bandeja de solicitudes, llegadas/salidas, calendario de ocupación manual, convertir solicitud→reserva manual | Planning drag&drop, tarifas, informes, motor |
| `payments: 'none'` | Reserva completa con confirmación sin cobro | Todo rastro de pasarela en UI y emails |
| `web: false` (tier 4) | Motor + dashboard | Web pública entera |
| Notificaciones (por tipo) | El flujo que las dispara | El envío; queda en `notifications_log` como desactivada |

## Invariante comercial del nivel 1

En el nivel 1 la solicitud **se guarda en `enquiries` igual**, aunque el camping solo mire su Gmail. Ese histórico (clientes, patrones de demanda) es el activo que ningún competidor puede ofrecer cuando el camping sube de nivel. No es opcional: es la razón de renovación más barata del producto.
