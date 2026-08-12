# Prompt para la siguiente sesión — elegir alcance no temático

> Reescrito el 2026-08-12 tras aceptar e implementar B5/ADR 0046.

## Estado en una línea

ADR 0044 cierra la solicitud contextual de tier 2 y ADR 0046 cierra el contacto
transversal con Logic2B en sitio, documentación, tenants y gestor. No queda otro
bloque funcional local no temático autorizado por el roadmap.

## Evidencia de cierre B5

- contrato compartido con teléfono, URL, seis idiomas y cuatro contextos sin PII;
- píldora pública tras 280 px, retirada ante pie y, en sitio, consentimiento o modal;
- tenant activo por defecto y desactivable con `logic2bContact: false`;
- ayuda del gestor en login, sidebar expandida/plegada y drawer móvil;
- guardias de artefacto, portfolio, R12 y presupuesto M6;
- QA comercial es/en y QA canónico a 375/1366 px, E2E contra Worker y bundle
  compuesto verdes.

No hubo deploy, infraestructura remota, proveedor, tracker ni creación de temas.

## Cómo continuar

No inventar un nuevo frente para mantener actividad. Antes de escribir código,
Andreu debe seleccionar de forma explícita uno de estos ámbitos:

1. un gate de cliente real o producción con sus datos/credenciales/autorización;
2. un alcance comercial nuevo que merezca ADR;
3. volver al portfolio temático (`soldhivern`), que esta sesión excluyó.

Si la instrucción sigue siendo «continuar sin crear temas», revisar primero
`docs/BACKLOG.md` y `docs/AUDITORIA-R15-NO-VISUAL.md`: los pendientes restantes
dependen de material real, proveedor, infraestructura, aprendizaje comercial o
autorización de despliegue. Presentar esa frontera y pedir dirección; no convertir
un gate externo en una implementación local ficticia.
