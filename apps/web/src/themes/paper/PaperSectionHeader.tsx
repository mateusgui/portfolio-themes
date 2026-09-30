import type { SectionHeaderProps } from '../registry.ts';

/** Título manuscrito com sublinhado rabiscado a caneta (decorativo). */
export function PaperSectionHeader({ title }: SectionHeaderProps) {
  return (
    <span className="relative inline-block">
      {title}
      <svg
        aria-hidden="true"
        data-testid="scribble-underline"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="absolute -bottom-2 left-0 h-3 w-full text-accent"
      >
        <path
          d="M2 8 C 30 2, 55 11, 85 6 S 140 2, 165 7 S 190 9, 198 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
