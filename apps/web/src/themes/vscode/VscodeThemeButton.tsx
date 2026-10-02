import { CheckIcon } from 'lucide-react';

import type { ThemeButtonProps } from '../registry.ts';

/** Item da lista "Color Theme": o tema atual ganha um ✓ (só onde o nome cabe). */
export function VscodeThemeButton({ label, pressed, icon }: ThemeButtonProps) {
  return (
    <>
      <CheckIcon
        aria-hidden="true"
        data-testid={pressed ? 'theme-check' : undefined}
        className={`hidden size-3.5 lg:block ${pressed ? '' : 'invisible'}`}
      />
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </>
  );
}
