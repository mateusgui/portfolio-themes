import type { Plugin } from 'vite';

import { THEME_IDS, type ThemeId } from '../../src/themes/registry.ts';

/** Marcador no script inline do `index.html`, trocado pelo mapa tema → chunk. */
export const THEME_CHUNKS_PLACEHOLDER = '/* theme-chunks */ {}';

/**
 * Mapa tema → arquivo do chunk dos slots (`/assets/vscode-xxxx.js`). Os chunks
 * vêm do `import()` de `themes/<id>/index.ts` no `loadThemeSlots.ts`.
 */
export function themeChunkMap(
  chunks: readonly { fileName: string; facadeModuleId: string | null }[],
  base = '/',
): Partial<Record<ThemeId, string>> {
  const map: Partial<Record<ThemeId, string>> = {};
  for (const { fileName, facadeModuleId } of chunks) {
    const id = THEME_IDS.find((theme) =>
      facadeModuleId?.replaceAll('\\', '/').endsWith(`/themes/${theme}/index.ts`),
    );
    if (id) map[id] = `${base}${fileName}`;
  }
  return map;
}

/**
 * Deixa o script inline pedir o chunk do tema ativo (`modulepreload`) junto com
 * o JS principal, em vez de só depois dele: o primeiro render espera esse chunk.
 * Precisa vir antes do plugin de SEO, que copia o `index.html` por idioma.
 */
export function themeChunksPlugin(): Plugin {
  let base = '/';
  return {
    name: 'portfolio-theme-chunks',
    enforce: 'post',
    configResolved(config) {
      base = config.base;
    },
    generateBundle(_options, bundle) {
      if (!('index.html' in bundle)) return;
      const index = bundle['index.html'];
      if (index.type !== 'asset') return;

      const chunks = Object.values(bundle).flatMap((output) =>
        output.type === 'chunk' ? [output] : [],
      );
      const html = String(index.source);
      if (!html.includes(THEME_CHUNKS_PLACEHOLDER)) {
        throw new Error(`index.html sem o marcador ${THEME_CHUNKS_PLACEHOLDER}`);
      }
      index.source = html.replace(
        THEME_CHUNKS_PLACEHOLDER,
        JSON.stringify(themeChunkMap(chunks, base)),
      );
    },
  };
}
