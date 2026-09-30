/**
 * Rabiscos de caneta nas margens (estrela, espiral, seta). Puramente decorativos:
 * ficam atrás do conteúdo e só aparecem em telas largas, onde há margem livre.
 */
export function PaperDoodles() {
  return (
    <div
      aria-hidden="true"
      data-testid="paper-doodles"
      className="pointer-events-none fixed inset-0 -z-10 hidden text-muted opacity-40 xl:block"
    >
      <svg viewBox="0 0 60 60" className="absolute top-28 right-8 size-14">
        <path
          d="M30 5 L36 23 L55 23 L40 35 L46 54 L30 42 L14 54 L20 35 L5 23 L24 23 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <svg viewBox="0 0 80 80" className="absolute right-12 bottom-24 size-20 text-accent">
        <path
          d="M40 40 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16 a20 20 0 1 1 -20 -20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <svg viewBox="0 0 120 60" className="absolute top-1/2 right-4 h-12 w-24">
        <path
          d="M5 40 C 30 10, 70 55, 105 20 M92 16 L106 19 L102 33"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
