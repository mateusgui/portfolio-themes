import { expect, test, type Page } from '@playwright/test';

async function switchToPaper(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('combobox', { name: 'Temas' }).selectOption('paper');
  } else {
    await page.getByRole('button', { name: 'Papel' }).click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
}

const firstCard = (page: Page) =>
  page.getByRole('region', { name: 'Projetos' }).getByRole('article').first();

test('trocar para o Papel aplica o visual de caderno sem recarregar', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.assign(window, { sameDocument: true });
  });

  await switchToPaper(page, isMobile);

  const html = page.locator('html');
  await expect(html).toHaveCSS('background-color', 'rgb(243, 234, 211)');
  await expect(html).toHaveCSS('background-image', /data:image\/svg\+xml/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Source Serif 4/);
  await expect(page.getByRole('heading', { level: 2, name: 'Sobre' })).toHaveCSS(
    'font-family',
    /Caveat/,
  );
  expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);

  // Post-it amarelo e levemente girado.
  await expect(firstCard(page)).toHaveCSS('background-color', 'rgb(255, 241, 161)');
  await expect(firstCard(page)).toHaveCSS('rotate', '-1.2deg');
});

test('o corpo do texto continua legível', async ({ page }) => {
  await page.goto('/?tema=paper');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const paragraph = page.getByRole('region', { name: 'Sobre' }).locator('p').first();
  const fontSize = await paragraph.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  );
  expect(fontSize).toBeGreaterThanOrEqual(16);
  await expect(paragraph).toHaveCSS('font-family', /Source Serif 4/);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  test('a sidebar vira índice e o marca-texto segue a seção ativa', async ({ page }) => {
    await page.goto('/?tema=paper');
    const sidebar = page.getByRole('complementary');

    await expect(sidebar.getByRole('link', { name: 'Projetos' })).toHaveText(/^Projetos\s*04$/);
    await expect(sidebar.getByTestId('highlighter')).toHaveText('Início');

    await sidebar.getByRole('link', { name: 'Projetos' }).click();

    await expect(sidebar.getByTestId('highlighter')).toHaveText('Projetos');
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeFocused();
  });
});

test.describe('CA-11: com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('os post-its ficam retos', async ({ page }) => {
    await page.goto('/?tema=paper');

    await expect(firstCard(page)).toHaveCSS('background-color', 'rgb(255, 241, 161)');
    await expect(firstCard(page)).toHaveCSS('rotate', 'none');
  });
});
