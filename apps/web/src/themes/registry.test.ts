import { describe, expect, it } from 'vitest';

import { resources } from '../i18n/index.ts';
import { getLoadedSlots, loadThemeSlots } from './loadThemeSlots.ts';
import { THEMES, isThemeId } from './registry.ts';

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

  it('carrega os slots de cada tema sob demanda, uma vez só', async () => {
    const slots = await loadThemeSlots('vscode');

    expect(slots.SidebarItem).toBeDefined();
    expect(slots.Decoration).toBeDefined();
    expect(getLoadedSlots('vscode')).toBe(slots);
    expect(await loadThemeSlots('vscode')).toBe(slots);
  });

  it('o Minimalista não tem slots: só tokens', async () => {
    expect(await loadThemeSlots('minimal')).toEqual({});
  });
});
