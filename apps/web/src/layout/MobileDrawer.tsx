import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { strings } from '../app/strings.ts';
import { SidebarContent } from './Sidebar.tsx';

interface MobileDrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Sidebar como drawer no mobile. Usa `<dialog>` modal: o resto da página fica
 * inerte, Esc fecha nativamente e o foco volta ao botão que abriu. O `<dialog>`
 * deixa o Tab escapar para a interface do navegador, então o ciclo é feito aqui.
 */
export function MobileDrawer({ id, open, onClose }: MobileDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Esc, o botão de fechar, os links e o clique fora terminam no evento `close`.
    const handleClose = () => {
      onClose();
    };
    // O painel ocupa o dialog inteiro: clique com alvo no próprio dialog é no backdrop.
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
      dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const close = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-label={strings.drawer.label}
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface p-0 text-fg backdrop:bg-fg/50 motion-safe:transition-transform motion-safe:duration-200 lg:hidden starting:open:-translate-x-full"
    >
      <div className="relative h-full overflow-y-auto">
        <button
          type="button"
          onClick={close}
          aria-label={strings.drawer.close}
          className="absolute top-3 right-3 rounded-theme p-2 hover:bg-surface-alt"
        >
          <XIcon aria-hidden="true" className="size-5" />
        </button>
        {open && <SidebarContent onNavigate={close} />}
      </div>
    </dialog>
  );
}
