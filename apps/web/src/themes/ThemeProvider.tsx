import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { readAppliedTheme } from './appliedTheme.ts';
import { preloadAvatars } from './avatars.ts';
import { getLoadedSlots, loadThemeSlots } from './loadThemeSlots.ts';
import { THEME_IDS, THEME_STORAGE_KEY, type ThemeId } from './registry.ts';
import { ThemeContext } from './useTheme.ts';

function saveTheme(theme: ThemeId) {
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

  // Última escolha: se o usuário trocar de novo antes de um chunk chegar, vale a mais recente.
  const requestedRef = useRef(theme);

  // Tokens e slots trocam juntos: se o chunk do tema ainda não chegou, o tema
  // atual continua até ele chegar (normalmente já veio no pré-carregamento).
  // A escolha é salva na hora (vale mesmo se a página recarregar antes do chunk).
  const setTheme = useCallback((next: ThemeId) => {
    requestedRef.current = next;
    saveTheme(next);
    const apply = () => {
      if (requestedRef.current !== next) return;
      document.documentElement.dataset.theme = next;
      setThemeState(next);
    };
    if (getLoadedSlots(next)) apply();
    else void loadThemeSlots(next).then(apply);
  }, []);

  // Com a página pronta, baixa os outros temas (slots e foto do Hero) quando o
  // navegador estiver ocioso; a foto do tema ativo já veio com prioridade.
  useEffect(() => {
    const preload = () => {
      for (const id of THEME_IDS) void loadThemeSlots(id);
      preloadAvatars(THEME_IDS.filter((id) => id !== requestedRef.current));
    };
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => {
        window.cancelIdleCallback(handle);
      };
    }
    // Safari sem `requestIdleCallback` (o `in` acima estreita `window` para `never` aqui).
    const timer = setTimeout(preload, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
