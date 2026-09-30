import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

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
    render(<AppShell />);

    await userEvent.tab();

    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' });
    expect(skipLink).toHaveFocus();
    expect(skipLink).toHaveAttribute('href', '#conteudo');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('renderiza as 7 seções com id estável e título h2', () => {
    render(<AppShell />);

    const main = screen.getByRole('main');
    const headings = within(main).getAllByRole('heading', { level: 2 });

    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Início',
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
    render(<AppShell />);
    const sidebar = screen.getByRole('complementary');

    await userEvent.click(within(sidebar).getByRole('link', { name: 'Projetos' }));

    expect(within(sidebar).getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
  });

  describe('drawer mobile', () => {
    it('abre pelo botão de menu', async () => {
      render(<AppShell />);

      const drawer = await openDrawer();

      expect(drawer).toHaveAttribute('open');
      expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(within(drawer).getByRole('navigation', { name: 'Seções' })).toBeInTheDocument();
    });

    it('fecha pelo botão de fechar', async () => {
      render(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByRole('button', { name: 'Fechar menu' }));

      expect(drawer).not.toHaveAttribute('open');
      expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('fecha ao navegar para uma seção', async () => {
      render(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByRole('link', { name: 'Projetos' }));

      expect(drawer).not.toHaveAttribute('open');
      expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
    });

    it('fecha ao clicar fora do painel (backdrop)', async () => {
      render(<AppShell />);
      const drawer = await openDrawer();

      fireEvent.click(drawer);

      expect(drawer).not.toHaveAttribute('open');
    });

    it('continua aberto ao clicar dentro do painel', async () => {
      render(<AppShell />);
      const drawer = await openDrawer();

      await userEvent.click(within(drawer).getByText('Desenvolvedor Full Stack'));

      expect(drawer).toHaveAttribute('open');
    });
  });
});
