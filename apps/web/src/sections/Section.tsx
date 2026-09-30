import type { ReactNode } from 'react';

import type { SectionId } from './sections.ts';

interface SectionProps {
  id: SectionId;
  title: string;
  children?: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  const headingId = `${id}-titulo`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="min-h-[60vh] scroll-mt-(--navbar-height) border-b border-border px-6 py-12 lg:px-12"
    >
      <h2 id={headingId} className="font-heading text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
