import type { ThemeDefinition } from '../registry.ts';
import { PaperDoodles } from './PaperDoodles.tsx';
import { PaperSectionHeader } from './PaperSectionHeader.tsx';
import { PaperSidebarItem } from './PaperSidebarItem.tsx';

export const paperTheme: ThemeDefinition = {
  id: 'paper',
  labelKey: 'themes.paper',
  slots: {
    SidebarItem: PaperSidebarItem,
    SectionHeader: PaperSectionHeader,
    Decoration: PaperDoodles,
  },
};
