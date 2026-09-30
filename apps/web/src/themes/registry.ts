import type { ComponentType, ReactNode } from 'react';

import type { SectionId } from '../sections/sections.ts';
import { hackerTheme } from './hacker/index.ts';
import { paperTheme } from './paper/index.ts';

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

export interface ThemeButtonProps {
  theme: ThemeId;
  label: string;
  pressed: boolean;
  onSelect: () => void;
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

// Temas com definição própria; os demais usam só tokens (os do Minimalista, até ganharem os seus).
const DEFINITIONS: Partial<Record<ThemeId, ThemeDefinition>> = {
  hacker: hackerTheme,
  paper: paperTheme,
};

export const THEMES: readonly ThemeDefinition[] = THEME_IDS.map(
  (id) => DEFINITIONS[id] ?? { id, labelKey: `themes.${id}` },
);

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.some((id) => id === value);
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? { id, labelKey: `themes.${id}` };
}
