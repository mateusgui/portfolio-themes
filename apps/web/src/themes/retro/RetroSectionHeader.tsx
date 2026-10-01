import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';

import type { SectionHeaderProps } from '../registry.ts';

/** Estrela de quatro pontas, desenhada em SVG (decorativa). */
function Sparkle() {
  return (
    <svg
      aria-hidden="true"
      data-testid="sparkle"
      viewBox="0 0 24 24"
      className="inline-block size-[0.6em] fill-surface-alt stroke-fg align-[0.1em] motion-safe:animate-blink"
    >
      <path
        d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const WINDOW_CONTROLS = [MinusIcon, SquareIcon, XIcon];

/**
 * Hero: nome entre estrelas piscando. Seções: barra de título de janela, com
 * botões de minimizar/maximizar/fechar só de enfeite.
 */
export function RetroSectionHeader({ title, level }: SectionHeaderProps) {
  if (level === 1) {
    return (
      <>
        <Sparkle /> {title} <Sparkle />
      </>
    );
  }

  return (
    <span className="flex items-center justify-between gap-2">
      <span>{title}</span>
      <span aria-hidden="true" data-testid="window-controls" className="flex gap-0.5">
        {WINDOW_CONTROLS.map((Icon, index) => (
          <span
            key={index}
            className="grid size-6 place-items-center bg-surface text-fg shadow-theme"
          >
            <Icon className="size-3.5" strokeWidth={3} />
          </span>
        ))}
      </span>
    </span>
  );
}
