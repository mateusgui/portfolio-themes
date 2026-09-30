import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../tests/render.tsx';
import { Navbar } from './Navbar.tsx';

function renderNavbar(props: Partial<Parameters<typeof Navbar>[0]> = {}) {
  const onOpenMenu = vi.fn();
  renderWithProviders(
    <Navbar menuId="menu-mobile" menuOpen={false} onOpenMenu={onOpenMenu} {...props} />,
  );
  return { onOpenMenu };
}

describe('Navbar', () => {
  it('é o cabeçalho (landmark banner)', () => {
    renderNavbar();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('mostra os 5 temas com o Minimalista pressionado', () => {
    renderNavbar();

    const group = screen.getByRole('group', { name: 'Temas' });
    const buttons = within(group).getAllByRole('button');

    expect(buttons.map((button) => button.textContent)).toEqual([
      'Hacker',
      'Retrô',
      'Minimalista',
      'VS Code',
      'Papel',
    ]);
    expect(within(group).getByRole('button', { name: 'Minimalista' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: 'Hacker' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('o seletor de idioma lista cada idioma no próprio nome', () => {
    renderNavbar();

    const select = screen.getByRole('combobox', { name: 'Idioma' });
    const options = within(select).getAllByRole('option');

    expect(select).toHaveValue('pt-BR');
    expect(options.map((option) => [option.textContent, option.getAttribute('lang')])).toEqual([
      ['Português', 'pt-BR'],
      ['English', 'en'],
      ['Español', 'es'],
    ]);
  });

  it('trocar o idioma traduz a interface e salva a escolha', async () => {
    renderNavbar();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'es');

    expect(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es');
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
    expect(localStorage.getItem('portfolio:lang')).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe('Mateus Guimarães | Desarrollador Full Stack');
  });

  it('botão de menu controla o drawer e reflete o estado', async () => {
    const { onOpenMenu } = renderNavbar();
    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });

    expect(menuButton).toHaveAttribute('aria-controls', 'menu-mobile');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(menuButton);

    expect(onOpenMenu).toHaveBeenCalledOnce();
  });

  it('marca o menu como expandido quando aberto', () => {
    renderNavbar({ menuOpen: true });

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
