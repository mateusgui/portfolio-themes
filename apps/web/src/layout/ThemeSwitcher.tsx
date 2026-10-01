import { ChevronDownIcon, PaletteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { THEMES, isThemeId } from '../themes/registry.ts';
import { useTheme, useThemeSlots } from '../themes/useTheme.ts';

/** Seletor de temas: 5 botões a partir de `md`; `<select>` compacto em telas menores. */
export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const ButtonContent = useThemeSlots().ThemeButton;

  return (
    <>
      <div role="group" aria-label={t('navbar.themes')} className="hidden gap-1 md:flex">
        {THEMES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === theme}
            onClick={() => {
              setTheme(id);
            }}
            className="rounded-theme border border-border px-3 py-1 text-sm hover:bg-surface-alt aria-pressed:bg-accent aria-pressed:text-accent-fg"
          >
            {ButtonContent ? (
              <ButtonContent theme={id} label={t(labelKey)} pressed={id === theme} />
            ) : (
              t(labelKey)
            )}
          </button>
        ))}
      </div>

      <label className="relative flex items-center md:hidden">
        <span className="sr-only">{t('navbar.themes')}</span>
        <PaletteIcon aria-hidden="true" className="pointer-events-none absolute left-2 size-4" />
        <select
          value={theme}
          onChange={(event) => {
            const { value } = event.target;
            if (isThemeId(value)) setTheme(value);
          }}
          className="appearance-none rounded-theme border border-border bg-surface py-1 pr-8 pl-8 text-sm text-fg hover:bg-surface-alt"
        >
          {THEMES.map(({ id, labelKey }) => (
            <option key={id} value={id}>
              {t(labelKey)}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-2 size-4 text-muted"
        />
      </label>
    </>
  );
}
