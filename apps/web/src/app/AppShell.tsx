import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveSection } from '../hooks/useActiveSection.ts';
import { MobileDrawer } from '../layout/MobileDrawer.tsx';
import { Navbar } from '../layout/Navbar.tsx';
import { Sidebar } from '../layout/Sidebar.tsx';
import { About } from '../sections/About.tsx';
import { Contact } from '../sections/Contact.tsx';
import { Education } from '../sections/Education.tsx';
import { Experience } from '../sections/Experience.tsx';
import { Hero } from '../sections/Hero.tsx';
import { Projects } from '../sections/Projects.tsx';
import type { SectionBodyProps } from '../sections/sectionBody.ts';
import { Skills } from '../sections/Skills.tsx';
import { SECTIONS, type SectionId } from '../sections/sections.ts';
import { useThemeSlots } from '../themes/useTheme.ts';
import { ActiveSectionContext } from './ActiveSectionContext.ts';

const MENU_ID = 'menu-mobile';
// Mesmo breakpoint `lg` em que a sidebar fixa aparece.
const DESKTOP_QUERY = '(min-width: 64rem)';

const SECTION_IDS = SECTIONS.map(({ id }) => id) as [SectionId, ...SectionId[]];

// Corpo de cada seção, na ordem da sidebar.
const SECTION_COMPONENTS: Record<SectionId, ComponentType<SectionBodyProps>> = {
  inicio: Hero,
  sobre: About,
  skills: Skills,
  projetos: Projects,
  experiencia: Experience,
  formacao: Education,
  contato: Contact,
};

export function AppShell() {
  const { t } = useTranslation();
  const { activeId, navigateTo } = useActiveSection(SECTION_IDS);
  const activeSection = useMemo(() => ({ activeId, navigateTo }), [activeId, navigateTo]);
  const { Decoration } = useThemeSlots();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Se a tela crescer até o desktop com o drawer aberto, fecha o drawer.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener('change', handleChange);
    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <ActiveSectionContext value={activeSection}>
      <a
        href="#conteudo"
        className="sr-only z-50 bg-accent px-4 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t('skipLink')}
      </a>

      <Navbar
        menuId={MENU_ID}
        menuOpen={menuOpen}
        onOpenMenu={() => {
          setMenuOpen(true);
        }}
        onNavigate={navigateTo}
      />
      {Decoration && <Decoration />}
      <Sidebar activeId={activeId} onNavigate={navigateTo} />
      <MobileDrawer
        id={MENU_ID}
        open={menuOpen}
        onClose={closeMenu}
        activeId={activeId}
        onNavigate={navigateTo}
      />

      <main
        id="conteudo"
        tabIndex={-1}
        className="pt-(--navbar-height) outline-none lg:pl-(--sidebar-width)"
      >
        {SECTIONS.map(({ id }) => {
          const SectionBody = SECTION_COMPONENTS[id];
          return <SectionBody key={id} onNavigate={navigateTo} />;
        })}
      </main>
    </ActiveSectionContext>
  );
}
