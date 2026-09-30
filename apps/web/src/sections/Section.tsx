import type { ReactNode } from 'react';

import type { SectionId } from './sections.ts';

interface SectionProps {
  id: SectionId;
  title: string;
  className?: string;
  children?: ReactNode;
}

export function Section({ id, title, className = '', children }: SectionProps) {
  const headingId = `${id}-titulo`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-(--navbar-height) border-b border-border px-6 py-12 lg:px-12 ${className}`}
    >
      {/* Focável por script: a navegação pela sidebar move o foco para o título. */}
      <h2 id={headingId} tabIndex={-1} className="font-heading text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
