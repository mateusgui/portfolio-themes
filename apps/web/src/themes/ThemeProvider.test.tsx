import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY } from './registry.ts';
import { useTheme, useThemeSlots } from './useTheme.ts';

/**
 * Módulos novos (sem os chunks que o setup já carregou): aqui o tema escolhido
 * ainda não foi baixado, como na primeira troca de um visitante.
 */
async function freshThemeModules() {
  vi.resetModules();
  const [{ ThemeProvider }, theme] = await Promise.all([
    import('./ThemeProvider.tsx'),
    import('./useTheme.ts'),
  ]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );
  return renderHook(() => ({ ...theme.useTheme(), slots: theme.useThemeSlots() }), { wrapper });
}

afterEach(() => {
  vi.doUnmock('./paper/index.ts');
  vi.resetModules();
});

describe('ThemeProvider com temas em chunks', () => {
  it('troca para um tema ainda não baixado só quando o chunk chega, salvando a escolha na hora', async () => {
    document.documentElement.dataset.theme = 'minimal';
    const { result } = await freshThemeModules();

    act(() => {
      result.current.setTheme('retro');
    });

    // Tokens e slots trocam juntos: até o chunk chegar, nada muda na tela...
    expect(document.documentElement.dataset.theme).toBe('minimal');
    expect(result.current.theme).toBe('minimal');
    // ...mas a escolha já vale para um reload.
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('retro');

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('retro');
      expect(result.current.theme).toBe('retro');
    });
    expect(result.current.slots.Decoration).toBeDefined();
  });

  it('se o usuário trocar de novo antes do chunk chegar, vale a última escolha', async () => {
    document.documentElement.dataset.theme = 'minimal';
    const { result } = await freshThemeModules();

    act(() => {
      result.current.setTheme('hacker');
      result.current.setTheme('vscode');
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('vscode');
    });
    // O chunk do Hacker chega depois e não pode desfazer a escolha.
    await act(async () => {
      await import('./hacker/index.ts');
    });
    expect(document.documentElement.dataset.theme).toBe('vscode');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('vscode');
  });

  it('se o chunk falhar (rede), o tema fica só com tokens e a próxima troca tenta de novo', async () => {
    vi.resetModules();
    vi.doMock('./paper/index.ts', () => {
      throw new Error('falha de rede');
    });
    const loader = await import('./loadThemeSlots.ts');

    expect(await loader.loadThemeSlots('paper')).toEqual({});
    expect(loader.getLoadedSlots('paper')).toBeUndefined();

    vi.doUnmock('./paper/index.ts');
    const slots = await loader.loadThemeSlots('paper');
    expect(slots.SidebarItem).toBeDefined();
    expect(loader.getLoadedSlots('paper')).toBe(slots);
  });

  it('tema inválido no html vira o padrão', async () => {
    document.documentElement.dataset.theme = 'dark';
    const { result } = await freshThemeModules();

    expect(result.current.theme).toBe('minimal');
    expect(document.documentElement.dataset.theme).toBe('minimal');
  });

  it('pré-carrega os demais temas quando o navegador fica ocioso', async () => {
    const idle = vi.fn((callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    });
    // O jsdom não tem `requestIdleCallback` (como o Safari): aqui, simula um navegador que tem.
    const cancelIdle = vi.fn();
    Object.assign(window, { requestIdleCallback: idle, cancelIdleCallback: cancelIdle });
    document.documentElement.dataset.theme = 'minimal';

    const { unmount } = await freshThemeModules();
    const loader = await import('./loadThemeSlots.ts');

    expect(idle).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(loader.getLoadedSlots('paper')).toBeDefined();
    });
    unmount();
    expect(cancelIdle).toHaveBeenCalledWith(1);
    Reflect.deleteProperty(window, 'requestIdleCallback');
    Reflect.deleteProperty(window, 'cancelIdleCallback');
  });
});

describe('useTheme', () => {
  it('fora do ThemeProvider, avisa com um erro claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
    expect(() => renderHook(() => useThemeSlots())).toThrow(/ThemeProvider/);
  });
});
