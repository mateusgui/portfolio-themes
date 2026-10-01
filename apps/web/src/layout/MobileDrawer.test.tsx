import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppShell } from '../app/AppShell.tsx';
import { renderWithProviders } from '../tests/render.tsx';

async function openDrawer() {
  renderWithProviders(<AppShell />);
  await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  const dialog = screen.getByRole('dialog', { name: 'Menu' });
  const focusable = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) throw new Error('drawer sem elementos focáveis');
  return { dialog, first, last };
}

describe('MobileDrawer: foco preso no painel', () => {
  it('Tab no último elemento volta ao primeiro', async () => {
    const { dialog, first, last } = await openDrawer();
    last.focus();

    const event = fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(event).toBe(false); // preventDefault: o navegador não move o foco para fora
    expect(first).toHaveFocus();
  });

  it('Shift+Tab no primeiro elemento vai para o último', async () => {
    const { dialog, first, last } = await openDrawer();
    first.focus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(last).toHaveFocus();
  });

  it('no meio da lista, o Tab segue o fluxo normal', async () => {
    const { dialog } = await openDrawer();
    const middle = within(dialog).getByRole('link', { name: 'Skills' });
    middle.focus();

    const event = fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(event).toBe(true);
    expect(middle).toHaveFocus();
  });

  it('outras teclas não interferem', async () => {
    const { dialog, last } = await openDrawer();
    last.focus();

    expect(fireEvent.keyDown(dialog, { key: 'ArrowDown' })).toBe(true);
    expect(last).toHaveFocus();
  });

  it('o evento close do dialog (Esc) fecha o menu', async () => {
    const { dialog } = await openDrawer();

    fireEvent(dialog, new Event('close'));

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
