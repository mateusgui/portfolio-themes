import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '../../app/AppShell.tsx';
import { renderWithProviders } from '../../tests/render.tsx';

function sidebar() {
  return within(screen.getByRole('complementary'));
}

beforeEach(() => {
  document.documentElement.dataset.theme = 'paper';
});

describe('tema Papel', () => {
  describe('SidebarItem', () => {
    it('mostra as seções como índice de caderno, com número de página', () => {
      renderWithProviders(<AppShell />);
      const links = sidebar().getAllByRole('link').slice(0, 7);

      expect(links.map((link) => link.textContent)).toEqual([
        'Início01',
        'Sobre02',
        'Skills03',
        'Projetos04',
        'Experiência05',
        'Formação06',
        'Contato07',
      ]);
    });

    it('o nome acessível continua sendo só o nome da seção', () => {
      renderWithProviders(<AppShell />);

      expect(sidebar().getByRole('link', { name: 'Projetos' })).toBeInTheDocument();
    });

    it('o marca-texto acompanha o item ativo', async () => {
      renderWithProviders(<AppShell />);
      expect(sidebar().getByTestId('highlighter')).toHaveTextContent('Início');

      await userEvent.click(sidebar().getByRole('link', { name: 'Projetos' }));

      expect(sidebar().getAllByTestId('highlighter')).toHaveLength(1);
      expect(sidebar().getByTestId('highlighter')).toHaveTextContent('Projetos');
      expect(sidebar().getByRole('link', { name: 'Projetos' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });
  });

  describe('SectionHeader', () => {
    it('sublinha os títulos com um rabisco decorativo, sem mudar o nome acessível', () => {
      renderWithProviders(<AppShell />);
      const heading = screen.getByRole('heading', { level: 2, name: 'Sobre' });

      expect(within(heading).getByTestId('scribble-underline')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(heading).toHaveTextContent(/^Sobre$/);
    });

    it('o Hero continua com o nome como h1', () => {
      renderWithProviders(<AppShell />);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Mateus Guimarães Moraes Vilela' }),
      ).toBeInTheDocument();
    });
  });

  describe('Decoration', () => {
    it('os rabiscos são decorativos e não recebem clique', () => {
      renderWithProviders(<AppShell />);
      const doodles = screen.getByTestId('paper-doodles');

      expect(doodles).toHaveAttribute('aria-hidden', 'true');
      expect(doodles).toHaveClass('pointer-events-none');
    });
  });

  it('os cards de projeto são marcados para virar post-its', () => {
    renderWithProviders(<AppShell />);
    const cards = within(screen.getByRole('region', { name: 'Projetos' })).getAllByRole('article');

    expect(cards).toHaveLength(4);
    for (const card of cards) expect(card).toHaveAttribute('data-card', 'project');
  });
});
