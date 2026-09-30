import { useCallback, useEffect, useState } from 'react';

import { MobileDrawer } from '../layout/MobileDrawer.tsx';
import { Navbar } from '../layout/Navbar.tsx';
import { Sidebar } from '../layout/Sidebar.tsx';
import { Section } from '../sections/Section.tsx';
import { SECTIONS } from '../sections/sections.ts';
import { strings } from './strings.ts';

const MENU_ID = 'menu-mobile';
// Mesmo breakpoint `lg` em que a sidebar fixa aparece.
const DESKTOP_QUERY = '(min-width: 64rem)';

export function AppShell() {
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
        {strings.skipLink}
      </a>

      <Navbar
        menuId={MENU_ID}
        menuOpen={menuOpen}
        onOpenMenu={() => {
          setMenuOpen(true);
        }}
      />
      <Sidebar />
      <MobileDrawer id={MENU_ID} open={menuOpen} onClose={closeMenu} />

      <main
        id="conteudo"
        tabIndex={-1}
        className="pt-(--navbar-height) outline-none lg:pl-(--sidebar-width)"
      >
        {SECTIONS.map(({ id }) => (
          <Section key={id} id={id} title={strings.sections[id]} />
        ))}
      </main>
    </>
  );
}
