import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveSection } from '../hooks/useActiveSection.ts';
import { MobileDrawer } from '../layout/MobileDrawer.tsx';
import { Navbar } from '../layout/Navbar.tsx';
import { Sidebar } from '../layout/Sidebar.tsx';
import { Section } from '../sections/Section.tsx';
import { SECTIONS, type SectionId } from '../sections/sections.ts';

const MENU_ID = 'menu-mobile';
// Mesmo breakpoint `lg` em que a sidebar fixa aparece.
const DESKTOP_QUERY = '(min-width: 64rem)';

const SECTION_IDS = SECTIONS.map(({ id }) => id) as [SectionId, ...SectionId[]];

// Provisório até o conteúdo real: alturas variadas (e Contato curta no fim) para
// exercitar o scroll spy.
const PLACEHOLDER_HEIGHT: Record<SectionId, string> = {
  inicio: 'min-h-[70vh]',
  sobre: 'min-h-[40vh]',
  skills: 'min-h-[120vh]',
  projetos: 'min-h-[90vh]',
  experiencia: 'min-h-[60vh]',
  formacao: 'min-h-[50vh]',
  contato: '',
};

export function AppShell() {
  const { t } = useTranslation();
  const { activeId, navigateTo } = useActiveSection(SECTION_IDS);
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
    <>
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
      />
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
        {SECTIONS.map(({ id }) => (
          <Section
            key={id}
            id={id}
            title={t(`sections.${id}`)}
            className={PLACEHOLDER_HEIGHT[id]}
          />
        ))}
      </main>
    </>
  );
}
