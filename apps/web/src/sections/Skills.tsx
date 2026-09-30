import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { Chips } from './Chips.tsx';
import { Section } from './Section.tsx';

export function Skills() {
  const { t } = useTranslation();
  const { skills } = useContent();

  return (
    <Section id="skills" title={t('sections.skills')}>
      <div className="grid gap-8 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.id} className="flex flex-col gap-3">
            <h3 className="font-heading text-lg font-semibold">{group.title}</h3>
            <Chips items={group.items} />
          </div>
        ))}
      </div>
    </Section>
  );
}
