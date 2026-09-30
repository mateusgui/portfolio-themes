import { FileTextIcon } from 'lucide-react';
import { useEffect, useRef, type ComponentType, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { scrollOffsetToReveal } from '../hooks/scrollSpy.ts';
import { SECTIONS, type SectionId } from '../sections/sections.ts';
import { GitHubIcon, LinkedInIcon } from './BrandIcons.tsx';
import { profile } from './profile.ts';

interface ExternalLink {
  href: string;
  labelKey: 'sidebar.linkedin' | 'sidebar.github' | 'sidebar.resume';
  icon: ComponentType<{ className?: string }>;
}

const EXTERNAL_LINKS: ExternalLink[] = [
  { href: profile.links.linkedin, labelKey: 'sidebar.linkedin', icon: LinkedInIcon },
  { href: profile.links.github, labelKey: 'sidebar.github', icon: GitHubIcon },
  { href: profile.links.resume, labelKey: 'sidebar.resume', icon: FileTextIcon },
];

export interface SidebarContentProps {
  activeId: SectionId;
  /** Chamado ao clicar num link de seção, no lugar da navegação nativa da âncora. */
  onNavigate: (id: SectionId) => void;
}

/** Ctrl/Cmd/Shift/Alt ou botão do meio: deixa o navegador abrir a âncora como quiser. */
function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Conteúdo da sidebar, compartilhado pela sidebar fixa (desktop) e pelo drawer (mobile). */
export function SidebarContent({ activeId, onNavigate }: SidebarContentProps) {
  const { t } = useTranslation();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  // Se o item ativo sair da área visível da sidebar, ela rola até ele. O contêiner
  // que rola (a `<aside>` ou o painel do drawer) é marcado com `data-sidebar-scroll`.
  useEffect(() => {
    const link = activeLinkRef.current;
    const container = link?.closest<HTMLElement>('[data-sidebar-scroll]');
    if (!link || !container) return;

    const containerBox = container.getBoundingClientRect();
    const offset = scrollOffsetToReveal(
      { top: containerBox.top, bottom: containerBox.bottom, scrollTop: container.scrollTop },
      link.getBoundingClientRect(),
    );
    if (offset !== null) container.scrollTop = offset;
  }, [activeId]);

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
          <p className="text-sm text-muted">{t('profile.role')}</p>
        </div>
      </div>

      <nav aria-label={t('sidebar.sectionsNav')}>
        <ul className="flex flex-col gap-1">
          {SECTIONS.map(({ id, icon: Icon }) => {
            const active = id === activeId;
            return (
              <li key={id}>
                <a
                  ref={active ? activeLinkRef : undefined}
                  href={`#${id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={(event) => {
                    if (isModifiedClick(event)) return;
                    event.preventDefault();
                    onNavigate(id);
                  }}
                  className={`flex items-center gap-3 rounded-theme px-3 py-2 hover:bg-surface-alt ${
                    active ? 'bg-surface-alt font-semibold text-accent' : ''
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  {t(`sections.${id}`)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label={t('sidebar.externalLinks')} className="mt-auto">
        <ul className="flex flex-col gap-1">
          {EXTERNAL_LINKS.map(({ href, labelKey, icon: Icon }) => (
            <li key={labelKey}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t(labelKey)} ${t('newTab')}`}
                className="flex items-center gap-3 rounded-theme px-3 py-2 text-sm text-muted hover:bg-surface-alt hover:text-fg"
              >
                <Icon className="size-4 shrink-0" />
                {t(labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Sidebar(props: SidebarContentProps) {
  return (
    <aside
      data-sidebar-scroll
      className="fixed top-(--navbar-height) bottom-0 left-0 hidden w-(--sidebar-width) overflow-y-auto border-r border-border bg-surface lg:block"
    >
      <SidebarContent {...props} />
    </aside>
  );
}
