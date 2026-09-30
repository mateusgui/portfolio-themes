import { useLanguage } from '../../i18n/index.ts';
import type { SidebarItemProps } from '../registry.ts';

/** Item como comando de terminal: `> sobre`, com cursor `█` piscando no ativo. */
export function HackerSidebarItem({ label, active }: SidebarItemProps) {
  const language = useLanguage();

  return (
    <>
      <span aria-hidden="true" className="text-muted">
        {'>'}
      </span>
      <span>{label.toLocaleLowerCase(language)}</span>
      {active && (
        <span aria-hidden="true" data-testid="cursor" className="motion-safe:animate-blink">
          █
        </span>
      )}
    </>
  );
}
