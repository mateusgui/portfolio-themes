import { createContext, useContext } from 'react';

import { getLoadedSlots } from './loadThemeSlots.ts';
import type { ThemeId, ThemeSlots } from './registry.ts';

export interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tema atual e a troca de tema. Precisa estar dentro de `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return context;
}

const NO_SLOTS: ThemeSlots = {};

/** Slots do tema atual (vazio quando o tema só troca tokens ou o chunk não chegou). */
export function useThemeSlots(): ThemeSlots {
  const { theme } = useTheme();
  return getLoadedSlots(theme) ?? NO_SLOTS;
}
