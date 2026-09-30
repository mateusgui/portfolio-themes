import type { MouseEvent } from 'react';

/** Ctrl/Cmd/Shift/Alt ou botão do meio: deixa o navegador abrir a âncora como quiser. */
export function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
