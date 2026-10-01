import { createContext, useContext } from 'react';

import type { ActiveSection } from '../hooks/useActiveSection.ts';
import type { SectionId } from '../sections/sections.ts';

/** Seção atual e navegação, para peças de tema fora da sidebar (abas, status bar). */
export const ActiveSectionContext = createContext<ActiveSection<SectionId> | null>(null);

/** Precisa estar dentro do `AppShell`. */
export function useActiveSectionContext(): ActiveSection<SectionId> {
  const context = useContext(ActiveSectionContext);
  if (!context) throw new Error('useActiveSectionContext precisa estar dentro do <AppShell>');
  return context;
}
