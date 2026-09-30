import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { ThemeProvider } from '../themes/ThemeProvider.tsx';

/** `render` com os providers do app (tema). */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ThemeProvider, ...options });
}
