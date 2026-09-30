import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId, type ThemeId } from './registry.ts';
import { ThemeContext } from './useTheme.ts';

/**
 * Tema inicial: o que o script inline do `index.html` já aplicou antes da pintura
 * (query string > escolha salva > `prefers-color-scheme`).
 */
function readAppliedTheme(): ThemeId {
  const applied = document.documentElement.dataset.theme;
  return isThemeId(applied) ? applied : DEFAULT_THEME;
}

function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(() => {
    const initial = readAppliedTheme();
    // Só corrige um valor inválido: reescrever o mesmo tema dispararia estilos à toa.
    if (document.documentElement.dataset.theme !== initial) {
      document.documentElement.dataset.theme = initial;
    }
    return initial;
  });

  const setTheme = useCallback((next: ThemeId) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
