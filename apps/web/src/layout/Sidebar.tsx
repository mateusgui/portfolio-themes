import { FileTextIcon } from 'lucide-react';
import { useEffect, useRef, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { scrollOffsetToReveal } from '../hooks/scrollSpy.ts';
import { SECTIONS, type SectionId } from '../sections/sections.ts';
import { GitHubIcon, LinkedInIcon } from './BrandIcons.tsx';
import { isModifiedClick } from './isModifiedClick.ts';
import type { SidebarItemProps } from '../themes/registry.ts';
import { useThemeSlots } from '../themes/useTheme.ts';
import { profile, resumeHref } from '../content/profile.ts';
import { useLanguage } from '../i18n/index.ts';
import type { Language } from '../i18n/languages.ts';

interface ExternalLink {
  href: (language: Language) => string;
  labelKey: 'sidebar.linkedin' | 'sidebar.github' | 'sidebar.resume';
  icon: ComponentType<{ className?: string }>;
}

const EXTERNAL_LINKS: ExternalLink[] = [
  { href: () => profile.links.linkedin, labelKey: 'sidebar.linkedin', icon: LinkedInIcon },
  { href: () => profile.links.github, labelKey: 'sidebar.github', icon: GitHubIcon },
  // Currículo no idioma atual.
  { href: resumeHref, labelKey: 'sidebar.resume', icon: FileTextIcon },
];

export interface SidebarContentProps {
  activeId: SectionId;
  /** Chamado ao clicar num link de seção, no lugar da navegação nativa da âncora. */
  onNavigate: (id: SectionId) => void;
}

/** Item padrão: ícone e nome da seção. */
function DefaultSidebarItem({ label, icon }: SidebarItemProps) {
  return (
    <>
      {icon}
      {label}
    </>
  );
}

/**
 * Conteúdo da sidebar (navegação e links externos; a identidade fica na navbar),
 * compartilhado pela sidebar fixa (desktop) e pelo drawer (mobile). O contêiner é
 * uma coluna flex, para os links externos ficarem no rodapé.
 */
export function SidebarContent({ activeId, onNavigate }: SidebarContentProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const Item = useThemeSlots().SidebarItem ?? DefaultSidebarItem;

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
    <div className="flex grow flex-col gap-8 p-6">
      <nav aria-label={t('sidebar.sectionsNav')} data-nav="sections">
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
                  <Item
                    id={id}
                    label={t(`sections.${id}`)}
                    active={active}
                    icon={<Icon aria-hidden="true" className="size-5 shrink-0" />}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label={t('sidebar.externalLinks')} data-nav="external" className="mt-auto">
        <ul className="flex flex-col gap-1">
          {EXTERNAL_LINKS.map(({ href, labelKey, icon: Icon }) => (
            <li key={labelKey}>
              <a
                href={href(language)}
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
      className="fixed top-(--navbar-height) bottom-0 left-0 hidden w-(--sidebar-width) flex-col overflow-y-auto border-r border-border bg-surface lg:flex"
    >
      <SidebarContent {...props} />
    </aside>
  );
}
