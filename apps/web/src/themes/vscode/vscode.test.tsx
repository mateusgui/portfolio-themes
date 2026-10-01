import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '../../app/AppShell.tsx';
import { changeLanguage } from '../../i18n/index.ts';
import { MockIntersectionObserver } from '../../tests/intersectionObserver.ts';
import { renderWithProviders } from '../../tests/render.tsx';

function explorer() {
  return within(screen.getByRole('navigation', { name: 'Seções' }));
}

/** Texto do link sem as partes decorativas (`aria-hidden`), como o leitor de tela lê. */
function spokenText(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return clone.textContent;
}

function explorerNames() {
  return explorer().getAllByRole('link').map(spokenText);
}

beforeEach(() => {
  document.documentElement.dataset.theme = 'vscode';
});

describe('tema VS Code', () => {
  describe('SidebarItem (Explorer)', () => {
    it('mostra cada seção como arquivo, com a extensão do tipo', () => {
      renderWithProviders(<AppShell />);

      expect(explorerNames()).toEqual([
        'index.jsx',
        'sobre.md',
        'skills.json',
        'projetos.ts',
        'experiencia.php',
        'formacao.py',
        'contato.env',
      ]);
      expect(explorer().getByRole('link', { name: 'sobre.md' })).toBeInTheDocument();
    });

    it.each([
      [
        'en',
        [
          'index.jsx',
          'about.md',
          'skills.json',
          'projects.ts',
          'experience.php',
          'education.py',
          'contact.env',
        ],
      ],
      [
        'es',
        [
          'index.jsx',
          'sobre-mi.md',
          'habilidades.json',
          'proyectos.ts',
          'experiencia.php',
          'formacion.py',
          'contacto.env',
        ],
      ],
    ] as const)('os nomes seguem o idioma (%s), com as mesmas extensões', async (lang, names) => {
      renderWithProviders(<AppShell />);

      await act(async () => {
        await changeLanguage(lang);
      });

      const nav = within(screen.getByRole('complementary')).getAllByRole('navigation')[0];
      if (!nav) throw new Error('Explorer não encontrado');
      const links = within(nav).getAllByRole('link');
      expect(links.map(spokenText)).toEqual(names);
    });

    it('o ícone de arquivo é decorativo', () => {
      renderWithProviders(<AppShell />);
      const link = explorer().getByRole('link', { name: 'projetos.ts' });

      expect(link.querySelector('[data-file-icon="ts"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('o item ativo acompanha a navegação e foca o título', async () => {
      renderWithProviders(<AppShell />);

      await userEvent.click(explorer().getByRole('link', { name: 'projetos.ts' }));

      expect(explorer().getByRole('link', { name: 'projetos.ts' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(screen.getByRole('heading', { name: 'Projetos' })).toHaveFocus();
    });
  });

  describe('abas', () => {
    it('no desktop, a aba mostra o arquivo da seção atual', async () => {
      renderWithProviders(<AppShell />);
      expect(screen.getByTestId('active-tab')).toHaveTextContent('index.jsx');

      await userEvent.click(explorer().getByRole('link', { name: 'formacao.py' }));

      expect(screen.getByTestId('active-tab')).toHaveTextContent('formacao.py');
    });

    it('no mobile, as abas navegam entre os arquivos', async () => {
      renderWithProviders(<AppShell />);
      const tabs = within(screen.getByRole('navigation', { name: 'Arquivos abertos' }));

      expect(tabs.getAllByRole('link')).toHaveLength(7);
      expect(tabs.getByRole('link', { name: 'index.jsx' })).toHaveAttribute(
        'aria-current',
        'location',
      );

      await userEvent.click(tabs.getByRole('link', { name: 'contato.env' }));

      expect(tabs.getByRole('link', { name: 'contato.env' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(screen.getByRole('heading', { name: 'Contato' })).toHaveFocus();
    });
  });

  describe('SectionHeader', () => {
    it.each([
      ['Sobre', '## Sobre'],
      ['Skills', '"Skills": {'],
      ['Projetos', 'export const Projetos = ['],
      ['Experiência', '<?php // Experiência'],
      ['Formação', 'class Formação:'],
      ['Contato', '# Contato'],
    ])('%s vira a primeira linha do arquivo, sem mudar o nome acessível', (title, code) => {
      renderWithProviders(<AppShell />);
      const heading = screen.getByRole('heading', { level: 2, name: title });

      expect(heading).toHaveTextContent(code);
      expect(within(heading).getByTestId('breadcrumb')).toHaveAttribute('aria-hidden', 'true');
    });

    it('o Hero vira JSX, com o nome como nome acessível', () => {
      renderWithProviders(<AppShell />);
      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Mateus Guimarães Moraes Vilela',
      });

      expect(heading).toHaveTextContent('<h1>Mateus Guimarães Moraes Vilela</h1>');
      expect(within(heading).getByTestId('breadcrumb')).toHaveTextContent('index.jsx');
    });
  });

  describe('ThemeButton', () => {
    it('marca o tema atual com ✓, sem mudar o nome do botão', () => {
      renderWithProviders(<AppShell />);
      const themes = within(screen.getByRole('group', { name: 'Temas' }));

      const current = themes.getByRole('button', { name: 'VS Code' });
      expect(current).toHaveAttribute('aria-pressed', 'true');
      expect(within(current).getByTestId('theme-check')).toBeInTheDocument();
      expect(themes.getAllByTestId('theme-check')).toHaveLength(1);
    });
  });

  it('contato.env mostra só e-mail, LinkedIn e GitHub', () => {
    renderWithProviders(<AppShell />);
    const contact = screen.getByRole('region', { name: 'Contato' });

    const keys = [...contact.querySelectorAll('[data-env-key]')].map((item) =>
      item.getAttribute('data-env-key'),
    );
    expect(keys).toEqual(['EMAIL', 'LINKEDIN', 'GITHUB']);
  });

  it('a status bar é decorativa e mostra idioma e tema', () => {
    renderWithProviders(<AppShell />);
    const status = screen.getByTestId('status-bar');

    expect(status).toHaveAttribute('aria-hidden', 'true');
    expect(status).toHaveTextContent('main');
    expect(status).toHaveTextContent('Português');
    expect(status).toHaveTextContent('VS Code');
  });

  it('outros temas não usam os slots do VS Code', () => {
    document.documentElement.dataset.theme = 'minimal';

    renderWithProviders(<AppShell />);

    expect(screen.queryByTestId('status-bar')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Arquivos abertos' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('theme-check')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Sobre' })).toHaveTextContent(/^Sobre$/);
  });
});

describe('abas do mobile: a ativa fica visível na faixa', () => {
  /** O jsdom não faz layout: cada aba mede 100px, numa faixa de 300px. */
  function layOutTabs(list: HTMLElement) {
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 });
    list.querySelectorAll('a').forEach((tab, index) => {
      Object.defineProperty(tab, 'offsetLeft', { configurable: true, value: index * 100 });
      Object.defineProperty(tab, 'offsetWidth', { configurable: true, value: 100 });
    });
  }

  // No jsdom nada rola: sem isto, a retomada do observer (até 1 s depois do clique)
  // acharia a página no topo e ativaria index.jsx se o teste rodasse devagar. Aqui
  // a página "rola" como no navegador: meio da página, seção clicada na faixa.
  function scrollPageTo(id: string) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });
    const others = ['inicio', 'sobre', 'skills', 'projetos', 'experiencia', 'formacao', 'contato'];
    MockIntersectionObserver.latest().trigger(
      Object.fromEntries(others.map((section) => [section, section === id])),
    );
  }

  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 10_000,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    Reflect.deleteProperty(document.documentElement, 'scrollHeight');
  });

  it('rola a faixa para a direita e para a esquerda conforme a aba ativa', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell />);
    const nav = screen.getByRole('navigation', { name: 'Arquivos abertos' });
    const list = nav.querySelector('ul');
    if (!list) throw new Error('faixa de abas não encontrada');
    layOutTabs(list);
    const tabs = within(nav);

    // contato.env é a 7ª aba (600–700px): a faixa rola até mostrá-la inteira.
    await user.click(tabs.getByRole('link', { name: 'contato.env' }));
    act(() => {
      scrollPageTo('contato');
    });
    expect(list.scrollLeft).toBe(400);

    // skills.json (200–300px) já está à esquerda da área visível: a faixa volta.
    await user.click(tabs.getByRole('link', { name: 'skills.json' }));
    act(() => {
      scrollPageTo('skills');
    });
    expect(list.scrollLeft).toBe(200);

    // projetos.ts (300–400px) já está visível: nada muda.
    await user.click(tabs.getByRole('link', { name: 'projetos.ts' }));
    act(() => {
      scrollPageTo('projetos');
    });
    expect(list.scrollLeft).toBe(200);
  });
});
