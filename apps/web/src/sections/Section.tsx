import type { ReactNode } from 'react';

import { useThemeSlots } from '../themes/useTheme.ts';
import type { SectionId } from './sections.ts';

interface SectionProps {
  id: SectionId;
  title: string;
  /** O Hero usa `h1` (nome); as demais seções, `h2`. */
  level?: 1 | 2;
  className?: string;
  children?: ReactNode;
}

export function Section({ id, title, level = 2, className = '', children }: SectionProps) {
  const headingId = `${id}-titulo`;
  const Heading = level === 1 ? 'h1' : 'h2';
  const Header = useThemeSlots().SectionHeader;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-(--navbar-height) border-b border-border px-6 py-16 lg:px-12 ${className}`}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {/* Focável por script: a navegação pela sidebar move o foco para o título. */}
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
        {children}
      </div>
    </section>
  );
}
