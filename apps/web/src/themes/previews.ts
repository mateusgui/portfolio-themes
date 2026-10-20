import type { ThemeId, ThemePreview } from './registry.ts';

/**
 * Tamanho dos prints gerados por `npm run screenshots` (viewport de 1440×900,
 * reduzido à metade). Ficam em `public/`, servidos pela raiz: são nome fixo e
 * conteúdo que muda a cada regeração, sem hash no nome.
 */
const WIDTH = 960;
const HEIGHT = 600;

/** Print do site neste tema, mostrado no card deste portfólio. */
export function previewOf(id: ThemeId): ThemePreview {
  return { src: `/projetos/portfolio-${id}.webp`, width: WIDTH, height: HEIGHT };
}
