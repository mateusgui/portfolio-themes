import type { ThemeDefinition } from '../registry.ts';
import { RetroBar } from './RetroBar.tsx';
import { RetroSectionHeader } from './RetroSectionHeader.tsx';
import { RetroSidebarItem } from './RetroSidebarItem.tsx';

export const retroTheme: ThemeDefinition = {
  id: 'retro',
  labelKey: 'themes.retro',
  slots: {
    SidebarItem: RetroSidebarItem,
    SectionHeader: RetroSectionHeader,
    Decoration: RetroBar,
  },
};
