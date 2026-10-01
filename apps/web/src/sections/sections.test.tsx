import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { AppShell } from '../app/AppShell.tsx';
import { availability } from '../content/profile.ts';
import i18n from '../i18n/index.ts';
import { renderWithProviders } from '../tests/render.tsx';

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
    expect(within(skills).getByText('Python (FastAPI)')).toBeInTheDocument();
    expect(within(skills).getByText('PostgreSQL')).toBeInTheDocument();
  });
});

describe('Projetos', () => {
  it('mostra os 4 projetos, com selo "Privado" nos 3 privados', () => {
    renderWithProviders(<AppShell />);
    const cards = within(region('Projetos')).getAllByRole('article');

    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Projeto INDEX',
      'Protocol Tracker',
      'CRM para Gestão de Lavanderia',
      'Este portfólio',
    ]);
    expect(cards.map((card) => within(card).queryByText('Privado') !== null)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it('só o portfólio tem link, e só para o código', () => {
    renderWithProviders(<AppShell />);
    const links = within(region('Projetos')).getAllByRole('link');

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://github.com/mateusgui/portfolio-themes');
    expect(links[0]).toHaveAccessibleName('Ver código: Este portfólio (abre em nova aba)');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('mostra stack e área de prints em cada card', () => {
    renderWithProviders(<AppShell />);
    const index = screen.getByRole('article', { name: 'Projeto INDEX' });

    expect(within(index).getByRole('list', { name: 'Tecnologias' })).toHaveTextContent('FastAPI');
    expect(within(index).getByText('Prints em breve')).toBeInTheDocument();
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
