import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { THEME_CHUNKS_PLACEHOLDER, themeChunkMap } from './plugin.ts';

describe('chunks de tema', () => {
  it('mapeia cada tema ao arquivo do seu chunk, ignorando os demais', () => {
    const map = themeChunkMap([
      { fileName: 'assets/vscode-abc.js', facadeModuleId: '/repo/src/themes/vscode/index.ts' },
      // Caminho do Windows, com barras invertidas.
      {
        fileName: 'assets/hacker-def.js',
        facadeModuleId: String.raw`C:\repo\src\themes\hacker\index.ts`,
      },
      { fileName: 'assets/index-123.js', facadeModuleId: '/repo/src/main.tsx' },
      { fileName: 'assets/jsx-runtime.js', facadeModuleId: null },
    ]);

    expect(map).toEqual({ vscode: '/assets/vscode-abc.js', hacker: '/assets/hacker-def.js' });
  });

  it('respeita o base do Vite', () => {
    const map = themeChunkMap(
      [{ fileName: 'assets/paper.js', facadeModuleId: '/r/src/themes/paper/index.ts' }],
      '/portfolio/',
    );

    expect(map).toEqual({ paper: '/portfolio/assets/paper.js' });
  });

  it('o script inline do index.html tem o marcador do mapa', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const html = readFileSync(join(root, 'index.html'), 'utf-8');

    expect(html).toContain(`var THEME_CHUNKS = ${THEME_CHUNKS_PLACEHOLDER};`);
  });
});
