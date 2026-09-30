import { expect, test } from '@playwright/test';

test('a página inicial abre', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Mateus Guimarães/);
  await expect(page.getByRole('heading', { level: 1, name: 'Olá' })).toBeVisible();
});
