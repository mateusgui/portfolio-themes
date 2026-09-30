import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '../../app/AppShell.tsx';
import { renderWithProviders } from '../../tests/render.tsx';
import { RAIN_STORAGE_KEY } from './CharacterRain.tsx';
import { TYPING_INTERVAL } from './HackerSectionHeader.tsx';

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

/** Cada letra agenda a próxima depois do render: avança uma de cada vez. */
function typeLetters(count: number) {
  for (let i = 0; i < count; i++) {
    act(() => {
      vi.advanceTimersByTime(TYPING_INTERVAL);
    });
  }
}

function sidebarLinks() {
  return within(screen.getByRole('complementary')).getAllByRole('link');
}

beforeEach(() => {
  document.documentElement.dataset.theme = 'hacker';
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('tema Hacker', () => {
  describe('SidebarItem', () => {
    it('mostra as seções como comandos, com cursor só no item ativo', () => {
      renderWithProviders(<AppShell />);
      const [inicio, sobre] = sidebarLinks();

      expect(inicio).toHaveTextContent(/^>início█$/);
      expect(sobre).toHaveTextContent(/^>sobre$/);
      expect(sobre).not.toHaveTextContent('█');
      expect(within(screen.getByRole('complementary')).getAllByTestId('cursor')).toHaveLength(1);
    });

    it('mantém a navegação: aria-current e foco no título', async () => {
      renderWithProviders(<AppShell />);

      await userEvent.click(
        within(screen.getByRole('complementary')).getByRole('link', { name: /projetos/ }),
      );

      expect(
        within(screen.getByRole('complementary')).getByRole('link', { name: /projetos/ }),
      ).toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
    });
  });

  describe('SectionHeader', () => {
    it('digita o nome no Hero letra a letra, com o nome inteiro para leitores de tela', () => {
      vi.useFakeTimers();
      renderWithProviders(<AppShell />);
      const typed = screen.getByTestId('typed');

      expect(screen.getByRole('heading', { level: 1, name: NAME })).toBeInTheDocument();
      expect(typed).toHaveTextContent(/^█$/);

      typeLetters(6);
      expect(typed).toHaveTextContent(/^Mateus█$/);

      typeLetters(NAME.length);
      expect(typed).toHaveTextContent(`${NAME}█`);
    });

    it('com movimento reduzido, mostra o nome inteiro de uma vez', () => {
      setReducedMotion(true);

      renderWithProviders(<AppShell />);

      expect(screen.getByTestId('typed')).toHaveTextContent(`${NAME}█`);
    });

    it('as seções ganham o prefixo "#" sem mudar o nome acessível', () => {
      renderWithProviders(<AppShell />);

      expect(screen.getByRole('heading', { level: 2, name: 'Sobre' })).toHaveTextContent('# Sobre');
    });
  });

  describe('Decoration (chuva de caracteres)', () => {
    it('começa ligada e o botão desliga e salva a escolha', async () => {
      renderWithProviders(<AppShell />);
      const button = screen.getByRole('button', { name: 'Chuva de caracteres' });

      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('character-rain')).toHaveAttribute('aria-hidden', 'true');

      await userEvent.click(button);

      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(screen.queryByTestId('character-rain')).not.toBeInTheDocument();
      expect(localStorage.getItem(RAIN_STORAGE_KEY)).toBe('off');
    });

    it('respeita a escolha salva', () => {
      localStorage.setItem(RAIN_STORAGE_KEY, 'off');

      renderWithProviders(<AppShell />);

      expect(screen.getByRole('button', { name: 'Chuva de caracteres' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.queryByTestId('character-rain')).not.toBeInTheDocument();
    });

    it('com movimento reduzido, não há chuva nem botão', () => {
      setReducedMotion(true);

      renderWithProviders(<AppShell />);

      expect(screen.queryByTestId('character-rain')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Chuva de caracteres' })).not.toBeInTheDocument();
    });
  });

  it('outros temas não usam os slots do Hacker', () => {
    document.documentElement.dataset.theme = 'minimal';

    renderWithProviders(<AppShell />);

    expect(sidebarLinks()[0]).toHaveTextContent(/^Início$/);
    expect(screen.queryByTestId('character-rain')).not.toBeInTheDocument();
    expect(screen.queryByTestId('typed')).not.toBeInTheDocument();
  });
});
