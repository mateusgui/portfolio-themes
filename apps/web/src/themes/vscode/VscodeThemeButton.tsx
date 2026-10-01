import { CheckIcon } from 'lucide-react';

import type { ThemeButtonProps } from '../registry.ts';

/** Item da lista "Color Theme": o tema atual ganha um ✓. */
export function VscodeThemeButton({ label, pressed }: ThemeButtonProps) {
  return (
    <span className="flex items-center gap-1">
      <CheckIcon
        aria-hidden="true"
        data-testid={pressed ? 'theme-check' : undefined}
        className={`size-3.5 ${pressed ? '' : 'invisible'}`}
      />
      {label}
    </span>
  );
}
