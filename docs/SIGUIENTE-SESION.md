# Prompt para la siguiente sesión — validar e implementar B5

> Reescrito el 2026-08-12 tras cerrar la solicitud contextual de tier 2 y
> revisar el último cambio no temático del roadmap.

## Estado en una línea

La sesión 138 cerró ADR 0044 en local y `main`: cada ficha tier 2 conserva el
tipo en la solicitud, mientras tier 1 y tier 3 mantienen sus fronteras. El único
bloque funcional local abierto fuera de creación de temas es **B5**, contacto
transversal con Logic2B por WhatsApp.

## Decisión preparada

[`adr/0046-contacto-logic2b-whatsapp-transversal.md`](adr/0046-contacto-logic2b-whatsapp-transversal.md)
propone:

- contrato único con `+34 626 432 316`, URL, seis idiomas y mensajes por
  superficie sin PII;
- píldora pública tras 280 px, oculta ante pie, consentimiento o modal;
- gestor en login/sidebar/drawer, no flotante, para no tapar operación;
- contacto Logic2B activo por defecto en webs tenant y desactivable por config.

## Gate

No escribir código B5 hasta que Andreu valide el ADR. La respuesta mínima es:

```text
OK ADR 0046
```

Tras ese OK: implementar contrato + tres adaptadores, pruebas, QA 375/1366,
`pnpm check`, bundle, documentación, commit y push. No desplegar sin autorización
separada.

## Trabajo temático separado

El portfolio sigue en 11/12 y `soldhivern` continúa pendiente, pero no forma
parte de este carril por instrucción expresa de Andreu.
