import { describe, expect, it, vi } from 'vitest';

import { resources } from '../i18n/index.ts';
import { getLoadedSlots, loadThemeSlots } from './loadThemeSlots.ts';
import { AVATAR_SIZES, preloadAvatars } from './avatars.ts';
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

  it('cada tema aponta para o seu ícone e a sua foto (WebP 3:4 em 480 e 960 px)', () => {
    for (const { id, icon, avatar } of THEMES) {
      expect(icon).toBeDefined();
      expect(avatar.src).toContain(`avatar-${id}-480.webp`);
      expect(avatar.srcSet).toContain(`avatar-${id}-960.webp 960w`);
      expect(avatar.width / avatar.height).toBe(3 / 4);
      expect(getTheme(id).avatar).toBe(avatar);
    }
    expect(new Set(THEMES.map(({ icon }) => icon)).size).toBe(THEMES.length);
    expect(new Set(THEMES.map(({ avatar }) => avatar.src)).size).toBe(THEMES.length);
  });

  it('os arquivos das fotos existem', () => {
    const files = Object.keys(import.meta.glob('../assets/avatars/*.webp'));

    for (const { id } of THEMES) {
      expect(files).toContain(`../assets/avatars/avatar-${id}-480.webp`);
      expect(files).toContain(`../assets/avatars/avatar-${id}-960.webp`);
    }
    // Só os WebP gerados ficam na pasta (os originais não são versionados).
    expect(files).toHaveLength(THEMES.length * 2);
  });

  it('pré-carrega as fotos pedidas, com o mesmo srcset e sizes do Hero', () => {
    const created: HTMLImageElement[] = [];
    const OriginalImage = window.Image;
    vi.stubGlobal(
      'Image',
      class extends OriginalImage {
        constructor() {
          super();
          created.push(this);
        }
      },
    );

    preloadAvatars(['hacker', 'paper']);
    vi.unstubAllGlobals();

    expect(created.map((image) => image.getAttribute('src'))).toEqual([
      getTheme('hacker').avatar.src,
      getTheme('paper').avatar.src,
    ]);
    expect(created[0]?.srcset).toBe(getTheme('hacker').avatar.srcSet);
    expect(created[0]?.sizes).toBe(AVATAR_SIZES);
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
