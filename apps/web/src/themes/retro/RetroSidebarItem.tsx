import type { SidebarItemProps } from '../registry.ts';

/** Botão bevel com link sublinhado; o ativo ganha uma seta `◄` piscando. */
export function RetroSidebarItem({ label, active, icon }: SidebarItemProps) {
  return (
    <>
      {icon}
      <span className="underline underline-offset-2">{label}</span>
      {active && (
        <span
          aria-hidden="true"
          data-testid="retro-pointer"
          className="ml-auto motion-safe:animate-blink"
        >
          ◄
        </span>
      )}
    </>
  );
}
