import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a página abre com as 7 seções', async ({ page }) => {
  await expect(page).toHaveTitle(/Mateus Guimarães/);
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveCount(6);
});

test('o skip link é o primeiro foco e leva ao conteúdo', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'layout de desktop');

  test('CA-03: navbar e sidebar ficam fixas ao rolar até o fim', async ({ page }) => {
    const navbar = page.getByRole('banner');
    const sidebar = page.getByRole('complementary');
    await expect(sidebar).toBeVisible();

    const navbarBefore = await navbar.boundingBox();
    const sidebarBefore = await sidebar.boundingBox();

    await page.getByRole('heading', { name: 'Contato' }).scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    expect(await navbar.boundingBox()).toEqual(navbarBefore);
    expect(await sidebar.boundingBox()).toEqual(sidebarBefore);
  });

  test('o título da seção não fica escondido atrás da navbar', async ({ page }) => {
    await page.getByRole('complementary').getByRole('link', { name: 'Projetos' }).click();

    const navbarBox = await page.getByRole('banner').boundingBox();
    const headingBox = await page.getByRole('heading', { name: 'Projetos' }).boundingBox();
    expect(headingBox?.y).toBeGreaterThanOrEqual((navbarBox?.y ?? 0) + (navbarBox?.height ?? 0));
  });
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'drawer só existe no mobile');

  test('a sidebar fixa some e o menu abre como drawer', async ({ page }) => {
    await expect(page.getByRole('complementary')).toBeHidden();

    await page.getByRole('button', { name: 'Abrir menu' }).click();

    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('navigation', { name: 'Seções' })).toBeVisible();
  });

  test('Esc fecha o drawer e devolve o foco ao botão de menu', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: 'Abrir menu' });
    await menuButton.click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('o foco fica preso no drawer', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });

    // 11 focáveis no drawer (fechar + 7 seções + 3 externos): 15 Tabs dão a volta.
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press(key);
        const focusInsideDrawer = await page.evaluate(
          () => document.activeElement?.closest('dialog') != null,
        );
        expect(focusInsideDrawer, `${key} nº ${String(i + 1)}`).toBe(true);
      }
    }
    await expect(drawer).toBeVisible();
  });

  test('clicar numa seção fecha o drawer e navega', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir menu' }).click();

    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: 'Projetos' })
      .click();

    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    await expect(page).toHaveURL(/#projetos$/);
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeInViewport();
  });

  test('clicar fora do painel fecha o drawer', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

    const viewport = page.viewportSize();
    await page.mouse.click((viewport?.width ?? 400) - 10, (viewport?.height ?? 800) / 2);

    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
  });
});
