import { DEFAULT_THEME, isThemeId, type ThemeId } from './registry.ts';

/**
 * Tema inicial: o que o script inline do `index.html` já aplicou antes da pintura
 * (query string > escolha salva > `prefers-color-scheme`).
 */
export function readAppliedTheme(): ThemeId {
  const applied = document.documentElement.dataset.theme;
  return isThemeId(applied) ? applied : DEFAULT_THEME;
}
