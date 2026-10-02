import type { ThemeModule } from '../registry.ts';
import { CharacterRain } from './CharacterRain.tsx';
import { HackerSectionHeader } from './HackerSectionHeader.tsx';
import { HackerSidebarItem } from './HackerSidebarItem.tsx';

export const hackerTheme: ThemeModule = {
  id: 'hacker',
  labelKey: 'themes.hacker',
  slots: {
    SidebarItem: HackerSidebarItem,
    SectionHeader: HackerSectionHeader,
    Decoration: CharacterRain,
  },
};
