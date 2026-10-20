import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { AppShell } from '../app/AppShell.tsx';
import { availability } from '../content/profile.ts';
import i18n, { resources } from '../i18n/index.ts';
import { renderWithProviders } from '../tests/render.tsx';
import { THEME_IDS } from '../themes/registry.ts';

function region(name: string) {
  return screen.getByRole('region', { name });
}

afterEach(() => {
  availability.open = true;
});

describe('Hero', () => {
  it('mostra nome (h1), cargo, frase de impacto e local', () => {
    renderWithProviders(<AppShell />);
    const hero = region('Mateus Guimarães Moraes Vilela');

    expect(within(hero).getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(within(hero).getByText('Desenvolvedor Full Stack')).toBeInTheDocument();
    expect(within(hero).getByText(/sistemas que funcionam em produção/)).toBeInTheDocument();
    expect(within(hero).getByText('Campo Grande, MS')).toBeInTheDocument();
  });

  it('CA-12: mostra o selo de disponibilidade quando availability.open é true', () => {
    renderWithProviders(<AppShell />);

    expect(screen.getByText('Disponível para novas oportunidades')).toBeInTheDocument();
  });

  it('CA-12: esconde o selo quando availability.open é false', () => {
    availability.open = false;

    renderWithProviders(<AppShell />);

    expect(screen.queryByText('Disponível para novas oportunidades')).not.toBeInTheDocument();
  });

  it('o CTA leva ao Contato e sincroniza a sidebar', async () => {
    renderWithProviders(<AppShell />);

    await userEvent.click(screen.getByRole('link', { name: 'Entrar em contato' }));

    expect(screen.getByRole('heading', { name: 'Contato' })).toHaveFocus();
    expect(
      within(screen.getByRole('complementary')).getByRole('link', { name: 'Contato' }),
    ).toHaveAttribute('aria-current', 'location');
  });
});

describe('foto do Hero', () => {
  const ALTS = {
    hacker: /^Retrato de Mateus em estilo hacker/,
    retro: /^Retrato de Mateus em pixel art retrô/,
    minimal: /^Foto de Mateus/,
    vscode: /editor de código/,
    paper: /folha de caderno/,
  };

  it.each(THEME_IDS)('no tema %s, mostra a imagem do próprio tema no Hero', (theme) => {
    document.documentElement.dataset.theme = theme;
    renderWithProviders(<AppShell />);

    const photos = screen.getAllByRole('img', { name: /Mateus/ });
    const [photo] = photos;

    // Uma foto só, dentro do Hero (nunca na sidebar).
    expect(photos).toHaveLength(1);
    expect(region('Mateus Guimarães Moraes Vilela')).toContainElement(photo ?? null);
    expect(photo).toHaveAccessibleName(ALTS[theme]);
    expect(photo?.getAttribute('src')).toContain(`avatar-${theme}-480.webp`);
    expect(photo?.getAttribute('srcset')).toMatch(
      new RegExp(`avatar-${theme}-480\\.webp 480w, .*avatar-${theme}-960\\.webp 960w$`),
    );
    for (const other of THEME_IDS.filter((id) => id !== theme)) {
      expect(photo?.getAttribute('srcset')).not.toContain(`avatar-${other}-`);
    }
  });

  it('reserva o espaço (3:4) e carrega com prioridade, sem lazy', () => {
    renderWithProviders(<AppShell />);
    const photo = screen.getByRole('img', { name: /Mateus/ });

    expect(photo).toHaveAttribute('width', '480');
    expect(photo).toHaveAttribute('height', '640');
    expect(photo).toHaveAttribute('sizes');
    expect(photo).toHaveAttribute('fetchpriority', 'high');
    expect(photo).not.toHaveAttribute('loading');
  });

  it('trocar de tema troca a foto', async () => {
    renderWithProviders(<AppShell />);

    await userEvent.click(screen.getByRole('button', { name: 'Papel' }));

    expect(screen.getByRole('img', { name: /folha de caderno/ }).getAttribute('src')).toContain(
      'avatar-paper-480.webp',
    );
  });

  it.each([
    [
      'pt-BR',
      'Retrato de Mateus em estilo hacker: capuz preto, tons de verde e código caindo ao fundo',
    ],
    [
      'en',
      'Portrait of Mateus in hacker style: black hood, green tones and code falling in the background',
    ],
    [
      'es',
      'Retrato de Mateus en estilo hacker: capucha negra, tonos verdes y código cayendo al fondo',
    ],
  ] as const)('em %s, o alt da foto é traduzido', async (language, alt) => {
    document.documentElement.dataset.theme = 'hacker';
    renderWithProviders(<AppShell />);

    await act(async () => {
      await i18n.changeLanguage(language);
    });

    expect(screen.getByRole('img', { name: alt })).toBeInTheDocument();
  });

  it.each(['pt-BR', 'en', 'es'] as const)('em %s, cada tema tem um alt diferente', (language) => {
    const alts = Object.values(resources[language].common.hero.photoAlt);

    expect(new Set(alts).size).toBe(THEME_IDS.length);
  });
});

describe('Sobre', () => {
  it('mostra o resumo profissional', () => {
    renderWithProviders(<AppShell />);

    expect(
      within(region('Sobre')).getByText(/formado em Tecnologia da Informação pela UFMS/),
    ).toBeInTheDocument();
  });
});

describe('Skills', () => {
  it('mostra os 5 grupos com as tecnologias como chips', () => {
    renderWithProviders(<AppShell />);
    const skills = region('Skills');

    expect(
      within(skills)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Front-end',
      'Back-end',
      'Bancos de dados',
      'DevOps e práticas',
      'IA e produtividade',
    ]);
    expect(within(skills).getByText('Python (FastAPI, Flask)')).toBeInTheDocument();
    expect(within(skills).getByText('PostgreSQL')).toBeInTheDocument();
    expect(within(skills).getByText('SQLAlchemy (ORM)')).toBeInTheDocument();
  });
});

