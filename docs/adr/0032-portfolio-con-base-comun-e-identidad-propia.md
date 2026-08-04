# 0032 — El portfolio comparte motor, no apariencia

- **Fecha**: 2026-08-04
- **Fase**: Frente D · D0
- **Estado**: **propuesto**

## Contexto

El Frente D plantea doce demos para demostrar que Logic2B sirve a negocios de
camping distintos. La fábrica D1 es necesaria para no duplicar el motor, el
modelo de dominio, la seguridad y el despliegue. Pero una interpretación pobre
de «fábrica» produciría doce skins reconocibles de la misma landing. Eso
debilita justo la prueba comercial: un dueño debe poder reconocerse en una
demo, no pensar que recibirá Cala Sereno con otro color.

La objeción recibida el 2026-08-04 es válida: dedicar identidad y contenido a
cada demo no tiene por qué ser caro si no se bifurca el producto. El coste debe
medirse en las tres primeras, no suponerse ni esconderse.

## Decisión propuesta

### 1. Una base técnica común; una dirección de arte por demo

Cada demo conserva el mismo core: dominio, disponibilidad, reserva, permisos,
SEO de base, D1 aislada y proceso de despliegue. Cada una recibe su propio
brief de marca, tono, fotografías/ilustraciones, paleta, tipografía si el
contrato visual lo pide, arquitectura editorial y selección de módulos.

No se acepta como demo distinta cambiar solo nombre, colores y tres fotos. La
ficha de cada camping debe declarar al menos:

- público, tamaño, temporada y modelo de negocio;
- territorio visual y dirección de foto;
- voz, idioma principal y propuesta de valor;
- jerarquía de portada, CTA y contenido distintivos;
- qué aspecto del producto demuestra y qué integración/canal comercial le
  encajaría explorar.

### 2. La fábrica acelera sin homogeneizar

`tenants/{slug}/` sigue siendo la frontera: `config`, `theme`, contenido,
activos y extensiones declaradas. Si una diferencia se repite y mejora el core,
se crea un punto de extensión; si es exclusiva de esa demo, vive en su tenant.
Nunca se parchea `apps/` para una sola marca.

La métrica correcta no es «cuántos píxeles comparten», sino «¿puede darse de
alta sin tocar el core y sigue pareciendo un camping propio?». Se medirán por
separado horas de: (a) marca/contenido, (b) inventario/tarifas, (c)
configuración, (d) QA/publicación. Las tres primeras demos ajustarán precio y
alcance.

### 3. Integraciones y captación se venden con precisión

La documentación pública mostrará un catálogo con logos y enlaces oficiales,
pero diferenciará:

- lo disponible y activable con credenciales;
- lo evaluable mediante API/partnerización;
- los directorios y guías que son canales comerciales, no conectores.

Una plataforma de OTA o un channel manager no aparece como «integrado» hasta
que exista adapter, sandbox, contrato y prueba de sincronización. Ads/Meta no
se activan sin la decisión de consentimiento y atribución por tenant.

El mapa inicial y sus fuentes viven en
[`docs/INTEGRACIONES-Y-CAPTACION.md`](../INTEGRACIONES-Y-CAPTACION.md).

### 4. Landing: vender resultado, no pared de logos

Antes de que haya conectores activos, la landing debe prometer el resultado
demostrable: web propia, reserva directa, campañas medibles y una ruta para
conectar la distribución que ya use el camping. La matriz completa de logos y
documentación vive en una página específica; la landing enlaza a ella y no
confunde «canal posible» con «integración incluida».

## Consecuencias

- D0 deja de ser un freno burocrático: es un brief breve que protege la
  variedad visual, la honradez de los logos y el coste de la fábrica.
- D1 no fabrica plantillas visuales cerradas; fabrica capacidades y puntos de
  extensión para que cada tenant tenga expresión propia.
- D2–D4 empiezan por tres demos deliberadamente contrastadas y miden las cuatro
  categorías de tiempo antes de completar las doce.
- Cada integración futura abre su propio ADR; no se construyen cinco adapters
  preventivos para una landing.

## Validación solicitada

1. ¿Este mínimo de identidad propia por demo representa lo que quieres vender?
2. ¿El primer lote debe ser una demo de cada nivel (1, 2 y 3) para probar la
   variedad, en vez de completar los cuatro nivel 1 primero?
3. ¿Aprobamos el catálogo con los tres estados, y reservamos los logos para la
   página de documentación una vez confirmada la fuente de marca de cada uno?

