# 0034 — Mar de Fondo amplía el portfolio, no crea otro producto

- **Fecha**: 2026-08-07
- **Fase**: Frente D · D3-V
- **Estado**: **aceptado e implementado hasta operación reversible**

## Contexto

D1-V y D2-V demostraron Inicio y Gestión con dos identidades reales sobre la
misma fábrica. D3-V debe representar un resort de unas 300 unidades, reserva y
pago demo, operación y dos prototipos explicables. La solución rápida —copiar
web, dashboard y estado de Pinada— multiplicaría mantenimiento por demo y
contradiría la frontera `tenants/{slug}`. La solución sobredimensionada —crear
D1, Worker, usuarios o proveedores propios— construiría infraestructura que un
prospecto no ve y necesitaría credenciales.

También queda fijada una nueva restricción operativa: en Codex las imágenes se
generan con el mejor modelo integrado disponible y en lotes de dos para poder
inspeccionarlas sin saturar el servicio ni quemar créditos a ciegas.

## Decisión propuesta

1. `tenants/mardefondo` contiene identidad, contenido, inventario, tarifas,
   manifiesto visual y cualquier extensión exclusiva de la marca. Su `tier: 3`
   activa el motor compartido; no nace una aplicación nueva.
2. El escenario navegable del gestor se selecciona en build mediante
   `VITE_DEMO_SCENARIO=mardefondo`, igual que Pinada, pero el transporte común se
   generaliza antes de añadir comportamiento. Los fixtures son deterministas,
   reversibles y viven fuera de los componentes.
3. El primer corte entrega la base completa y construible de la web: cuatro
   familias, 300 unidades, temporadas, tarifas y extras en céntimos. Después se
   añade, en este orden, reserva/pago simulado, planning/plano y prototipos
   Automatiza/Inteligente.
4. Ninguna pantalla afirma que Stripe, canales, fiscalidad o IA estén operando.
   Pago se rotula «Pago simulado · no se ha realizado ningún cargo»;
   Automatiza «Prototipo supervisado» e Inteligente «Prototipo · no ejecuta
   cambios».
5. Las 12–14 fotos se describen primero en `fotos.json`. En Codex se generan con
   el modelo integrado de mayor calidad disponible, en tandas máximas de dos,
   inspeccionando cada pareja antes de continuar. No se cruza fotografía entre
   tenants y no se conservan dependencias de URLs temporales.

## Tensiones resueltas por las ocho lentes

- **Arquitectura/fullstack:** un tenant y un selector de escenario conservan un
  solo runtime; no hay despliegue ni backend por marca.
- **Backend/producto:** precios enteros, datos deterministas y pago ficticio
  auditable permiten enseñar valor sin simular integración productiva.
- **Frontend/UX:** el recorrido se construye desde la reserva hasta una acción
  aprobable; los estados de prototipo y reset son persistentes y legibles.
- **UI/SEO:** la marca del resort solo viste su web; el gestor sigue siendo
  Logic2B. La demo es `noindex`, responsive y usa activos locales optimizados.

## Consecuencias

- Un camping grande prueba la escala del mismo producto sin convertir el
  portfolio en tres forks.
- La base de Mar de Fondo puede construirse y revisarse sin fotos gracias a
  `<Materia>`; la degradación no sustituye el lote visual final.
- Automatización e inteligencia quedan acotadas a fixtures explicables con
  revisión humana. La activación real sigue en el dossier de producción.

## Validación solicitada

Validar a posteriori que el orden reserva → operación → Automatiza → Inteligente
y la regla de lotes de dos representan el nivel de ambición comercial deseado.

## Evidencia de implementación

La sesión 87 generaliza el selector y materializa la segunda variante del mismo
dashboard: 300 unidades, 240 reservas sin solapes, plano propio, ficha, llegada,
cobro y reset local. El bundle compuesto publica web y gestor bajo el mismo
origen y la QA cruza `MF-DEMO-001` entre ambos sin ninguna petición `/api`.
La sesión 88 añade el primer corte Automatiza al mismo build: fixture tipado,
revisión editable, aprobación local y reset, sin endpoint ni ejecución posible.
Inteligente, los fixtures restantes y el lote fotográfico siguen siendo cortes
posteriores de D3-V; no alteran esta decisión arquitectónica.

## Addenda R12 · valor de reservas no es facturación (2026-08-10)

La auditoría contractual posterior encontró una contradicción con el punto 4:
Inicio decía «facturado» y la guía de Informes describía el total de reservas
como factura e ingreso de caja, aunque el producto no emite facturas ni fecha
los cobros por el periodo del informe.

El contrato se corrige en todas las capas:

- `/api/admin/reports` expone `bookingValue`, no `revenue`;
- `totalCents` es el valor de las reservas cuya llegada cae dentro del rango;
- `paidCents` es lo que consta pagado hoy en esas mismas reservas, aunque el
  cobro pudiera registrarse fuera del rango;
- Inicio e Informes nombran valor reservado, cobro registrado y saldo pendiente;
- el recibo continúa rotulado como documento informativo que no es una factura.

Una prueba de API rechaza que reaparezca `revenue`; el dashboard prueba la misma
frontera en el transporte demo y en sus textos. Facturación/VeriFactu conserva el
sistema fiscal vigente como autoridad hasta que un cliente, su asesoría y un
proveedor aprueben el contrato real.
