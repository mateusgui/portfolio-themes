import type { ComponentType, ReactNode } from 'react';

import type { SectionId } from '../sections/sections.ts';

export const THEME_IDS = ['hacker', 'retro', 'minimal', 'vscode', 'paper'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'minimal';

/** Chave do `localStorage` com o tema escolhido. O script inline do `index.html` lê a mesma. */
export const THEME_STORAGE_KEY = 'portfolio:theme';

/** Conteúdo do link de seção; o `<a>` (navegação, `aria-current`) fica com a sidebar. */
export interface SidebarItemProps {
  id: SectionId;
  label: string;
  active: boolean;
  icon: ReactNode;
}

/** Conteúdo do título; o `h1`/`h2` (id, foco, `aria-labelledby`) fica com a seção. */
export interface SectionHeaderProps {
  id: SectionId;
  title: string;
  level: 1 | 2;
}

/** Conteúdo do botão de tema; o `<button>` (clique, `aria-pressed`) fica com o seletor. */
export interface ThemeButtonProps {
  theme: ThemeId;
  label: string;
  pressed: boolean;
}

/**
 * Um tema veste o layout comum: os tokens vêm de `tokens/<id>.css` (via
 * `data-theme`) e os slots opcionais trocam a aparência de peças específicas.
 */
export interface ThemeDefinition {
  id: ThemeId;
  /** Chave i18n do nome do tema. */
  labelKey: `themes.${ThemeId}`;
  slots?: Partial<{
    SidebarItem: ComponentType<SidebarItemProps>;
    SectionHeader: ComponentType<SectionHeaderProps>;
    ThemeButton: ComponentType<ThemeButtonProps>;
    Decoration: ComponentType;
  }>;
}

export type ThemeSlots = NonNullable<ThemeDefinition['slots']>;

/**
 * Temas do seletor, na ordem da navbar. Os slots ficam fora daqui: cada tema é
 * um chunk carregado sob demanda (`loadThemeSlots.ts`).
 */
export const THEMES: readonly Pick<ThemeDefinition, 'id' | 'labelKey'>[] = THEME_IDS.map((id) => ({
  id,
  labelKey: `themes.${id}`,
}));

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.some((id) => id === value);
}
