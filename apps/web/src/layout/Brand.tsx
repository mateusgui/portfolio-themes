import { useTranslation } from 'react-i18next';

import { profile } from '../content/profile.ts';
import type { SectionId } from '../sections/sections.ts';
import { isModifiedClick } from './isModifiedClick.ts';

const HOME: SectionId = 'inicio';

interface BrandProps {
  /** Chamado ao clicar, no lugar da navegação nativa da âncora. */
  onNavigate: (id: SectionId) => void;
}

/**
 * Identidade na navbar: ícone com as iniciais e o nome, numa linha só, como link
 * para o início. Onde o nome não cabe, fica só o ícone (o nome segue no `aria-label`).
 */
export function Brand({ onNavigate }: BrandProps) {
  const { t } = useTranslation();

  return (
    <a
      href={`#${HOME}`}
      data-brand=""
      aria-label={t('navbar.home', { name: profile.name })}
      onClick={(event) => {
        if (isModifiedClick(event)) return;
        event.preventDefault();
        onNavigate(HOME);
      }}
      className="flex min-w-0 items-center gap-2 rounded-full"
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-accent font-heading text-sm text-accent-fg"
      >
        {profile.initials}
      </span>
      <span data-brand-name="" className="hidden truncate pr-2 font-heading xl:inline">
        {profile.name}
      </span>
    </a>
  );
}
