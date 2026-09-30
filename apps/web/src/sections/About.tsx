import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { Section } from './Section.tsx';

export function About() {
  const { t } = useTranslation();
  const { about } = useContent();

  return (
    <Section id="sobre" title={t('sections.sobre')}>
      <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
