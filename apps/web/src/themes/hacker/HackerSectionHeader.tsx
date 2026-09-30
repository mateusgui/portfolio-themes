import { useEffect, useState } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import type { SectionHeaderProps } from '../registry.ts';

/** Intervalo entre letras do efeito de digitação. */
export const TYPING_INTERVAL = 70;

/** Título do Hero digitado letra a letra, com cursor de terminal. */
function TypedTitle({ title }: { title: string }) {
  const reducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reducedMotion || typed >= title.length) return;
    const timer = window.setTimeout(() => {
      setTyped((count) => count + 1);
    }, TYPING_INTERVAL);
    return () => {
      window.clearTimeout(timer);
    };
  }, [typed, title, reducedMotion]);

  const visible = reducedMotion ? title : title.slice(0, typed);

  return (
    <>
      {/* Leitores de tela recebem o título inteiro, sem a animação. */}
      <span className="sr-only">{title}</span>
      {/* O texto invisível reserva o espaço final: a digitação não empurra o layout. */}
      <span aria-hidden="true" className="relative inline-block">
        <span className="invisible">{title}█</span>
        <span data-testid="typed" className="absolute inset-0">
          {visible}
          <span className="motion-safe:animate-blink">█</span>
        </span>
      </span>
    </>
  );
}

/** Cabeçalhos em formato de terminal: o Hero é digitado; as seções ganham `#`. */
export function HackerSectionHeader({ title, level }: SectionHeaderProps) {
  if (level === 1) return <TypedTitle title={title} />;

  return (
    <>
      <span aria-hidden="true" className="text-muted">
        #{' '}
      </span>
      {title}
    </>
  );
}
