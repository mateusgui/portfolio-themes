import type { ReactNode } from 'react';

import { useThemeSlots } from '../themes/useTheme.ts';
import type { SectionId } from './sections.ts';

interface SectionProps {
  id: SectionId;
  title: string;
  /** O Hero usa `h1` (nome); as demais seções, `h2`. */
  level?: 1 | 2;
  className?: string;
  /** Imagem ao lado do texto (à direita no desktop, acima e centralizada no celular). */
  media?: ReactNode;
  children?: ReactNode;
}

export function Section({ id, title, level = 2, className = '', media, children }: SectionProps) {
  const headingId = `${id}-titulo`;
  const Heading = level === 1 ? 'h1' : 'h2';
  const Header = useThemeSlots().SectionHeader;

  // Focável por script: a navegação pela sidebar move o foco para o título.
  const heading = (
    <Heading
      id={headingId}
      tabIndex={-1}
      className={
        level === 1
          ? 'font-heading text-4xl font-bold tracking-tight sm:text-5xl'
          : 'font-heading text-3xl font-semibold tracking-tight'
      }
    >
      {Header ? <Header id={id} title={title} level={level} /> : title}
    </Heading>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-(--navbar-height) border-b border-border px-6 py-16 lg:px-12 ${className}`}
    >
      <div
        className={`mx-auto flex max-w-4xl flex-col gap-8 ${
          media ? 'md:flex-row md:items-center md:justify-between' : ''
        }`}
      >
        {media ? (
          <>
            <div className="flex min-w-0 flex-col gap-8">
              {heading}
              {children}
            </div>
            {/* No código vem depois do texto (o título é lido primeiro); na tela, sobe no celular. */}
            <div className="order-first flex shrink-0 justify-center md:order-last">{media}</div>
          </>
        ) : (
          <>
            {heading}
            {children}
          </>
        )}
      </div>
    </section>
  );
}
