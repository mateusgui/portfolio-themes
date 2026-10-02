import { expect, test, type Page } from '@playwright/test';

async function switchToRetro(page: Page) {
  await page.getByRole('button', { name: 'Retrô' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'retro');
}

test('trocar para o Retrô aplica o visual anos 90 sem recarregar', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.assign(window, { sameDocument: true });
  });

  await switchToRetro(page);

  const html = page.locator('html');
  await expect(html).toHaveCSS('background-color', 'rgb(0, 160, 160)');
  await expect(html).toHaveCSS('background-image', /data:image\/svg\+xml/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Verdana/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /Times/);
  expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);

  // Seção como janela: painel cinza em relevo, título como barra azul.
  const about = page.getByRole('heading', { level: 2, name: 'Sobre' });
  await expect(about).toHaveCSS('background-image', /linear-gradient/);
  await expect(about).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(about).toHaveCSS('font-family', /Comic Sans/);
  await expect(about.locator('xpath=..')).toHaveCSS('background-color', 'rgb(192, 192, 192)');
  await expect(about.locator('xpath=..')).toHaveCSS('box-shadow', /inset/);

  // Letreiro rolando, com botão de pausa.
  await expect(page.getByTestId('marquee')).toHaveCSS('animation-name', 'marquee');
  const pause = page.getByRole('button', { name: 'Pausar letreiro' });
  await pause.click();
  await expect(page.getByTestId('marquee')).toHaveCSS('animation-play-state', 'paused');
});

test('o conteúdo não fica escondido atrás da barra do rodapé', async ({ page }) => {
  await page.goto('/?tema=retro');
  await expect(page.getByTestId('retro-bar')).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  const bar = await page.getByTestId('retro-bar').boundingBox();
  const lastLink = await page
    .getByRole('region', { name: 'Contato' })
    .getByRole('link')
    .last()
    .boundingBox();
  expect(bar && lastLink && lastLink.y + lastLink.height <= bar.y).toBe(true);
});

test('o contador é falso: soma 1 a cada visita, sem requisição', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  // O contador conta quando a barra aparece (depois do chunk do tema).
  await page.goto('/?tema=retro');
  await expect(page.getByTestId('visitor-counter')).toBeAttached();
  const first = Number(await page.evaluate(() => localStorage.getItem('portfolio:retro-visits')));
  await page.reload();
  await expect(page.getByTestId('visitor-counter')).toBeAttached();
  const second = Number(await page.evaluate(() => localStorage.getItem('portfolio:retro-visits')));

  expect(second).toBe(first + 1);
  expect(requests.every((url) => new URL(url).host === new URL(page.url()).host)).toBe(true);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  test('a sidebar tem botões bevel e o ativo afunda', async ({ page }) => {
    await page.goto('/?tema=retro');
    const sidebar = page.getByRole('complementary');
    const projects = sidebar.getByRole('link', { name: 'Projetos' });

    await expect(projects).toHaveCSS('color', 'rgb(0, 0, 238)');
    await expect(projects.locator('span.underline')).toHaveCSS('text-decoration-line', 'underline');

    await projects.click();

    await expect(projects).toHaveAttribute('aria-current', 'location');
    await expect(projects).toHaveCSS('color', 'rgb(85, 26, 139)');
    await expect(projects).toHaveCSS('background-color', 'rgb(255, 255, 0)');
    await expect(sidebar.getByTestId('retro-pointer')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeFocused();
  });
});

test.describe('CA-11: com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('o letreiro fica parado e nada pisca', async ({ page }) => {
    await page.goto('/?tema=retro');

    await expect(page.getByTestId('marquee')).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('button', { name: 'Pausar letreiro' })).not.toBeAttached();
    for (const sparkle of await page.getByTestId('sparkle').all()) {
      await expect(sparkle).toHaveCSS('animation-name', 'none');
    }
  });
});
