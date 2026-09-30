import { createContext, useContext } from 'react';

import { getTheme, type ThemeDefinition, type ThemeId } from './registry.ts';

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

/** Slots do tema atual (vazio quando o tema só troca tokens). */
export function useThemeSlots(): NonNullable<ThemeDefinition['slots']> {
  const { theme } = useTheme();
  return getTheme(theme).slots ?? {};
}
