import { describe, expect, it } from 'vitest';

import { resources } from '../i18n/index.ts';
import { THEMES, getTheme, isThemeId } from './registry.ts';

describe('registro de temas', () => {
  it('registra os 5 temas na ordem da navbar', () => {
    expect(THEMES.map(({ id }) => id)).toEqual(['hacker', 'retro', 'minimal', 'vscode', 'paper']);
  });

  it.each(['pt-BR', 'en', 'es'] as const)('todo labelKey tem tradução em %s', (language) => {
    const names: Record<string, string> = resources[language].common.themes;
    for (const { id, labelKey } of THEMES) {
      expect(labelKey).toBe(`themes.${id}`);
      expect(names[id]).toBeTruthy();
    }
  });

  it('valida ids de tema', () => {
    expect(isThemeId('paper')).toBe(true);
    expect(isThemeId('dark')).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });

  it('getTheme devolve a definição do tema', () => {
    expect(getTheme('vscode').id).toBe('vscode');
  });
});
