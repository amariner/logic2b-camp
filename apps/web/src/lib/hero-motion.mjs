/** MIME declarado por el `<source>` local del héroe. */
export function heroVideoMimeType(src) {
  return /\.webm(?:$|[?#])/i.test(src) ? 'video/webm' : 'video/mp4';
}

/**
 * El vídeo es una mejora progresiva: ninguna preferencia puede convertirlo en
 * requisito para ver o entender el héroe.
 */
export function canPlayHeroMotion({ reducedMotion, saveData }) {
  return !reducedMotion && !saveData;
}

/**
 * Sincroniza un vídeo ya renderizado con las preferencias actuales. Las URLs
 * viven en `data-src` para que el navegador no descargue nada antes del gate.
 */
export async function syncHeroMotion(video, enabled) {
  if (!enabled) {
    video.pause();
    video.removeAttribute('data-ready');
    return false;
  }

  if (!video.dataset.initialized) {
    video.dataset.initialized = 'true';
    for (const source of video.querySelectorAll('source[data-src]')) {
      source.src = source.dataset.src ?? '';
    }
    video.load();
  }

  try {
    await video.play();
    video.setAttribute('data-ready', '');
    return true;
  } catch {
    video.removeAttribute('data-ready');
    return false;
  }
}