describe('Projetos', () => {
  const THEME_LABELS = resources['pt-BR'].common.themes;

  it('mostra os 5 projetos, do mais recente ao mais antigo, com selo "Privado" nos 3 privados', () => {
    renderWithProviders(<AppShell />);
    const cards = within(region('Projetos')).getAllByRole('article');

    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Registro de Incidentes NOC',
      'Projeto INDEX',
      'Protocol Tracker',
      'CRM para Gestão de Lavanderia',
      'Este portfólio',
    ]);
    expect(cards.map((card) => within(card).queryByText('Privado') !== null)).toEqual([
      false,
      true,
      true,
      true,
      false,
    ]);
  });

  it('só os projetos públicos têm link, e só para o código', () => {
    renderWithProviders(<AppShell />);
    const links = within(region('Projetos')).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://github.com/mateusgui/flask',
      'https://github.com/mateusgui/portfolio-themes',
    ]);
    expect(links[0]).toHaveAccessibleName(
      'Ver código: Registro de Incidentes NOC (abre em nova aba)',
    );
    expect(links[1]).toHaveAccessibleName('Ver código: Este portfólio (abre em nova aba)');
    for (const link of links) expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('mostra stack e print em cada card', () => {
    renderWithProviders(<AppShell />);
    const index = screen.getByRole('article', { name: 'Projeto INDEX' });

    expect(within(index).getByRole('list', { name: 'Tecnologias' })).toHaveTextContent('FastAPI');
    const print = within(index).getByRole('img', { name: /Tela de conferência do Projeto INDEX/ });
    expect(print).toHaveAttribute('src', '/projetos/index.webp');
    // Tamanho declarado (sem salto de layout) e carregamento preguiçoso (fica abaixo da dobra).
    expect(print).toHaveAttribute('width', '960');
    expect(print).toHaveAttribute('height', '511');
    expect(print).toHaveAttribute('loading', 'lazy');
  });

  it.each(THEME_IDS)('no tema %s, o card deste portfólio mostra o print do tema', (theme) => {
    document.documentElement.dataset.theme = theme;
    renderWithProviders(<AppShell />);
    const card = screen.getByRole('article', { name: 'Este portfólio' });

    const print = within(card).getByRole('img');
    expect(print).toHaveAttribute('src', `/projetos/portfolio-${theme}.webp`);
    expect(print).toHaveAccessibleName(`Captura deste portfólio no tema ${THEME_LABELS[theme]}`);
  });

  it('trocar de tema troca o print do portfólio', async () => {
    renderWithProviders(<AppShell />);
    const card = screen.getByRole('article', { name: 'Este portfólio' });

    await userEvent.click(screen.getByRole('button', { name: 'Papel' }));

    expect(within(card).getByRole('img')).toHaveAttribute('src', '/projetos/portfolio-paper.webp');
  });

  it.each([
    ['pt-BR', 'Captura deste portfólio no tema Hacker'],
    ['en', 'Screenshot of this portfolio in the Hacker theme'],
    ['es', 'Captura de este portafolio con el tema Hacker'],
  ] as const)('em %s, o alt do print do portfólio é traduzido', async (language, alt) => {
    document.documentElement.dataset.theme = 'hacker';
    renderWithProviders(<AppShell />);

    await act(async () => {
      await i18n.changeLanguage(language);
    });

    expect(screen.getByRole('img', { name: alt })).toBeInTheDocument();
  });
});

