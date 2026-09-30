import type { SectionId } from './sections.ts';

export interface SectionBodyProps {
  /** Navegação interna (ex.: o CTA do Hero), sincronizada com a sidebar. */
  onNavigate: (id: SectionId) => void;
}
