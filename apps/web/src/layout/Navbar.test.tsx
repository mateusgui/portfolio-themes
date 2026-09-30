import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Navbar } from './Navbar.tsx';

function renderNavbar(props: Partial<Parameters<typeof Navbar>[0]> = {}) {
  const onOpenMenu = vi.fn();
  render(<Navbar menuId="menu-mobile" menuOpen={false} onOpenMenu={onOpenMenu} {...props} />);
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

  it('mostra o seletor de idioma', () => {
    renderNavbar();

    expect(screen.getByRole('button', { name: 'Idioma: Português' })).toBeInTheDocument();
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
