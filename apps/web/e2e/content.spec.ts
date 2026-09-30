import { expect, test } from '@playwright/test';

test('o CTA "Entrar em contato" rola até o Contato e foca o título', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Entrar em contato' }).click();

  await expect(page.getByRole('heading', { name: 'Contato' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Contato' })).toBeInViewport();
  await expect(page).toHaveURL(/#contato$/);
});

test('a página publicada não mostra Só Cópias, Hora do Lixo nem telefone', async ({ page }) => {
  for (const lang of ['pt-BR', 'en', 'es']) {
    await page.goto(`/?lang=${lang}`);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);

    const html = await page.content();
    expect(html).not.toMatch(/s[óo]\s*c[óo]pias/i);
    expect(html).not.toMatch(/hora\s*do\s*lixo/i);
    expect(html).not.toMatch(/\btel:/i);
    expect(await page.locator('body').innerText()).not.toMatch(
      /\(?\b\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}\b/,
    );
  }
});
