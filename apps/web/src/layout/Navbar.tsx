import { MenuIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SectionId } from '../sections/sections.ts';
import { Brand } from './Brand.tsx';
import { LanguageSelect } from './LanguageSelect.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

interface NavbarProps {
  menuId: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onNavigate: (id: SectionId) => void;
}

/**
 * Três áreas num grid `1fr auto 1fr`: identidade à esquerda, temas no centro
 * (centralizados de verdade, porque as laterais têm a mesma largura) e idioma à direita.
 */
export function Navbar({ menuId, menuOpen, onOpenMenu, onNavigate }: NavbarProps) {
  const { t } = useTranslation();

  return (
    <header className="fixed inset-x-0 top-0 z-30 grid h-(--navbar-height) grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-surface px-2 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t('navbar.openMenu')}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className="rounded-theme p-2 hover:bg-surface-alt lg:hidden"
        >
          <MenuIcon aria-hidden="true" className="size-5" />
        </button>

        <Brand onNavigate={onNavigate} />
      </div>

      <ThemeSwitcher />

      <div className="justify-self-end">
        <LanguageSelect />
      </div>
    </header>
  );
}
