import { act, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockIntersectionObserver } from '../tests/intersectionObserver.ts';
import { SCROLL_END_TIMEOUT, useActiveSection } from './useActiveSection.ts';

const IDS = ['inicio', 'sobre', 'skills', 'projetos', 'contato'] as const;
type Id = (typeof IDS)[number];

function Sections({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {IDS.map((id) => (
        <section key={id} id={id}>
          <h2 tabIndex={-1}>{id}</h2>
        </section>
      ))}
    </>
  );
}

function renderActiveSection() {
  const { result } = renderHook(() => useActiveSection<Id>(IDS), { wrapper: Sections });
  return {
    active: () => result.current.activeId,
    navigate: (id: Id) => {
      result.current.navigateTo(id);
    },
  };
}

/** Simula a posição da window no meio da página (nem topo nem fim). */
function scrollToMiddle() {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 5000,
  });
}

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

beforeEach(() => {
  scrollToMiddle();
  history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
});

describe('useActiveSection', () => {
  it('começa na primeira seção e observa todas com a faixa de leitura', () => {
    const { active } = renderActiveSection();

    expect(active()).toBe('inicio');
    const observer = MockIntersectionObserver.latest();
    expect(observer.rootMargin).toBe('-30% 0px -60% 0px');
    expect([...observer.targets].map((target) => target.id)).toEqual([...IDS]);
  });

  it('a rolagem manual troca a seção ativa', () => {
    const { active } = renderActiveSection();
    const observer = MockIntersectionObserver.latest();

    act(() => {
      observer.trigger({ sobre: true });
    });
    expect(active()).toBe('sobre');

    act(() => {
      observer.trigger({ sobre: false, skills: true });
    });
    expect(active()).toBe('skills');
  });

  it('no fim da página ativa a última seção', () => {
    vi.useFakeTimers();
    const { active } = renderActiveSection();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 5000 - 768 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersToNextFrame();
    });

    expect(active()).toBe('contato');
  });

  describe('navegação pela sidebar', () => {
    it('destaca na hora, atualiza o hash, rola suave e foca o título', () => {
      setReducedMotion(false);
      const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
      const { active, navigate } = renderActiveSection();

      act(() => {
        navigate('projetos');
      });

      expect(active()).toBe('projetos');
      expect(window.location.hash).toBe('#projetos');
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('projetos'));
      expect(screen.getByRole('heading', { name: 'projetos' })).toHaveFocus();
    });

    it('com movimento reduzido, a rolagem é instantânea', () => {
      setReducedMotion(true);
      const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
      const { navigate } = renderActiveSection();

      act(() => {
        navigate('projetos');
      });

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    });

    it('ignora as seções do caminho até o scrollend', () => {
      const { active, navigate } = renderActiveSection();
      const observer = MockIntersectionObserver.latest();

      act(() => {
        navigate('projetos');
      });
      act(() => {
        observer.trigger({ sobre: true });
        observer.trigger({ sobre: false, skills: true });
      });
      expect(active()).toBe('projetos');

      act(() => {
        observer.trigger({ skills: false, projetos: true });
        window.dispatchEvent(new Event('scrollend'));
      });
      expect(active()).toBe('projetos');

      act(() => {
        observer.trigger({ projetos: false, contato: true });
      });
      expect(active()).toBe('contato');
    });

    it('sem scrollend, o observer volta após o timeout de segurança', () => {
      vi.useFakeTimers();
      const { active, navigate } = renderActiveSection();
      const observer = MockIntersectionObserver.latest();

      act(() => {
        navigate('projetos');
        observer.trigger({ skills: true });
      });
      expect(active()).toBe('projetos');

      act(() => {
        vi.advanceTimersByTime(SCROLL_END_TIMEOUT);
      });
      expect(active()).toBe('skills');
    });

    it('um segundo clique durante a rolagem renova a suspensão', () => {
      vi.useFakeTimers();
      const { active, navigate } = renderActiveSection();
      const observer = MockIntersectionObserver.latest();

      act(() => {
        navigate('projetos');
        vi.advanceTimersByTime(SCROLL_END_TIMEOUT - 100);
        navigate('sobre');
        vi.advanceTimersByTime(200);
        observer.trigger({ skills: true });
      });

      expect(active()).toBe('sobre');
    });
  });

  it('abre direto na seção do hash da URL, sem rolagem suave', () => {
    history.replaceState(null, '', '/#skills');
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');

    const { active } = renderActiveSection();

    expect(active()).toBe('skills');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('skills'));
  });

  it('ignora hash que não é de seção', () => {
    history.replaceState(null, '', '/#conteudo');

    const { active } = renderActiveSection();

    expect(active()).toBe('inicio');
  });
});
