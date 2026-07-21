-- ADR 0026 §2 — RGPD operativo. Migración ADITIVA (tres columnas nulables, sin backfill).
--
-- `anonymized_at`  sella el ejercicio del derecho de supresión (art. 17). La fila NO se
--                  borra nunca: reservas y pagos deben sobrevivir por obligación fiscal, y
--                  el registro de viajeros tiene su propio plazo (RD 933/2021). Se vacían
--                  los campos personales y queda el histórico sin dueño identificable.
-- `gdpr_consent_version` guarda A QUÉ se consintió. Una fecha de consentimiento sin saber
--                  qué texto se aceptó no prueba nada.
ALTER TABLE `guests` ADD `anonymized_at` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `gdpr_consent_version` text;
