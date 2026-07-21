# Runbook — copias, restauración y portabilidad

> Procedimiento operativo de la Fase 11 (ADR 0026 §4). Este fichero existe porque
> **una copia que nadie ha restaurado nunca no es una copia**: es una suposición.
>
> Todos los comandos de aquí están verificados contra el `wrangler` instalado en el
> repo. Si alguno falla, es que cambió la herramienta — corrige este fichero antes
> de improvisar.

## Qué hay, y qué NO hay

|                                                    |                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| **Restauración a un punto en el tiempo**           | ✅ Cloudflare D1 _Time Travel_, continua, gestionada. **Ventana: 30 días** |
| **Exportación bajo demanda** (SQL + CSV)           | ✅ `pnpm export:tenant <slug>`                                             |
| **Exportación programada a almacenamiento propio** | ❌ **A propósito.** Ver abajo                                              |

### Por qué no hay exportación programada

Decisión del ADR 0026 §4, y conviene que quien la reabra sepa el razonamiento:

1. Con ~6h/semana de desarrollo, **un pipeline de copias que nadie vigila se pudre en silencio**. Y una copia que descubres rota el día que la necesitas es _peor_ que no tenerla, porque planificaste contando con ella.
2. El _Time Travel_ de Cloudflare es **continuo** y mejor que lo que construiríamos.
3. El hueco real nunca fue la copia: era que **nadie había restaurado una**. Eso lo cierra este fichero, no un cron.

Si un cliente lo exige por contrato, se monta **para ese cliente** al darlo de alta — que es exactamente lo que dice la ficha técnica pública. No se convierte en defecto del producto.

---

## 1. Exportar la base de un camping

```bash
pnpm export:tenant demo          # producción (remoto)
pnpm export:tenant demo --local  # ensayo contra la base local
```

Deja en `exports/{slug}-{fecha}/`:

- `{slug}-{fecha}.sql` — volcado completo. **Es el que vale para restaurar.**
- `{slug}-bookings-{fecha}.csv`, `-guests-`, `-payments-` — los cuadros que un camping abre sin saber SQL.

**`--local` no genera el `.sql`, y lo dice.** `wrangler d1 export` no acepta `--persist-to`, así que en local leería el directorio por defecto —vacío— y escribiría un fichero con aspecto de copia buena y sin datos dentro. Se omite explícitamente en vez de mentir.

> ⚠️ `exports/` está en `.gitignore` y **debe seguir estando**. Contiene nombres, documentos de identidad y contacto de huéspedes reales. Se entrega al camping y se borra del disco.

## 2. Restaurar — el caso que de verdad importa

### 2a. Volver atrás en el tiempo (lo primero que hay que probar)

Sirve para el caso frecuente: alguien borró algo, una migración salió mal, una hora
concreta quedó corrupta.

```bash
# ¿hasta dónde puedo volver, y en qué estado está?
npx wrangler d1 time-travel info logic-camp-demo --config tenants/demo/wrangler.jsonc

# volver a un instante concreto (RFC3339 o Unix, dentro de los últimos 30 días)
npx wrangler d1 time-travel restore logic-camp-demo \
  --timestamp=2026-07-20T09:00:00.000Z \
  --config tenants/demo/wrangler.jsonc
```

**La restauración es destructiva sobre la base actual.** Antes de ejecutarla, siempre:

```bash
pnpm export:tenant demo   # foto del estado ACTUAL, por si el punto elegido es peor
```

Sin ese paso no hay vuelta atrás de la vuelta atrás.

### 2b. Restaurar desde un volcado SQL

Para lo que Time Travel no cubre: pasados los 30 días, o mover un camping a otra
cuenta.

```bash
# 1. base NUEVA — nunca encima de la que está en producción
npx wrangler d1 create logic-camp-demo-restore

# 2. cargar el volcado
npx wrangler d1 execute logic-camp-demo-restore --remote \
  --config tenants/demo/wrangler.jsonc \
  --file exports/demo-2026-07-21/demo-2026-07-21.sql -y

# 3. comprobar ANTES de apuntar nada (ver §3)

# 4. solo entonces: cambiar database_id en tenants/demo/wrangler.jsonc y desplegar
```

El orden importa: **se verifica sobre la base restaurada y solo después se repunta el
binding.** Cargar encima de la base viva es la forma de convertir un incidente
recuperable en uno que no lo es.

## 3. Verificar una restauración

Una restauración no está hecha hasta que estos cuatro dan lo esperado. Los tres
primeros son recuentos; el cuarto es el que caza una copia truncada, porque toca el
invariante que el proyecto se toma más en serio.

```bash
DB=logic-camp-demo-restore
CFG="--config tenants/demo/wrangler.jsonc --remote"

# 1. hay datos, y cuadran con la fecha de la copia
npx wrangler d1 execute $DB $CFG --command "SELECT COUNT(*) FROM bookings"
npx wrangler d1 execute $DB $CFG --command "SELECT MAX(created_at) FROM bookings"

# 2. las migraciones están todas
npx wrangler d1 execute $DB $CFG --command "SELECT name FROM d1_migrations ORDER BY id"

# 3. INVARIANTE 2 — sum(payments) == bookings.paid_cents. Debe devolver CERO filas.
npx wrangler d1 execute $DB $CFG --command "
  SELECT b.code, b.paid_cents, COALESCE(SUM(p.amount_cents),0) AS suma
  FROM bookings b LEFT JOIN payments p ON p.booking_id = b.id
  GROUP BY b.id HAVING b.paid_cents != suma"

# 4. INVARIANTE 1 — ninguna unidad con dos reservas solapadas. CERO filas.
npx wrangler d1 execute $DB $CFG --command "
  SELECT a.code, b.code FROM bookings a JOIN bookings b
    ON a.unit_id = b.unit_id AND a.id < b.id
   AND a.date_from < b.date_to AND b.date_from < a.date_to
  WHERE a.unit_id IS NOT NULL
    AND a.status IN ('confirmed','completed') AND b.status IN ('confirmed','completed')"

# 5. y que el sitio responde de verdad
curl -s https://camp.logic2b.com/api/health
```

Si 3 o 4 devuelven filas, **la copia no sirve**: no la promociones a producción.

## 4. Ensayo (hazlo antes de necesitarlo)

Contra la demo, que para eso está y se resetea sola cada noche:

1. `pnpm export:tenant demo`
2. `npx wrangler d1 time-travel info logic-camp-demo --config tenants/demo/wrangler.jsonc` → anota el bookmark más antiguo disponible.
3. Restaura sobre una base **nueva** siguiendo §2b.
4. Pasa las cinco comprobaciones de §3.
5. Borra la base de ensayo y el `exports/` que hayas generado.

Anota aquí la fecha del último ensayo. Si hace más de seis meses, la copia ha vuelto
a ser una suposición.

| Fecha del ensayo                                                                                   | Quién | Resultado |
| -------------------------------------------------------------------------------------------------- | ----- | --------- |
| _(pendiente — primer ensayo real desde la máquina de Andreu, requiere credenciales de Cloudflare)_ |       |           |

## 5. Si un camping se va

Es una promesa escrita en `camp.logic2b.com/docs/tecnica/datos-rgpd/`, así que se
cumple sin fricción:

1. `pnpm export:tenant {slug}` → SQL completo + CSV.
2. Se entrega por un canal cifrado. **Nunca por correo sin cifrar**: lleva documentos de identidad.
3. El dominio es suyo y siempre lo fue: se apunta a donde digan.
4. Se borra la base y el `exports/` local cuando confirmen recepción.

No se retiene ningún dato como forma de asegurar la permanencia.
