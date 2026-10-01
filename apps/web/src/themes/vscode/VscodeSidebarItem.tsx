import type { SidebarItemProps } from '../registry.ts';
import { FileIcon } from './FileIcon.tsx';
import { useFileName } from './files.ts';

/** Item do Explorer: ícone e nome do arquivo da seção. */
export function VscodeSidebarItem({ id }: SidebarItemProps) {
  const fileName = useFileName(id);

  return (
    <>
      <FileIcon id={id} />
      <span>{fileName}</span>
    </>
  );
}
