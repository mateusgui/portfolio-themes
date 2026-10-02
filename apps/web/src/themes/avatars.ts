import type { ThemeAvatar, ThemeId } from './registry.ts';

/** Larguras geradas por `npm run avatars`; a menor é o `src` de reserva. */
const WIDTHS = [480, 960] as const;

// `new URL(..., import.meta.url)` com caminho literal: o Vite troca pelo arquivo
// com hash no build, e o Node (scripts) e o Vitest resolvem sem bundler.
const FILES: Record<ThemeId, Record<(typeof WIDTHS)[number], string>> = {
  hacker: {
    480: new URL('../assets/avatars/avatar-hacker-480.webp', import.meta.url).href,
    960: new URL('../assets/avatars/avatar-hacker-960.webp', import.meta.url).href,
  },
  retro: {
    480: new URL('../assets/avatars/avatar-retro-480.webp', import.meta.url).href,
    960: new URL('../assets/avatars/avatar-retro-960.webp', import.meta.url).href,
  },
  minimal: {
    480: new URL('../assets/avatars/avatar-minimal-480.webp', import.meta.url).href,
    960: new URL('../assets/avatars/avatar-minimal-960.webp', import.meta.url).href,
  },
  vscode: {
    480: new URL('../assets/avatars/avatar-vscode-480.webp', import.meta.url).href,
    960: new URL('../assets/avatars/avatar-vscode-960.webp', import.meta.url).href,
  },
  paper: {
    480: new URL('../assets/avatars/avatar-paper-480.webp', import.meta.url).href,
    960: new URL('../assets/avatars/avatar-paper-960.webp', import.meta.url).href,
  },
};

/**
 * Largura da foto no Hero em cada faixa de tela; precisa bater com as classes de
 * largura do `HeroPhoto`. A pré-carga usa o mesmo valor para baixar o mesmo arquivo.
 */
export const AVATAR_SIZES = '(min-width: 80rem) 18rem, (min-width: 48rem) 16rem, 13rem';

/** Foto do tema: retrato vertical 3:4, com `width`/`height` para reservar o espaço. */
export function avatarOf(id: ThemeId): ThemeAvatar {
  const files = FILES[id];
  return {
    src: files[480],
    srcSet: WIDTHS.map((width) => `${files[width]} ${String(width)}w`).join(', '),
    width: 480,
    height: 640,
  };
}

/** Baixa em segundo plano as fotos dos outros temas, para a troca ser instantânea. */
export function preloadAvatars(themes: readonly ThemeId[]) {
  for (const id of themes) {
    const { src, srcSet } = avatarOf(id);
    const image = new Image();
    image.sizes = AVATAR_SIZES;
    image.srcset = srcSet;
    image.src = src;
  }
}
