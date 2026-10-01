import type { ThemeDefinition } from '../registry.ts';
import { EditorChrome } from './EditorChrome.tsx';
import { VscodeSectionHeader } from './VscodeSectionHeader.tsx';
import { VscodeSidebarItem } from './VscodeSidebarItem.tsx';
import { VscodeThemeButton } from './VscodeThemeButton.tsx';

export const vscodeTheme: ThemeDefinition = {
  id: 'vscode',
  labelKey: 'themes.vscode',
  slots: {
    SidebarItem: VscodeSidebarItem,
    SectionHeader: VscodeSectionHeader,
    ThemeButton: VscodeThemeButton,
    Decoration: EditorChrome,
  },
};
