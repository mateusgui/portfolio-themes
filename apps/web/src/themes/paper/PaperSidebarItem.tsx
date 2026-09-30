import { SECTIONS } from '../../sections/sections.ts';
import type { SidebarItemProps } from '../registry.ts';

/** Item como linha de índice de caderno: `Sobre ······ 02`, com marca-texto no ativo. */
export function PaperSidebarItem({ id, label, active }: SidebarItemProps) {
  const page = String(SECTIONS.findIndex((section) => section.id === id) + 1).padStart(2, '0');

  return (
    <>
      <span
        data-testid={active ? 'highlighter' : undefined}
        className={active ? '-mx-1 -skew-x-6 bg-surface-alt px-1 text-fg' : undefined}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="mb-1 flex-1 self-end border-b-2 border-dotted border-border"
      />
      <span aria-hidden="true" className="font-heading text-lg text-muted">
        {page}
      </span>
    </>
  );
}
