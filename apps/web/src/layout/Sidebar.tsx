import { FileTextIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import { strings } from '../app/strings.ts';
import { SECTIONS } from '../sections/sections.ts';
import { GitHubIcon, LinkedInIcon } from './BrandIcons.tsx';
import { profile } from './profile.ts';

interface ExternalLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const EXTERNAL_LINKS: ExternalLink[] = [
  { href: profile.links.linkedin, label: strings.sidebar.linkedin, icon: LinkedInIcon },
  { href: profile.links.github, label: strings.sidebar.github, icon: GitHubIcon },
  { href: profile.links.resume, label: strings.sidebar.resume, icon: FileTextIcon },
];

interface SidebarContentProps {
  /** Chamado ao clicar num link de seção (o drawer usa para fechar). */
  onNavigate?: () => void;
}

/** Conteúdo da sidebar, compartilhado pela sidebar fixa (desktop) e pelo drawer (mobile). */
export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex min-h-full flex-col gap-8 p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-accent font-heading text-lg text-accent-fg"
        >
          {profile.initials}
        </span>
        <div>
          <p className="font-heading leading-tight">{profile.name}</p>
          <p className="text-sm text-muted">{profile.role}</p>
        </div>
      </div>

      <nav aria-label={strings.sidebar.sectionsNav}>
        <ul className="flex flex-col gap-1">
          {SECTIONS.map(({ id, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-theme px-3 py-2 hover:bg-surface-alt"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {strings.sections[id]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label={strings.sidebar.externalLinks} className="mt-auto">
        <ul className="flex flex-col gap-1">
          {EXTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} ${strings.newTab}`}
                className="flex items-center gap-3 rounded-theme px-3 py-2 text-sm text-muted hover:bg-surface-alt hover:text-fg"
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed top-(--navbar-height) bottom-0 left-0 hidden w-(--sidebar-width) overflow-y-auto border-r border-border bg-surface lg:block">
      <SidebarContent />
    </aside>
  );
}
