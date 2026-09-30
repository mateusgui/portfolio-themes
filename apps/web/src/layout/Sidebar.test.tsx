import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from './Sidebar.tsx';

function renderSidebar(onNavigate = vi.fn()) {
  render(<Sidebar activeId="skills" onNavigate={onNavigate} />);
  return onNavigate;
}

describe('Sidebar', () => {
  it('mostra nome e cargo', () => {
    renderSidebar();

    expect(screen.getByText('Mateus Guimarães Moraes Vilela')).toBeInTheDocument();
    expect(screen.getByText('Desenvolvedor Full Stack')).toBeInTheDocument();
  });

  it('lista as 7 seções na ordem, com âncoras estáveis e ícones', () => {
    renderSidebar();

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
    renderSidebar();

    const nav = screen.getByRole('navigation', { name: 'Links externos' });
    const link = within(nav).getByRole('link', { name: `${label} (abre em nova aba)` });

    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('marca só o item ativo com aria-current="location"', () => {
    renderSidebar();

    const nav = screen.getByRole('navigation', { name: 'Seções' });
    const current = within(nav)
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('aria-current'));

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Skills');
    expect(current[0]).toHaveAttribute('aria-current', 'location');
  });

  it('o clique numa seção chama onNavigate no lugar da âncora nativa', async () => {
    const onNavigate = renderSidebar();

    await userEvent.click(screen.getByRole('link', { name: 'Projetos' }));

    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('projetos');
    expect(window.location.hash).toBe('');
  });

  it('Ctrl+clique segue o comportamento nativo do navegador', () => {
    const onNavigate = renderSidebar();

    const allowed = fireEvent.click(screen.getByRole('link', { name: 'Projetos' }), {
      ctrlKey: true,
    });

    expect(allowed).toBe(true);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
