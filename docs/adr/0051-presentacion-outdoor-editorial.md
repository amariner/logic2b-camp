# ADR 0051 — Presentación outdoor editorial

Estado: aceptada por el encargo directo de Andreu del 2026-09-08. Rediseño
completo de L'Olivar inspirado en las tres referencias adjuntas: fotografía
humana, composición editorial, camping pequeño organizado y solo acampada.
Sustituye para este tema la dirección de fotografías vacías del primer H1-V.

Se añade una presentación opcional `outdoor` al contrato de web. La composición
vive en componentes compartidos y consume contenido del tenant; los tokens,
las fotos, los textos y las parcelas se declaran en L'Olivar. Las otras demos
mantienen su presentación. La navegación, formulario, páginas interiores,
accesibilidad y transporte demo continúan compartidos.

El catálogo de L'Olivar pasa a dos tamaños de parcela para tiendas (16 + 6),
conservando las claves históricas para mantener URLs. No hay alojamientos ni
camas incluidas. Las fotografías anteriores se conservan; las nuevas piezas
se incorporan con claves distintas y se inspeccionan antes de activarse. El
vídeo se regenera desde la nueva escena humana, con póster específico por
formato y los mismos límites de carga y accesibilidad.

Tradeoff: una composición opcional añade superficie común, pero evita una
home copiada por camping. El nombre de la demo no aparece en componentes. Las
páginas interiores usan la misma identidad y datos, evitando una home que
prometa una oferta distinta de la ficha o la consulta.
