import type { ExtensionRegistry } from '@logic-camp/core';

/** L'Olivar no necesita extensiones: la identidad vive fuera del core. */
export function register(ext: ExtensionRegistry): void {
  void ext;
}
