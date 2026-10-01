import type { SectionId } from '../../sections/sections.ts';
import { EXTENSIONS, ICON_LABELS } from './files.ts';

/** Ícone de arquivo (decorativo); a cor vem do CSS do tema por `data-file-icon`. */
export function FileIcon({ id }: { id: SectionId }) {
  const extension = EXTENSIONS[id];

  return (
    <span
      aria-hidden="true"
      data-file-icon={extension}
      className="inline-block w-6 shrink-0 text-center font-mono text-xs font-bold"
    >
      {ICON_LABELS[extension]}
    </span>
  );
}
