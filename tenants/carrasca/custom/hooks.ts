import type { ExtensionRegistry } from '@logic-camp/core';

/** La Carrasca no necesita extensiones: la identidad vive fuera del core. */
export function register(ext: ExtensionRegistry): void {
  void ext;
}
