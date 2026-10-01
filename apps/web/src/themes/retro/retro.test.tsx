import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '../../app/AppShell.tsx';
import { renderWithProviders } from '../../tests/render.tsx';
import { VISITS_STORAGE_KEY } from './RetroBar.tsx';

const NAME = 'Mateus Guimarães Moraes Vilela';

function setReducedMotion(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: reduce && query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

function sidebar() {
  return within(screen.getByRole('complementary'));
}

beforeEach(() => {
  document.documentElement.dataset.theme = 'retro';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tema Retrô', () => {
  describe('SidebarItem', () => {
    it('mostra a seta só no item ativo, fora do nome acessível', async () => {
      renderWithProviders(<AppShell />);

      expect(sidebar().getByRole('link', { name: 'Início' })).toHaveTextContent(/^Início◄$/);
      expect(sidebar().getByRole('link', { name: 'Sobre' })).toHaveTextContent(/^Sobre$/);

      await userEvent.click(sidebar().getByRole('link', { name: 'Projetos' }));

      expect(sidebar().getAllByTestId('retro-pointer')).toHaveLength(1);
      expect(sidebar().getByRole('link', { name: 'Projetos' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
    });

    it('as listas da sidebar têm ganchos estáveis para o CSS do tema', () => {
      renderWithProviders(<AppShell />);

      expect(screen.getByRole('navigation', { name: 'Seções' })).toHaveAttribute(
        'data-nav',
        'sections',
      );
      expect(screen.getByRole('navigation', { name: 'Links externos' })).toHaveAttribute(
        'data-nav',
        'external',
      );
    });
  });

  describe('SectionHeader', () => {
    it('títulos viram barra de janela, com botões só de enfeite', () => {
      renderWithProviders(<AppShell />);
      const heading = screen.getByRole('heading', { level: 2, name: 'Sobre' });

      expect(within(heading).getByTestId('window-controls')).toHaveAttribute('aria-hidden', 'true');
      expect(within(heading).queryByRole('button')).not.toBeInTheDocument();
    });

    it('o nome no Hero ganha estrelas decorativas sem mudar o nome acessível', () => {
      renderWithProviders(<AppShell />);
      const heading = screen.getByRole('heading', { level: 1, name: NAME });

      const sparkles = within(heading).getAllByTestId('sparkle');
      expect(sparkles).toHaveLength(2);
      for (const sparkle of sparkles) expect(sparkle).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Decoration', () => {
    it('mostra letreiro, selo "em construção" e contador', () => {
      renderWithProviders(<AppShell />);

      expect(screen.getByTestId('marquee')).toHaveTextContent('Bem-vindo(a) ao meu portfólio!');
      expect(screen.getByTestId('under-construction')).toHaveTextContent('Em construção');
      expect(screen.getByTestId('visitor-counter')).toHaveTextContent(/^Visitantes:\d{6}$/);
    });

    it('o botão pausa e retoma o letreiro', async () => {
      renderWithProviders(<AppShell />);
      const button = screen.getByRole('button', { name: 'Pausar letreiro' });

      expect(button).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(button);

      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('marquee')).toHaveStyle({ animationPlayState: 'paused' });

      await userEvent.click(button);
      expect(screen.getByTestId('marquee')).not.toHaveStyle({ animationPlayState: 'paused' });
    });

    it('o contador é falso, local e fica fora dos leitores de tela', () => {
      localStorage.setItem(VISITS_STORAGE_KEY, '4241');

      renderWithProviders(<AppShell />);

      const counter = screen.getByTestId('visitor-counter');
      expect(counter).toHaveAttribute('aria-hidden', 'true');
      expect(counter).toHaveTextContent('004242');
      expect(localStorage.getItem(VISITS_STORAGE_KEY)).toBe('4242');
    });

    it('sem número salvo, sorteia um de quatro dígitos', () => {
      renderWithProviders(<AppShell />);

      expect(Number(localStorage.getItem(VISITS_STORAGE_KEY))).toBeGreaterThanOrEqual(1000);
      expect(Number(localStorage.getItem(VISITS_STORAGE_KEY))).toBeLessThan(10000);
    });

    it('os ornamentos são decorativos', () => {
      renderWithProviders(<AppShell />);

      expect(screen.getByTestId('under-construction')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByTestId('marquee').closest('[aria-hidden="true"]')).not.toBeNull();
      const ornaments = [
        ...screen.getByTestId('retro-bar').querySelectorAll('svg'),
        ...screen
          .getAllByRole('heading')
          .flatMap((heading) => [...heading.querySelectorAll('svg')]),
      ];
      expect(ornaments.length).toBeGreaterThan(0);
      for (const svg of ornaments) {
        expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
      }
    });

    it('com movimento reduzido, o letreiro fica parado e sem botão de pausa', () => {
      setReducedMotion(true);

      renderWithProviders(<AppShell />);

      expect(screen.getByTestId('marquee')).toHaveTextContent('Bem-vindo(a) ao meu portfólio!');
      expect(within(screen.getByTestId('marquee')).getAllByText(/Bem-vindo/)).toHaveLength(1);
      expect(screen.queryByRole('button', { name: 'Pausar letreiro' })).not.toBeInTheDocument();
    });
  });

  it('outros temas não usam os slots do Retrô', () => {
    document.documentElement.dataset.theme = 'minimal';

    renderWithProviders(<AppShell />);

    expect(screen.queryByTestId('retro-bar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('window-controls')).not.toBeInTheDocument();
    expect(sidebar().queryByTestId('retro-pointer')).not.toBeInTheDocument();
  });
});
