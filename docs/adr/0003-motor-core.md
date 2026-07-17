# 0003 — Motor de disponibilidad y precios (packages/core)

- **Fecha**: 2026-07-17
- **Fase**: 2 · Motor ★
- **Estado**: aceptado (OK de continuidad de Andreu; revisable)

## Contexto

La fase crítica. `packages/core` debe ser **lógica pura**: recibe datos, devuelve resultados. Sin I/O, sin Drizzle, sin framework. 100% testeado, tests antes que implementación, empezando por los 7 casos límite de §9. El desglose de precio es requisito: cada céntimo explicable.

## Decisión

**Tipos propios del dominio, no los de la DB.** El core define `Season`, `RatePlan`, `UnitType`, `Unit`, `BookingSpan`, `Block`, `Occupancy`… planos e independientes de Drizzle. La API (Fase 3) mapea filas→dominio. Motivo: pureza real (cero dependencia, ni de tipos), y el motor no necesita columnas de persistencia (`tenant_id`, `created_at`).

**Semántica central**
- *Noche efectiva*: para cada noche `d`, la temporada aplicable es la de **mayor prioridad** cuyo rango la contiene y está `isOpen`. Noche sin temporada abierta → **cerrado** (resultado `closed`, mensaje distinto de "sin disponibilidad").
- *Precio por tramos*: el quote parte la estancia en segmentos por temporada efectiva y aplica el plan de cada tramo. Cada línea del desglose lleva concepto (clave i18n) + detalle auditable + importe. `sum(lines) == totalCents` por construcción.
- *Estancia mínima*: la **más restrictiva** (máximo `minStay`) de las temporadas tocadas. Día de llegada/salida: según el plan de la temporada de la noche de llegada / día de salida.
- *Disponibilidad por tipo con reasignación implícita*: un tipo está disponible si **para cada noche** `unidades_activas − ocupadas(noche) − bloqueadas(noche) > 0`. Con reservas por intervalos, la comprobación por noche es suficiente para garantizar una asignación factible (propiedad de grafos de intervalos) → resuelve el caso "6 unidades, 6 solapes parciales, hay hueco reasignando" sin max-flow.
- *Asignación óptima (menos huecos)*: entre las unidades libres todo el rango, la de menor hueco total (distancia a la reserva vecina anterior + posterior en esa unidad); empate → menor código. Devuelve también las alternativas.
- *Reglas de tarifa*: de las aplicables (condiciones: antelación, noches, carnet, temporadas), aplican **todas las stackables** + la no-stackable de mayor prioridad. Descuentos como líneas negativas del desglose (auditables), en céntimos redondeados.
- *Tasa turística*: `calculateTouristTax(occupancy, nights, policy)` con política explícita `{ perPersonNightCents, exemptUnderAge, maxNights? }` + registro de políticas por región (`'valencia'`, `'catalunya'`, `'none'` de arranque, ampliable por config). Exentos por edad NO pagan pero SÍ cuentan capacidad (eso es de `validateStay`).
- *Cancelación*: política = tramos `{ minDaysBefore, refundPct }`; se aplica el tramo de mayor `minDaysBefore` ≤ días de antelación reales. Reembolso sobre `paidCents`; la fianza va aparte (no es ingreso).
- *Validación* (`validateStay`): acumula TODOS los errores con código i18n + params (no aborta en el primero): cerrado, minStay, maxStay, día de llegada, capacidad, mascotas no admitidas, **parcela sin electricidad con equipo que la requiere** (mensaje útil, caso 5).

**Puntos de extensión (§3), diseñados ahora**: `createExtensionRegistry()` tipado con los hooks declarados (`onEnquiryReceived`, `beforeAvailabilitySearch`, `afterAvailabilitySearch`, `registerRateRule`, `onQuoteCalculated`, `onBookingCreated/Modified/Cancelled`, `registerDashboardPanel`, `registerWebRoute`, `registerEmailTemplate`). Los hooks `before*/on*Calculated` son transformadores encadenados (reciben y devuelven el valor); el resto observadores. Registro puro: quién lo ejecuta (API/web) llega en Fase 9.

**Estructura**: `dates.ts` · `types.ts` · `seasons.ts` · `availability.ts` · `pricing.ts` (quote + applyRules) · `validate.ts` · `assign.ts` · `touristTax.ts` · `cancellation.ts` · `extensions.ts` · `index.ts`. Vitest colocado (`*.test.ts`), objetivo ≥40 tests con los 7 casos límite nombrados.

## Alternativas descartadas

- Reusar tipos de Drizzle en core — acopla el motor a la persistencia; lo prohíbe el brief ("sin Drizzle").
- Max-flow/matching para disponibilidad — innecesario: con intervalos, el corte por noche es exacto.
- Tasa turística hardcodeada por región dentro del cálculo — las normativas cambian; política como dato.
- Excepciones para validación — un formulario necesita TODOS los errores, no el primero.

## Consecuencias

- La API (Fase 3) es un adaptador fino: filas → tipos de dominio → motor → respuesta.
- Las políticas (tasa, cancelación) viven en config de tenant, no en código → alta de camping sin tocar core.
- El registro de extensiones existe desde ya: `custom/` (Fase 9) se engancha sin retocar el motor.
