import { expect, test } from '@playwright/test';

test.describe('CA-07: idioma inicial pelo navegador, sem escolha salva', () => {
  for (const [locale, lang, skipLink] of [
    ['pt-BR', 'pt-BR', 'Pular para o conteúdo'],
    ['es-AR', 'es', 'Saltar al contenido'],
    ['fr-FR', 'en', 'Skip to content'],
    ['pt-PT', 'pt-BR', 'Pular para o conteúdo'],
  ] as const) {
    test.describe(`navegador em ${locale}`, () => {
      test.use({ locale });

      test(`abre em ${lang}`, async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.getByRole('link', { name: skipLink })).toBeAttached();
        await expect(page.getByRole('combobox')).toHaveValue(lang);
      });
    });
  }
});

test('CA-08: a escolha manual vence o navegador e sobrevive ao reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
  await expect(page.getByRole('main').getByRole('heading', { name: 'Projects' })).toBeAttached();
});

test('trocar o idioma atualiza título e meta description', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('es');

  await expect(page).toHaveTitle('Mateus Guimarães | Desarrollador Full Stack');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /^Portafolio de Mateus Guimarães/,
  );
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  test('trocar o idioma não recarrega a página nem muda a seção atual', async ({ page }) => {
    await page.goto('/#projetos');
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    await page.evaluate(() => {
      Object.assign(window, { sameDocument: true });
    });
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await page.getByRole('combobox', { name: 'Idioma' }).selectOption('en');

    await expect(sidebar.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    await expect(page).toHaveURL(/#projetos$/);
  });
});
