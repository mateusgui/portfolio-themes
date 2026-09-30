import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar, SidebarContent } from './Sidebar.tsx';

describe('Sidebar', () => {
  it('mostra nome e cargo', () => {
    render(<Sidebar />);

    expect(screen.getByText('Mateus Guimarães Moraes Vilela')).toBeInTheDocument();
    expect(screen.getByText('Desenvolvedor Full Stack')).toBeInTheDocument();
  });

  it('lista as 7 seções na ordem, com âncoras estáveis e ícones', () => {
    render(<Sidebar />);

    const nav = screen.getByRole('navigation', { name: 'Seções' });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Início', '#inicio'],
      ['Sobre', '#sobre'],
      ['Skills', '#skills'],
      ['Projetos', '#projetos'],
      ['Experiência', '#experiencia'],
      ['Formação', '#formacao'],
      ['Contato', '#contato'],
    ]);
    for (const link of links) {
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it.each([
    ['LinkedIn', 'https://www.linkedin.com/in/mateusguimaraesmoraes'],
    ['GitHub', 'https://github.com/mateusgui'],
    ['Currículo', '/resume/curriculo-pt-BR.pdf'],
  ])('link externo %s abre em nova aba com segurança', (label, href) => {
    render(<Sidebar />);

    const nav = screen.getByRole('navigation', { name: 'Links externos' });
    const link = within(nav).getByRole('link', { name: `${label} (abre em nova aba)` });

    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('avisa quando um link de seção é clicado', async () => {
    const onNavigate = vi.fn();
    render(<SidebarContent onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', { name: 'Projetos' }));

    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
