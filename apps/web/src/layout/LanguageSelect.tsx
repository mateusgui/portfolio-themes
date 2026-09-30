import { ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { changeLanguage, useLanguage } from '../i18n/index.ts';
import { LANGUAGES, isLanguage } from '../i18n/languages.ts';

/** Seletor de idioma da navbar. Cada idioma aparece no próprio nome, com o `lang` certo. */
export function LanguageSelect() {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t('navbar.language')}</span>
      <LanguagesIcon aria-hidden="true" className="pointer-events-none absolute left-2 size-4" />
      <select
        value={language}
        onChange={(event) => {
          const { value } = event.target;
          if (isLanguage(value)) void changeLanguage(value);
        }}
        className="appearance-none rounded-theme border border-border bg-surface py-1 pr-8 pl-8 text-sm text-fg hover:bg-surface-alt"
      >
        {LANGUAGES.map(({ code, name }) => (
          <option key={code} value={code} lang={code}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2 size-4 text-muted"
      />
    </label>
  );
}
