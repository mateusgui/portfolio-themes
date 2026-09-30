import { MenuIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageSelect } from './LanguageSelect.tsx';

// Placeholder: a troca de tema de verdade entra na Etapa 5.
const THEME_IDS = ['hacker', 'retro', 'minimal', 'vscode', 'paper'] as const;
const PLACEHOLDER_ACTIVE_THEME = 'minimal';

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

      <div role="group" aria-label={t('navbar.themes')} className="hidden gap-1 md:flex">
        {THEME_IDS.map((themeId) => (
          <button
            key={themeId}
            type="button"
            aria-pressed={themeId === PLACEHOLDER_ACTIVE_THEME}
            className="rounded-theme border border-border px-3 py-1 text-sm hover:bg-surface-alt aria-pressed:bg-accent aria-pressed:text-accent-fg"
          >
            {t(`themes.${themeId}`)}
          </button>
        ))}
      </div>

      <div className="ml-auto">
        <LanguageSelect />
      </div>
    </header>
  );
}
