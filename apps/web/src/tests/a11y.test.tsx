import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '../app/AppShell.tsx';
import { CONTENT } from '../content/index.ts';
import { THEME_IDS } from '../themes/registry.ts';
import { renderWithProviders } from './render.tsx';

describe.each(THEME_IDS)('tema %s: imagens e ícones para leitores de tela', (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it('todo SVG é decorativo (oculto) ou tem nome acessível', () => {
    renderWithProviders(<AppShell />);

    for (const svg of document.querySelectorAll('svg')) {
      const hidden = svg.closest('[aria-hidden="true"]') !== null;
      const named = svg.getAttribute('role') === 'img' && svg.hasAttribute('aria-label');
      expect(hidden || named, svg.outerHTML.slice(0, 100)).toBe(true);
    }
  });

  it('toda imagem tem alt', () => {
    renderWithProviders(<AppShell />);

    for (const image of document.querySelectorAll('img')) {
      expect(image.hasAttribute('alt'), image.outerHTML).toBe(true);
    }
  });

  it('todo link e botão visível tem nome acessível', () => {
    renderWithProviders(<AppShell />);

    for (const control of [...screen.getAllByRole('link'), ...screen.getAllByRole('button')]) {
      expect(control).toHaveAccessibleName();
    }
  });
});

describe('prints dos projetos', () => {
  it.each(Object.entries(CONTENT))('em %s, todo print tem texto alternativo', (_lang, content) => {
    for (const project of content.projects) {
      for (const image of project.images) {
        expect(image.alt.trim(), image.src).not.toBe('');
        // Formato leve e tamanho declarado (o navegador reserva o espaço antes de baixar).
        expect(image.src).toMatch(/\.(webp|avif)$/);
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
      }
    }
  });
});
