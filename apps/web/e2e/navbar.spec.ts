import { expect, test, type Locator, type Page } from '@playwright/test';

const THEMES = ['hacker', 'retro', 'minimal', 'vscode', 'paper'] as const;
const NAME = 'Mateus Guimarães Moraes Vilela';

async function open(page: Page, theme: string) {
  await page.goto(`/?tema=${theme}`);
  await page.getByRole('main').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('elemento sem caixa');
  return result;
}

const brand = (page: Page) => page.getByRole('banner').getByRole('link', { name: `${NAME},` });
const themes = (page: Page) => page.getByRole('group', { name: 'Temas' });
const language = (page: Page) => page.getByRole('combobox', { name: 'Idioma' });

/** A barra cabe na tela: nada estoura, nada se sobrepõe e a página não rola para o lado. */
async function expectNavbarFits(page: Page) {
  const viewport = page.viewportSize();
  const header = await box(page.getByRole('banner'));
  const items = [await box(brand(page)), await box(themes(page)), await box(language(page))];

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport?.width);
  expect(header.width).toBe(viewport?.width);
  // Da esquerda para a direita, cada peça termina antes de a próxima começar.
  let previousEnd = 0;
  for (const item of items) {
    expect(item.x).toBeGreaterThanOrEqual(previousEnd);
    previousEnd = item.x + item.width;
  }
  expect(previousEnd).toBeLessThanOrEqual(header.width);
  // Nenhum botão de tema cortado pelo grupo.
  for (const button of await themes(page).getByRole('button').all()) {
    const { x, width } = await box(button);
    const group = await box(themes(page));
    expect(x).toBeGreaterThanOrEqual(group.x);
    expect(x + width).toBeLessThanOrEqual(group.x + group.width + 0.5);
  }
}

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'layout de desktop');
  test.use({ viewport: { width: 1366, height: 768 } });

  for (const theme of THEMES) {
    test(`${theme}: nome à esquerda, temas no centro e idioma à direita`, async ({ page }) => {
      await open(page, theme);
      const group = await box(themes(page));

      await expect(brand(page).getByText('MG', { exact: true })).toBeVisible();
      await expect(brand(page).getByText(NAME)).toBeVisible();
      // O nome inteiro cabe numa linha, sem reticências.
      expect(
        await brand(page)
          .getByText(NAME)
          .evaluate((name) => name.scrollWidth <= name.clientWidth),
      ).toBe(true);
      // Centralizados de verdade: o meio do grupo é o meio da tela.
      expect(Math.abs(group.x + group.width / 2 - 1366 / 2)).toBeLessThanOrEqual(1);
      for (const label of ['Hacker', 'Retrô', 'Minimalista', 'VS Code', 'Papel']) {
        const button = themes(page).getByRole('button', { name: label });
        await expect(button.getByText(label)).toBeVisible();
        await expect(button.locator('svg').last()).toBeVisible();
      }
      await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeHidden();
      await expectNavbarFits(page);
    });

    test(`${theme}: a sidebar começa na navegação, sem nome nem foto`, async ({ page }) => {
      await open(page, theme);
      const sidebar = page.getByRole('complementary');

      await expect(sidebar.getByRole('navigation').first()).toBeVisible();
      await expect(sidebar.getByText(/Mateus/)).toHaveCount(0);
      await expect(sidebar.getByText('Desenvolvedor Full Stack')).toHaveCount(0);
      await expect(sidebar.getByRole('img')).toHaveCount(0);
      await expect(sidebar.getByRole('link', { name: /Currículo/ })).toBeVisible();
    });

    test(`${theme}: a foto fica à direita do nome, com a imagem do tema`, async ({ page }) => {
      await open(page, theme);
      const photo = page.getByRole('main').getByRole('img', { name: /Mateus/ });
      const photoBox = await box(photo);
      const heading = await box(page.getByRole('heading', { level: 1 }));

      await expect(photo).toHaveJSProperty('complete', true);
      expect(await photo.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(
        `avatar-${theme}-`,
      );
      expect(photoBox.x).toBeGreaterThanOrEqual(heading.x + heading.width);
      expect(photoBox.width).toBeGreaterThanOrEqual(280);
      expect(photoBox.width).toBeLessThanOrEqual(320);
      expect(photoBox.height / photoBox.width).toBeCloseTo(4 / 3, 1);
    });
  }

  test('o link do nome volta ao início', async ({ page }) => {
    await open(page, 'minimal');
    await page.getByRole('complementary').getByRole('link', { name: 'Contato' }).click();
    await expect(page).toHaveURL(/#contato$/);

    await brand(page).click();

    await expect(page).toHaveURL(/#inicio$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('só a foto do tema ativo é pedida com prioridade; as outras, no ocioso', async ({
    page,
  }) => {
    const requested: string[] = [];
    page.on('request', (request) => {
      const match = /avatar-([a-z]+)-\d+/.exec(request.url());
      if (match?.[1]) requested.push(match[1]);
    });

    await open(page, 'hacker');
    const photo = page.getByRole('main').getByRole('img', { name: /Mateus/ });

    await expect(photo).toHaveAttribute('fetchpriority', 'high');
    await expect(photo).not.toHaveAttribute('loading');
    expect(requested[0]).toBe('hacker');
    await expect
      .poll(() => [...new Set(requested)].sort(), { timeout: 10_000 })
      .toEqual([...THEMES].sort());
  });

  test('trocar de tema troca a foto sem mudar o espaço reservado', async ({ page }) => {
    await open(page, 'minimal');
    const frame = page.locator('[data-hero-photo]');
    const before = await box(frame);

    for (const [label, theme] of [
      ['Hacker', 'hacker'],
      ['VS Code', 'vscode'],
    ] as const) {
      await page.getByRole('button', { name: label }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect
        .poll(() => frame.locator('img').evaluate((image: HTMLImageElement) => image.currentSrc))
        .toContain(`avatar-${theme}-`);
      const after = await box(frame);
      expect([after.width, after.height]).toEqual([before.width, before.height]);
    }
  });
});

test.describe('celular de 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const theme of THEMES) {
    test(`${theme}: a navbar cabe, só com ícones, sem rolagem horizontal`, async ({ page }) => {
      await open(page, theme);

      await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
      await expect(brand(page).getByText('MG', { exact: true })).toBeVisible();
      await expect(brand(page).getByText(NAME)).toBeHidden();
      await expect(themes(page).getByRole('button')).toHaveCount(5);
      await expect(
        themes(page).getByRole('button', { name: 'Papel' }).getByText('Papel'),
      ).toBeHidden();
      // O idioma vira código para caber.
      await expect(language(page).getByRole('option', { selected: true })).toHaveText('PT');
      await expectNavbarFits(page);
    });

    test(`${theme}: a foto fica acima do nome, centralizada`, async ({ page }) => {
      await open(page, theme);
      const frame = await box(page.locator('[data-hero-photo]'));
      const heading = await box(page.getByRole('heading', { level: 1 }));
      const container = await box(page.locator('#inicio > div'));

      expect(frame.y + frame.height).toBeLessThanOrEqual(heading.y);
      expect(
        Math.abs(frame.x + frame.width / 2 - (container.x + container.width / 2)),
      ).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
    });
  }
});
