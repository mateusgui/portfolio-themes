import { ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useMediaQuery } from '../hooks/useMediaQuery.ts';
import { changeLanguage, useLanguage } from '../i18n/index.ts';
import { LANGUAGES, isLanguage } from '../i18n/languages.ts';

// Abaixo do breakpoint `sm`, o nome inteiro não cabe ao lado dos botões de tema.
const NARROW_QUERY = '(max-width: 39.99rem)';

/**
 * Seletor de idioma da navbar. Cada idioma aparece no próprio nome, com o `lang`
 * certo; em telas estreitas, só o código (PT, EN, ES), com o nome no `aria-label`.
 */
export function LanguageSelect() {
  const { t } = useTranslation();
  const language = useLanguage();
  const narrow = useMediaQuery(NARROW_QUERY);

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t('navbar.language')}</span>
      <LanguagesIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-2 hidden size-4 sm:block"
      />
      <select
        value={language}
        onChange={(event) => {
          const { value } = event.target;
          if (isLanguage(value)) void changeLanguage(value);
        }}
        className="appearance-none rounded-theme border border-border bg-surface py-1 pr-7 pl-2 text-sm text-fg hover:bg-surface-alt sm:pr-8 sm:pl-8"
      >
        {LANGUAGES.map(({ code, name, short }) => (
          <option key={code} value={code} lang={code} aria-label={narrow ? name : undefined}>
            {narrow ? short : name}
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
