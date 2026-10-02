import { useTranslation } from 'react-i18next';

import { THEMES } from '../themes/registry.ts';
import { useTheme, useThemeSlots } from '../themes/useTheme.ts';

/**
 * Seletor de temas: um botão por tema, com ícone. O nome aparece ao lado a
 * partir de `lg`; em telas menores fica só o ícone (o nome segue no `aria-label`).
 */
export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const ButtonContent = useThemeSlots().ThemeButton;

  return (
    <div role="group" aria-label={t('navbar.themes')} className="flex gap-1">
      {THEMES.map(({ id, labelKey, icon: Icon }) => {
        const label = t(labelKey);
        const icon = <Icon aria-hidden="true" className="size-4 shrink-0" />;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={id === theme}
            onClick={() => {
              setTheme(id);
            }}
            className="flex items-center gap-1.5 rounded-theme border border-border p-1.5 text-sm hover:bg-surface-alt aria-pressed:bg-accent aria-pressed:text-accent-fg lg:px-3 lg:py-1"
          >
            {ButtonContent ? (
              <ButtonContent theme={id} label={label} pressed={id === theme} icon={icon} />
            ) : (
              <>
                {icon}
                <span className="hidden lg:inline">{label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
