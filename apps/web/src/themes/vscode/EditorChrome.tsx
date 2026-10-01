import { CircleXIcon, GitBranchIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveSectionContext } from '../../app/ActiveSectionContext.ts';
import { useLanguage } from '../../i18n/index.ts';
import { LANGUAGES } from '../../i18n/languages.ts';
import { isModifiedClick } from '../../layout/isModifiedClick.ts';
import { SECTIONS, type SectionId } from '../../sections/sections.ts';
import { FileIcon } from './FileIcon.tsx';
import { useFileName } from './files.ts';

const TAB_CLASSES =
  'flex h-full shrink-0 items-center gap-1.5 border-r border-border px-3 text-sm whitespace-nowrap';

function TabLabel({ id }: { id: SectionId }) {
  const fileName = useFileName(id);

  return (
    <>
      <FileIcon id={id} />
      {fileName}
    </>
  );
}

/** Desktop: só a aba do arquivo atual, como indicador (a navegação é o Explorer). */
function ActiveTab() {
  const { activeId } = useActiveSectionContext();

  return (
    <div aria-hidden="true" className="hidden h-full lg:flex">
      <span data-vscode="tab" data-active="" data-testid="active-tab" className={TAB_CLASSES}>
        <TabLabel id={activeId} />
        <XIcon className="ml-2 size-3.5" />
      </span>
    </div>
  );
}

/** Mobile: sem Explorer fixo, as abas dos 7 arquivos viram a navegação. */
function MobileTabs() {
  const { t } = useTranslation();
  const { activeId, navigateTo } = useActiveSectionContext();
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Mantém a aba ativa visível na faixa, sem mexer na rolagem da página.
  useEffect(() => {
    const list = listRef.current;
    const tab = activeRef.current;
    if (!list || !tab) return;
    if (tab.offsetLeft < list.scrollLeft) {
      list.scrollLeft = tab.offsetLeft;
    } else if (tab.offsetLeft + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = tab.offsetLeft + tab.offsetWidth - list.clientWidth;
    }
  }, [activeId]);

  return (
    <nav aria-label={t('vscode.openFiles')} className="h-full lg:hidden">
      <ul ref={listRef} className="flex h-full overflow-x-auto">
        {SECTIONS.map(({ id }) => {
          const active = id === activeId;
          return (
            <li key={id} className="h-full">
              <a
                ref={active ? activeRef : undefined}
                href={`#${id}`}
                data-vscode="tab"
                aria-current={active ? 'location' : undefined}
                onClick={(event) => {
                  if (isModifiedClick(event)) return;
                  event.preventDefault();
                  navigateTo(id);
                }}
                className={TAB_CLASSES}
              >
                <TabLabel id={id} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Status bar decorativa: repete o que já está na tela (idioma, tema), então fica oculta. */
function StatusBar() {
  const { t } = useTranslation();
  const language = useLanguage();
  const languageName = LANGUAGES.find(({ code }) => code === language)?.name ?? language;

  return (
    <div
      aria-hidden="true"
      data-vscode="status"
      data-testid="status-bar"
      className="fixed inset-x-0 bottom-0 z-30 flex h-(--vscode-status-height) items-center gap-4 px-3 text-xs"
    >
      <span className="flex items-center gap-1">
        <GitBranchIcon className="size-3.5" />
        main
      </span>
      <span className="hidden items-center gap-1 sm:flex">
        <CircleXIcon className="size-3.5" />0
        <TriangleAlertIcon className="size-3.5" />0
      </span>
      <span className="ml-auto">{languageName}</span>
      <span className="hidden sm:inline">UTF-8</span>
      <span className="hidden sm:inline">LF</span>
      <span>{t('themes.vscode')}</span>
    </div>
  );
}

/** Decoração do VS Code: barra de abas sob a barra de título e status bar no rodapé. */
export function EditorChrome() {
  return (
    <>
      <div
        data-vscode="tabs"
        className="fixed inset-x-0 top-(--navbar-height) z-20 h-(--vscode-tabs-height) border-b border-border lg:left-(--sidebar-width)"
      >
        <ActiveTab />
        <MobileTabs />
      </div>
      <StatusBar />
    </>
  );
}
