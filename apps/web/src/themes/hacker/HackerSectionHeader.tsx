import { useEffect, useMemo, useState } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import type { SectionHeaderProps } from '../registry.ts';

/** Intervalo entre letras do efeito de digitação. */
export const TYPING_INTERVAL = 70;

/** Título do Hero digitado letra a letra, com cursor de terminal. */
function TypedTitle({ title }: { title: string }) {
  const reducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);
  // Letras como o leitor vê (grafemas): um acento combinado não vira duas letras.
  const characters = useMemo(
    () => Array.from(new Intl.Segmenter().segment(title), ({ segment }) => segment),
    [title],
  );

  useEffect(() => {
    if (reducedMotion || typed >= characters.length) return;
    const timer = window.setTimeout(() => {
      setTyped((count) => count + 1);
    }, TYPING_INTERVAL);
    return () => {
      window.clearTimeout(timer);
    };
  }, [typed, characters, reducedMotion]);

  const count = reducedMotion ? characters.length : typed;

  return (
    <>
      {/* Leitores de tela recebem o título inteiro, sem a animação. */}
      <span className="sr-only">{title}</span>
      {/*
        Todas as letras ocupam o lugar desde o início (as não digitadas ficam
        invisíveis) e o cursor é um bloco de fundo sobre a próxima letra: a
        digitação não move nada na página (sem layout shift).
      */}
      <span aria-hidden="true" data-testid="typed" data-typed={count}>
        {characters.map((character, index) => (
          <span
            key={index}
            className={
              index < count
                ? undefined
                : index === count
                  ? 'bg-accent text-accent motion-safe:animate-blink'
                  : 'invisible'
            }
          >
            {character}
          </span>
        ))}
        <span
          data-testid="typed-cursor"
          className={count >= characters.length ? 'motion-safe:animate-blink' : 'invisible'}
        >
          █
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
