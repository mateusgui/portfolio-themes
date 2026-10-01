import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockIntersectionObserver } from '../tests/intersectionObserver.ts';
import { SCROLL_END_TIMEOUT, useActiveSection } from './useActiveSection.ts';

const IDS = ['inicio', 'sobre', 'contato'] as const;

/** Página com três seções, cada uma com título focável. */
function mountSections() {
  document.body.innerHTML = IDS.map(
    (id) => `<section id="${id}"><h2 tabindex="-1">${id}</h2></section>`,
  ).join('');
}

/** Rolagem no meio da página: nem topo nem fim, a faixa de leitura decide. */
function setScroll(scrollY: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 5000,
  });
}

function setup() {
  return renderHook(() => useActiveSection(IDS));
}

beforeEach(() => {
  mountSections();
  setScroll(1000);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  setScroll(0);
});

describe('useActiveSection', () => {
  it('começa na primeira seção', () => {
    const { result } = setup();

    expect(result.current.activeId).toBe('inicio');
  });

  it('a rolagem manual segue a seção na faixa de leitura', () => {
    const { result } = setup();

    act(() => {
      MockIntersectionObserver.latest().trigger({ inicio: false, sobre: true });
    });

    expect(result.current.activeId).toBe('sobre');
  });

  it('vários eventos de scroll no mesmo quadro recalculam uma vez só', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const { result } = setup();

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(frames).toHaveLength(1);

    // No fim da página, o quadro ativa a última seção.
    setScroll(5000 - window.innerHeight);
    act(() => {
      frames[0]?.(0);
    });
    expect(result.current.activeId).toBe('contato');
  });

  describe('navigateTo', () => {
    it('destaca na hora, grava o hash sem nova entrada no histórico e foca o título', () => {
      const { result } = setup();
      const historyLength = history.length;

      act(() => {
        result.current.navigateTo('contato');
      });

      expect(result.current.activeId).toBe('contato');
      expect(window.location.hash).toBe('#contato');
      expect(history.length).toBe(historyLength);
      expect(document.activeElement).toBe(document.querySelector('#contato h2'));
    });

    it('ignora o observer durante a rolagem e volta a ouvi-lo no scrollend', () => {
      const { result } = setup();

      act(() => {
        result.current.navigateTo('contato');
      });
      // Seções do caminho passam pela faixa: não podem roubar o destaque.
      act(() => {
        MockIntersectionObserver.latest().trigger({ sobre: true });
      });
      expect(result.current.activeId).toBe('contato');

      act(() => {
        MockIntersectionObserver.latest().trigger({ sobre: false, contato: true });
        window.dispatchEvent(new Event('scrollend'));
      });
      act(() => {
        MockIntersectionObserver.latest().trigger({ contato: false, sobre: true });
      });
      expect(result.current.activeId).toBe('sobre');
    });

    it('sem scrollend (navegador sem suporte), retoma depois do tempo limite', () => {
      vi.useFakeTimers();
      const { result } = setup();

      act(() => {
        result.current.navigateTo('contato');
      });
      act(() => {
        MockIntersectionObserver.latest().trigger({ contato: false, sobre: true });
      });
      expect(result.current.activeId).toBe('contato');

      act(() => {
        vi.advanceTimersByTime(SCROLL_END_TIMEOUT);
      });
      expect(result.current.activeId).toBe('sobre');
    });

    it('um segundo clique durante a rolagem renova a espera', () => {
      vi.useFakeTimers();
      const { result } = setup();

      act(() => {
        result.current.navigateTo('contato');
      });
      act(() => {
        vi.advanceTimersByTime(SCROLL_END_TIMEOUT - 100);
        result.current.navigateTo('sobre');
      });
      act(() => {
        vi.advanceTimersByTime(200);
        MockIntersectionObserver.latest().trigger({ contato: true });
      });

      expect(result.current.activeId).toBe('sobre');
    });

    it('ignora uma seção que não existe', () => {
      const { result } = setup();

      act(() => {
        result.current.navigateTo('inexistente' as (typeof IDS)[number]);
      });

      expect(result.current.activeId).toBe('inicio');
      expect(window.location.hash).toBe('');
    });
  });

  it('URL com hash abre direto na seção', () => {
    history.replaceState(null, '', '/#contato');
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');

    const { result } = setup();

    expect(result.current.activeId).toBe('contato');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
  });

  it('hash que não é de seção é ignorado', () => {
    history.replaceState(null, '', '/#qualquer-coisa');

    const { result } = setup();

    expect(result.current.activeId).toBe('inicio');
  });

  it('ao desmontar, para de ouvir rolagem, observer e espera pendente', () => {
    vi.useFakeTimers();
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = setup();
    const observer = MockIntersectionObserver.latest();
    act(() => {
      result.current.navigateTo('contato');
    });

    unmount();

    expect(observer.targets.size).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('scrollend', expect.any(Function));
    expect(() => {
      vi.advanceTimersByTime(SCROLL_END_TIMEOUT);
    }).not.toThrow();
  });
});
