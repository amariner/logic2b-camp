# Prompt para la siguiente sesión — funcional, sin temas

> Reescrito el 2026-08-13 tras cerrar dos restos funcionales de pago y planning.

## Estado en una línea

La reserva pendiente recupera su intento persistido y el cambio de estancia
advierte cualquier exceso cobrado antes de confirmar. Ninguno de los dos flujos
crea un cobro o reembolso automático.

## Último cierre

- `requote` expone `paidCents` desde la reserva vigente;
- el diálogo muestra cobrado, total nuevo y exceso a devolver manualmente;
- las acciones son de 44 px en móvil, sin desborde ni consola a 375/1280 px;
- las demos re-cotizan y persisten el total al mover, igual que el API real;
- regresión dirigida 15/15 y `pnpm check` 71/71, sin deploy ni datos remotos.

## Cómo continuar

Revisar el backlog no visual por disparador, no por antigüedad. Los restos
abiertos actuales dependen en su mayoría de demanda real, credenciales o un
contrato externo (SES.Hospedajes, observabilidad, colas, pasarelas, tenant real).
No simular esos gates ni abrir optimizaciones prematuras.

El siguiente corte local debe nacer de una incoherencia funcional reproducible
en reserva, operación o gestor. Si no aparece una con evidencia, preparar el
gate de cliente más cercano indicando exactamente datos, autorización y criterio
de aceptación, sin ejecutarlo. No crear un tema decimotercero ni tocar fotografía.
