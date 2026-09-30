import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { formatPeriod } from '../i18n/format.ts';
import { useLanguage } from '../i18n/index.ts';
import { Section } from './Section.tsx';

export function Experience() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { experience } = useContent();

  return (
    <Section id="experiencia" title={t('sections.experiencia')}>
      <ol className="flex flex-col gap-10 border-l-2 border-border pl-6">
        {experience.map((entry) => (
          <li key={entry.id} className="relative flex flex-col gap-3">
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 border-surface bg-accent"
            />
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-xl font-semibold">{entry.role}</h3>
              <p className="font-medium">
                {entry.company} · {entry.location}
              </p>
              <p className="text-sm text-muted">
                {formatPeriod(entry.start, entry.end, language, t('dates.present'))}
              </p>
            </div>
            <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed marker:text-muted">
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
