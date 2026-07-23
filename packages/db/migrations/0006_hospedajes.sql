-- ADR 0028 — Parte de viajeros (SES.Hospedajes / RD 933/2021). Migración ADITIVA:
-- cinco columnas nulables, sin backfill. Ninguna cambia la semántica de un filtro
-- existente (mismo criterio que 0004/0005): el sistema opera igual con todas a NULL,
-- y la ficha de huésped las rellena cuando el camping empieza a comunicar el parte.
--
-- Los campos salen de la ESPECIFICACIÓN oficial del parte, no de memoria (ADR 0028):
-- el RD 933/2021 pide, además de lo que `guests` ya guardaba, el sexo, el segundo
-- apellido, el «número de soporte» del documento (dato DISTINTO del número de
-- documento) y, para los menores, el parentesco con el acompañante.
ALTER TABLE `guests` ADD `sex` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `second_surname` text;--> statement-breakpoint
-- Nº de soporte del documento (p. ej. el «IDESP» del DNI): lo pide el parte aparte
-- del número de documento. El ADR lo había anticipado como «fecha/país de expedición»;
-- la especificación real lo define como número de soporte — se cierra contra ella.
ALTER TABLE `guests` ADD `doc_support_number` text;--> statement-breakpoint
-- Parentesco: SOLO aplica a viajeros menores de 14 (su relación con el acompañante).
ALTER TABLE `guests` ADD `kinship` text;--> statement-breakpoint
-- Forma de pago de la operación (efectivo/tarjeta/transferencia/plataforma). Dato
-- PROPIO, nulable: NO se deriva de `payments.provider`, que es el proveedor de la
-- pasarela, no el medio con el que el huésped pagó (ADR 0028 §Contexto).
ALTER TABLE `bookings` ADD `payment_kind` text;
