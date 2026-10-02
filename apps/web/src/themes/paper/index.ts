import type { ThemeModule } from '../registry.ts';
import { PaperDoodles } from './PaperDoodles.tsx';
import { PaperSectionHeader } from './PaperSectionHeader.tsx';
import { PaperSidebarItem } from './PaperSidebarItem.tsx';

export const paperTheme: ThemeModule = {
  id: 'paper',
  labelKey: 'themes.paper',
  slots: {
    SidebarItem: PaperSidebarItem,
    SectionHeader: PaperSectionHeader,
    Decoration: PaperDoodles,
  },
};
