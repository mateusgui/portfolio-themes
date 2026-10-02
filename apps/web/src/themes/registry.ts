import { BracesIcon, CircleIcon, JoystickIcon, NotebookPenIcon, TerminalIcon } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import type { SectionId } from '../sections/sections.ts';
import { avatarOf } from './avatars.ts';

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
  /** Ícone do tema, já decorativo (`aria-hidden`). */
  icon: ReactNode;
}

/** Foto do tema no Hero: retrato vertical 3:4 em WebP. */
export interface ThemeAvatar {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

/**
 * Um tema veste o layout comum: os tokens vêm de `tokens/<id>.css` (via
 * `data-theme`) e os slots opcionais trocam a aparência de peças específicas.
 */
export interface ThemeDefinition {
  id: ThemeId;
  /** Chave i18n do nome do tema. */
  labelKey: `themes.${ThemeId}`;
  /** Ícone do botão de tema na navbar. */
  icon: ComponentType<{ className?: string }>;
  /** Foto do Hero neste tema. */
  avatar: ThemeAvatar;
  slots?: Partial<{
    SidebarItem: ComponentType<SidebarItemProps>;
    SectionHeader: ComponentType<SectionHeaderProps>;
    ThemeButton: ComponentType<ThemeButtonProps>;
    Decoration: ComponentType;
  }>;
}

export type ThemeSlots = NonNullable<ThemeDefinition['slots']>;

/** O que o chunk de um tema exporta: os slots (ícone e foto ficam no registro). */
export type ThemeModule = Pick<ThemeDefinition, 'id' | 'labelKey' | 'slots'>;

/**
 * Temas do seletor, na ordem da navbar. Os slots ficam fora daqui: cada tema é
 * um chunk carregado sob demanda (`loadThemeSlots.ts`).
 */
// Ícones genéricos, nunca logotipos (o do VS Code são chaves de código).
const ICONS: Record<ThemeId, ThemeDefinition['icon']> = {
  hacker: TerminalIcon,
  retro: JoystickIcon,
  minimal: CircleIcon,
  vscode: BracesIcon,
  paper: NotebookPenIcon,
};

export const THEMES: readonly Omit<ThemeDefinition, 'slots'>[] = THEME_IDS.map((id) => ({
  id,
  labelKey: `themes.${id}`,
  icon: ICONS[id],
  avatar: avatarOf(id),
}));

/** Definição (sem slots) de um tema registrado. */
export function getTheme(id: ThemeId): Omit<ThemeDefinition, 'slots'> {
  const theme = THEMES.find((candidate) => candidate.id === id);
  if (!theme) throw new Error(`Tema não registrado: ${id}`);
  return theme;
}

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.some((id) => id === value);
}
