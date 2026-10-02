import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import i18n from '../i18n/index.ts';
import { LANGUAGE_STORAGE_KEY } from '../i18n/languages.ts';
import { renderWithProviders } from '../tests/render.tsx';
import { Navbar } from './Navbar.tsx';

function renderNavbar(props: Partial<Parameters<typeof Navbar>[0]> = {}) {
  const onOpenMenu = vi.fn();
  const onNavigate = vi.fn();
  renderWithProviders(
    <Navbar
      menuId="menu-mobile"
      menuOpen={false}
      onOpenMenu={onOpenMenu}
      onNavigate={onNavigate}
      {...props}
    />,
  );
  return { onOpenMenu, onNavigate };
}

describe('Navbar', () => {
  it('é o cabeçalho (landmark banner)', () => {
    renderNavbar();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('mostra o ícone "MG" e o nome num link para o início', async () => {
    const { onNavigate } = renderNavbar();

    const brand = screen.getByRole('link', {
      name: 'Mateus Guimarães Moraes Vilela, ir para o início',
    });

    expect(brand).toHaveAttribute('href', '#inicio');
    expect(brand).toHaveTextContent('MGMateus Guimarães Moraes Vilela');
    // As iniciais são decorativas: o nome completo já está no nome acessível.
    expect(within(brand).getByText('MG')).toHaveAttribute('aria-hidden', 'true');

    await userEvent.click(brand);

    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('inicio');
  });

  it('o nome do link acompanha o idioma', async () => {
    await i18n.changeLanguage('en');
    renderNavbar();

    expect(
      screen.getByRole('link', { name: 'Mateus Guimarães Moraes Vilela, go to the top' }),
    ).toBeInTheDocument();
  });

  it('identidade à esquerda, temas no centro e idioma à direita, num grid de 3 colunas', () => {
    renderNavbar();

    const header = screen.getByRole('banner');
    const [left, center, right] = [...header.children];

    expect(header.children).toHaveLength(3);
    // Laterais iguais (`1fr`) deixam a coluna do meio no centro da barra.
    expect(header.className).toContain('grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]');
    expect(left).toContainElement(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(left).toContainElement(screen.getByRole('link', { name: /^Mateus Guimarães/ }));
    expect(center).toBe(screen.getByRole('group', { name: 'Temas' }));
    expect(right).toContainElement(screen.getByRole('combobox', { name: 'Idioma' }));
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
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es');
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
