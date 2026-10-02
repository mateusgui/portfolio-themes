import type { ThemeId, ThemeModule, ThemeSlots } from './registry.ts';

const slotsOf = ({ slots }: ThemeModule): ThemeSlots => slots ?? {};

// Um chunk por tema: só o tema ativo é baixado antes do primeiro render.
const LOADERS: Record<ThemeId, () => Promise<ThemeSlots>> = {
  hacker: () => import('./hacker/index.ts').then(({ hackerTheme }) => slotsOf(hackerTheme)),
  retro: () => import('./retro/index.ts').then(({ retroTheme }) => slotsOf(retroTheme)),
  // O Minimalista usa só tokens.
  minimal: () => Promise.resolve({}),
  vscode: () => import('./vscode/index.ts').then(({ vscodeTheme }) => slotsOf(vscodeTheme)),
  paper: () => import('./paper/index.ts').then(({ paperTheme }) => slotsOf(paperTheme)),
};

const loaded = new Map<ThemeId, ThemeSlots>();
const pending = new Map<ThemeId, Promise<ThemeSlots>>();

/**
 * Baixa (uma vez) os slots do tema. Se o chunk falhar (rede), o tema fica só com
 * os tokens desta vez e uma próxima troca tenta de novo.
 */
export function loadThemeSlots(id: ThemeId): Promise<ThemeSlots> {
  const cached = loaded.get(id);
  if (cached) return Promise.resolve(cached);

  let promise = pending.get(id);
  if (!promise) {
    promise = LOADERS[id]().then(
      (slots) => {
        loaded.set(id, slots);
        pending.delete(id);
        return slots;
      },
      () => {
        pending.delete(id);
        return {};
      },
    );
    pending.set(id, promise);
  }
  return promise;
}

/** Slots já baixados do tema, ou `undefined` se o chunk ainda não chegou. */
export function getLoadedSlots(id: ThemeId): ThemeSlots | undefined {
  return loaded.get(id);
}
