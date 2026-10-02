import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../tests/render.tsx';
import { AppShell } from './AppShell.tsx';

function getDrawer() {
  return document.getElementById('menu-mobile') as HTMLDialogElement;
}

async function openDrawer() {
  await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  return getDrawer();
}

describe('AppShell', () => {
  it('o skip link é o primeiro elemento focável e aponta para o conteúdo', async () => {
    renderWithProviders(<AppShell />);

    await userEvent.tab();

    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' });
    expect(skipLink).toHaveFocus();
    expect(skipLink).toHaveAttribute('href', '#conteudo');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('renderiza as 7 seções com id estável: o Hero com h1 e as demais com h2', () => {
    renderWithProviders(<AppShell />);

    const main = screen.getByRole('main');
    const headings = within(main).getAllByRole('heading', { level: 2 });

    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Mateus Guimarães Moraes Vilela',
    );
    expect(screen.getByRole('region', { name: 'Mateus Guimarães Moraes Vilela' })).toHaveAttribute(
      'id',
      'inicio',
    );
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Sobre',
      'Skills',
      'Projetos',
      'Experiência',
      'Formação',
      'Contato',
    ]);
    expect(screen.getByRole('region', { name: 'Projetos' })).toHaveAttribute('id', 'projetos');
  });

  it('navegar pela sidebar destaca o item e foca o título da seção', async () => {
    renderWithProviders(<AppShell />);
    const sidebar = screen.getByRole('complementary');

    await userEvent.click(within(sidebar).getByRole('link', { name: 'Projetos' }));

    expect(within(sidebar).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
  });

  it('o nome fica na navbar e o link leva ao início, focando o título', async () => {
    renderWithProviders(<AppShell />);
    const sidebar = screen.getByRole('complementary');
    await userEvent.click(within(sidebar).getByRole('link', { name: 'Projetos' }));

    await userEvent.click(
      within(screen.getByRole('banner')).getByRole('link', { name: /^Mateus Guimarães/ }),
    );

    expect(within(sidebar).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    expect(within(sidebar).queryByText(/Mateus/)).not.toBeInTheDocument();
  });

  describe('drawer mobile', () => {
    it('abre pelo botão de menu', async () => {
      renderWithProviders(<AppShell />);

      const drawer = await openDrawer();

      expect(drawer).toHaveAttribute('open');
      expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(within(drawer).getByRole('navigation', { name: 'Seções' })).toBeInTheDocument();
      expect(within(drawer).queryByText(/Mateus/)).not.toBeInTheDocument();
    });

    it('fecha pelo botão de fechar', async () => {
      renderWithProviders(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByRole('button', { name: 'Fechar menu' }));

      expect(drawer).not.toHaveAttribute('open');
      expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('fecha ao navegar para uma seção', async () => {
      renderWithProviders(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByRole('link', { name: 'Projetos' }));

      expect(drawer).not.toHaveAttribute('open');
      expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
    });

    it('fecha ao clicar fora do painel (backdrop)', async () => {
      renderWithProviders(<AppShell />);
      const drawer = await openDrawer();

      fireEvent.click(drawer);

      expect(drawer).not.toHaveAttribute('open');
    });

    it('continua aberto ao clicar dentro do painel', async () => {
      renderWithProviders(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByRole('navigation', { name: 'Seções' }));

      expect(drawer).toHaveAttribute('open');
    });
  });
});
