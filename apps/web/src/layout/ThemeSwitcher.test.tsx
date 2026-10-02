import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import i18n from '../i18n/index.ts';
import { renderWithProviders } from '../tests/render.tsx';
import { THEME_STORAGE_KEY } from '../themes/registry.ts';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

function buttons() {
  return within(screen.getByRole('group', { name: 'Temas' })).getAllByRole('button');
}

function pressed() {
  return buttons()
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .map((button) => button.textContent);
}

describe('ThemeSwitcher', () => {
  it('mostra os 5 temas com nomes traduzidos', () => {
    renderWithProviders(<ThemeSwitcher />);

    expect(buttons().map((button) => button.textContent)).toEqual([
      'Hacker',
      'Retrô',
      'Minimalista',
      'VS Code',
      'Papel',
    ]);
  });

  it('começa no tema que o script inline aplicou', () => {
    document.documentElement.dataset.theme = 'paper';

    renderWithProviders(<ThemeSwitcher />);

    expect(pressed()).toEqual(['Papel']);
  });

  it('com data-theme inválido, usa o Minimalista', () => {
    document.documentElement.dataset.theme = 'dark';

    renderWithProviders(<ThemeSwitcher />);

    expect(pressed()).toEqual(['Minimalista']);
    expect(document.documentElement.dataset.theme).toBe('minimal');
  });

  it('clicar num tema aplica no <html> e salva a escolha', async () => {
    renderWithProviders(<ThemeSwitcher />);

    await userEvent.click(screen.getByRole('button', { name: 'Hacker' }));

    expect(pressed()).toEqual(['Hacker']);
    expect(document.documentElement.dataset.theme).toBe('hacker');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('hacker');
  });

  it('cada botão tem um ícone decorativo e o nome do tema em aria-label e title', () => {
    renderWithProviders(<ThemeSwitcher />);

    const icons = buttons().map((button) => {
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      // Em telas estreitas só o ícone aparece: o nome precisa estar nos atributos.
      expect(button).toHaveAttribute('aria-label', button.textContent);
      expect(button).toHaveAttribute('title', button.textContent);
      return svg?.getAttribute('class')?.match(/lucide-[a-z-]+/)?.[0];
    });

    expect(icons).toEqual([
      'lucide-terminal',
      'lucide-joystick',
      'lucide-circle',
      'lucide-braces',
      'lucide-notebook-pen',
    ]);
  });

  it('não há mais seletor compacto: os mesmos botões valem para o mobile', async () => {
    renderWithProviders(<ThemeSwitcher />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'VS Code' }));

    expect(document.documentElement.dataset.theme).toBe('vscode');
    expect(pressed()).toEqual(['VS Code']);
    // No VS Code o botão é desenhado pelo slot do tema, que mantém o ícone.
    expect(
      screen.getByRole('button', { name: 'Papel' }).querySelector('svg.lucide-notebook-pen'),
    ).not.toBeNull();
  });

  it('acompanha o idioma', async () => {
    await i18n.changeLanguage('en');

    renderWithProviders(<ThemeSwitcher />);

    expect(screen.getByRole('group', { name: 'Themes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paper' })).toBeInTheDocument();
  });
});
