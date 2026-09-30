import { useCallback, useEffect, useRef, useState } from 'react';

import {
  READING_BAND_MARGIN,
  resolveActiveSection,
  scrollBehavior,
  sectionIdFromHash,
} from './scrollSpy.ts';

/** Se o `scrollend` não vier (navegador sem suporte, rolagem nula), retoma o observer mesmo assim. */
export const SCROLL_END_TIMEOUT = 1000;

export interface ActiveSection<Id extends string> {
  activeId: Id;
  /** Navegação pela sidebar: destaca na hora, rola até a seção e foca o título. */
  navigateTo: (id: Id) => void;
}

/**
 * Seção atual da página, sincronizada com a rolagem da window. Cada id deve ser
 * de uma `<section>` com um `h2` focável (`tabIndex={-1}`).
 */
export function useActiveSection<Id extends string>(
  ids: readonly [Id, ...Id[]],
): ActiveSection<Id> {
  const [activeId, setActiveId] = useState<Id>(ids[0]);

  const idsRef = useRef(ids);
  const activeRef = useRef(activeId);
  const intersectingRef = useRef(new Set<Id>());
  const suspendedRef = useRef(false);
  const cancelResumeRef = useRef<(() => void) | null>(null);

  const activate = useCallback((id: Id) => {
    activeRef.current = id;
    setActiveId(id);
  }, []);

  const update = useCallback(() => {
    if (suspendedRef.current) return;
    const root = document.documentElement;
    activate(
      resolveActiveSection({
        ids: idsRef.current,
        intersecting: intersectingRef.current,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        scrollHeight: root.scrollHeight,
        previous: activeRef.current,
      }),
    );
  }, [activate]);

  // Rolagem manual: faixa de leitura pelo observer, topo e fim pelo evento `scroll`.
  useEffect(() => {
    const intersecting = intersectingRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as Id;
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }
        update();
      },
      { rootMargin: READING_BAND_MARGIN },
    );
    for (const id of idsRef.current) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      intersecting.clear();
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
      cancelResumeRef.current?.();
      suspendedRef.current = false;
    };
  }, [update]);

  // URL com hash (`/#projetos`) abre direto na seção.
  useEffect(() => {
    const id = sectionIdFromHash(window.location.hash, idsRef.current);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    activate(id);
  }, [activate]);

  const navigateTo = useCallback(
    (id: Id) => {
      const section = document.getElementById(id);
      if (!section) return;

      // Suspende o observer até a rolagem terminar, para o destaque não passar
      // pelas seções do caminho. Um clique durante outra rolagem renova a espera.
      cancelResumeRef.current?.();
      suspendedRef.current = true;
      const cancel = () => {
        window.removeEventListener('scrollend', resume);
        window.clearTimeout(timeout);
        cancelResumeRef.current = null;
      };
      const resume = () => {
        cancel();
        suspendedRef.current = false;
        update();
      };
      const timeout = window.setTimeout(resume, SCROLL_END_TIMEOUT);
      window.addEventListener('scrollend', resume);
      cancelResumeRef.current = cancel;

      activate(id);

      history.replaceState(history.state, '', `#${id}`);
      section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    },
    [activate, update],
  );

  return { activeId, navigateTo };
}
