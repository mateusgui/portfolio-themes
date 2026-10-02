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
    expect(screen.getByRole('combobox', { name: 'Temas' })).toHaveValue('paper');
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

  it('o seletor compacto (mobile) também troca o tema', async () => {
    renderWithProviders(<ThemeSwitcher />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Temas' }), 'vscode');

    expect(document.documentElement.dataset.theme).toBe('vscode');
    expect(pressed()).toEqual(['VS Code']);
  });

  it('acompanha o idioma', async () => {
    await i18n.changeLanguage('en');

    renderWithProviders(<ThemeSwitcher />);

    expect(screen.getByRole('group', { name: 'Themes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paper' })).toBeInTheDocument();
  });
});
