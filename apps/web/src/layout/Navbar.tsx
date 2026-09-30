import { MenuIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageSelect } from './LanguageSelect.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

interface NavbarProps {
  menuId: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function Navbar({ menuId, menuOpen, onOpenMenu }: NavbarProps) {
  const { t } = useTranslation();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-(--navbar-height) items-center gap-3 border-b border-border bg-surface px-4">
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

      <ThemeSwitcher />

      <div className="ml-auto">
        <LanguageSelect />
      </div>
    </header>
  );
}
