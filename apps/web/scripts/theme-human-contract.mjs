/** Contrato final del frente H para una demo aprobada. */

function fail(message) {
  throw new Error(`[factory] ${message}`);
}

function resolvedInstallationPhoto(item, pieces) {
  const candidates = [
    item.foto,
    item.recepcion || item.id === 'recepcion' ? 'vida-recepcion' : undefined,
    `vida-servicio-${item.id}`,
    `instalacion-${item.id}`,
  ].filter(Boolean);
  return candidates.find((key) => pieces[key]);
}

export function validateApprovedHumanContract({ slug, defaultLocale, content, pieces }) {
  const label = `${slug}/content/${defaultLocale}.json`;
  if (!content?.vida) fail(`${label}: una demo aprobada requiere vida`);
  if (!content?.entornoPagina?.rutas) {
    fail(`${label}: una demo aprobada requiere entornoPagina.rutas`);
  }
  if (!pieces || typeof pieces !== 'object') fail(`${slug}/fotos.json: falta piezas`);

  const humanPieces = Object.keys(pieces).filter((key) => key.startsWith('vida-'));
  if (humanPieces.length < 4) {
    fail(`${slug}/fotos.json: una demo aprobada requiere al menos cuatro piezas vida-*`);
  }

  const editorialPhotos = [
    ...content.vida.escenas.map((scene) => scene.foto),
    ...content.entornoPagina.rutas.items.map((route) => route.foto),
  ];
  for (const photo of editorialPhotos) {
    if (!pieces[photo])
      fail(`${label}: ${photo} existe en contenido pero no está trazada en fotos.json`);
  }

  const installations = content.instalaciones?.items;
  if (!Array.isArray(installations)) fail(`${label}: falta instalaciones.items`);
  const reception = installations.find((item) => item.recepcion || item.id === 'recepcion');
  const receptionPhoto = reception && resolvedInstallationPhoto(reception, pieces);
  if (!receptionPhoto?.startsWith('vida-recep')) {
    fail(`${label}: recepción requiere una fotografía humana vida-recep*`);
  }

  const service = installations.find((item) => {
    if (item === reception) return false;
    return resolvedInstallationPhoto(item, pieces)?.startsWith('vida-serv');
  });
  if (!service) fail(`${label}: al menos otro servicio requiere una fotografía humana vida-serv*`);
}