describe('Experiência', () => {
  it('mostra Exbe e Nota Control com os períodos formatados', () => {
    renderWithProviders(<AppShell />);
    const experience = region('Experiência');

    expect(
      within(experience)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['Desenvolvedor Júnior II', 'Analista de Suporte de Sistemas']);
    expect(
      within(experience).getByText('Exbe Finance & Tech · Campo Grande, MS'),
    ).toBeInTheDocument();
    expect(within(experience).getByText('nov. de 2024 – set. de 2026')).toBeInTheDocument();
    expect(within(experience).getByText('fev. de 2023 – jul. de 2024')).toBeInTheDocument();
  });
});

describe('Formação', () => {
  it('mostra UFMS e Dev Club', () => {
    renderWithProviders(<AppShell />);
    const education = region('Formação');

    expect(within(education).getByText('UFMS')).toBeInTheDocument();
    expect(within(education).getByText('Dev Club')).toBeInTheDocument();
    expect(within(education).getByText('ago. de 2022 – jul. de 2025')).toBeInTheDocument();
  });
});

describe('Contato', () => {
  it('mostra e-mail, LinkedIn e GitHub', () => {
    renderWithProviders(<AppShell />);
    const contact = region('Contato');
    const hrefs = within(contact)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual([
      'mailto:mateusguimaraesmoraes14@gmail.com',
      'https://www.linkedin.com/in/mateusguimaraesmoraes',
      'https://github.com/mateusgui',
    ]);
  });
});

describe('troca de idioma', () => {
  it.each([
    ['en', 'Full Stack Developer', 'Available for new opportunities', 'Nov 2024 – Sep 2026'],
    [
      'es',
      'Desarrollador Full Stack',
      'Disponible para nuevas oportunidades',
      'nov 2024 – sept 2026',
    ],
  ] as const)(
    'CA-12: em %s, conteúdo, selo e datas mudam de idioma',
    async (language, role, badge, period) => {
      renderWithProviders(<AppShell />);

      await act(async () => {
        await i18n.changeLanguage(language);
      });

      expect(within(region('Mateus Guimarães Moraes Vilela')).getByText(role)).toBeInTheDocument();
      expect(screen.getByText(badge)).toBeInTheDocument();
      expect(screen.getByText(period)).toBeInTheDocument();
      expect(screen.queryByText(/sistemas que funcionam em produção/)).not.toBeInTheDocument();
    },
  );
});
