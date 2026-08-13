# Prompt para la siguiente sesión — frente funcional no visual

> Reescrito el 2026-08-13 tras cerrar el reintento seguro de pagos pendientes.

## Estado en una línea

Una reserva `pending` ya puede recuperar su intento de pago persistido desde
`/reserva`, sin crear otro cobro ni llamar al proveedor. El portfolio continúa
cerrado en 12/12 y no necesita más temas.

## Último cierre

- endpoint público protegido por código + email y por estado `pending`;
- mismo intento persistido para redirect/form, con 404 de identidad y 409 de estado;
- copy localizado en seis idiomas, fixtures tier 3 y plantilla;
- QA D1 + Worker local a 375/1366 px, sin enviar el formulario externo;
- `pnpm check` 71/71; sin deploy ni infraestructura remota.

## Siguiente corte recomendado

Resolver el resto funcional `[C1]` del diálogo de cambio de precio en el gestor:
si una reserva ya cobrada queda con `paidCents > totalCents`, mostrar dentro del
diálogo un aviso explícito con el exceso antes de confirmar. El servidor seguirá
siendo la autoridad y no se registrará devolución, ajuste contable ni movimiento
automático. Cubrir cálculo, copy, foco/lector de pantalla y estados móvil/escritorio
con pruebas del dashboard.

No crear un tema decimotercero, no tocar fotografía y no activar proveedores,
credenciales, datos remotos o producción sin un gate y autorización explícitos.
