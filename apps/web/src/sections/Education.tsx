import { GraduationCapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { formatPeriod } from '../i18n/format.ts';
import { useLanguage } from '../i18n/index.ts';
import { Section } from './Section.tsx';

export function Education() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { education } = useContent();

  return (
    <Section id="formacao" title={t('sections.formacao')}>
      <ul className="grid gap-6 md:grid-cols-2">
        {education.map((entry) => (
          <li
            key={entry.id}
            className="flex gap-4 rounded-theme border border-border bg-surface p-6 shadow-theme"
          >
            <GraduationCapIcon aria-hidden="true" className="size-6 shrink-0 text-accent" />
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold">{entry.course}</h3>
              {entry.degree && <p>{entry.degree}</p>}
              <p className="font-medium">{entry.institution}</p>
              <p className="text-sm text-muted">
                {formatPeriod(entry.start, entry.end, language, t('dates.present'))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
