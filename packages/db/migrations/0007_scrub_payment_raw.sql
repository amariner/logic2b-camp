-- ADR 0042: los payloads íntegros de pasarela no son necesarios para operar y
-- pueden contener PII o secretos. La columna queda por compatibilidad, siempre nula.
UPDATE payments SET raw = NULL WHERE raw IS NOT NULL;
