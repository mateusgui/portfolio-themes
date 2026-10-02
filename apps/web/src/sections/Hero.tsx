import { MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { availability, profile } from '../content/profile.ts';
import { isModifiedClick } from '../layout/isModifiedClick.ts';
import { HeroPhoto } from './HeroPhoto.tsx';
import { Section } from './Section.tsx';
import type { SectionBodyProps } from './sectionBody.ts';

export function Hero({ onNavigate }: SectionBodyProps) {
  const { t } = useTranslation();
  const { hero } = useContent();

  return (
    <Section
      id="inicio"
      title={profile.name}
      level={1}
      media={<HeroPhoto />}
      className="flex min-h-[calc(100svh-var(--navbar-height))] flex-col justify-center"
    >
      <div className="flex flex-col gap-4">
        <p className="font-heading text-2xl text-accent">{t('profile.role')}</p>
        <p className="max-w-2xl text-xl leading-relaxed">{hero.headline}</p>
        <p className="flex items-center gap-2 text-muted">
          <MapPinIcon aria-hidden="true" className="size-4" />
          {profile.location}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <a
          href="#contato"
          onClick={(event) => {
            if (isModifiedClick(event)) return;
            event.preventDefault();
            onNavigate('contato');
          }}
          className="rounded-theme bg-accent px-5 py-2.5 font-semibold text-accent-fg shadow-theme"
        >
          {t('hero.cta')}
        </a>

        {availability.open && (
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="absolute inline-flex size-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>
            {t('hero.available')}
          </p>
        )}
      </div>
    </Section>
  );
}
