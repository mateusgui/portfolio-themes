import { expect, test, type Page } from '@playwright/test';

async function switchToVscode(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('combobox', { name: 'Temas' }).selectOption('vscode');
  } else {
    await page.getByRole('button', { name: 'VS Code' }).click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vscode');
}

test('trocar para o VS Code aplica o visual de editor sem recarregar', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.assign(window, { sameDocument: true });
  });

  await switchToVscode(page, isMobile);

  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(30, 30, 30)');
  await expect(page.locator('body')).toHaveCSS('font-family', /JetBrains Mono/);
  await expect(page.getByTestId('status-bar')).toHaveCSS('background-color', 'rgb(0, 101, 169)');
  expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);

  // Título como código, com o nome acessível intacto.
  const projects = page.getByRole('heading', { level: 2, name: 'Projetos' });
  await expect(projects).toContainText('export const Projetos = [');

  // Números de linha decorativos na margem de cada seção.
  const gutter = await page
    .getByRole('region', { name: 'Sobre' })
    .evaluate((section) => getComputedStyle(section, '::before').content);
  // `\a` é a quebra de linha; o `/ ""` final tira os números dos leitores de tela.
  expect(gutter).toMatch(/^"1\\a 2\\a 3\\a .*400" \/ ""$/);
});

test('contato.env mostra CHAVE=valor só com dados públicos', async ({ page }) => {
  await page.goto('/?tema=vscode');
  const contact = page.getByRole('region', { name: 'Contato' });

  const keys = await contact
    .locator('[data-env-key]')
    .evaluateAll((items) => items.map((item) => getComputedStyle(item, '::before').content));
  // A chave é só visual (`/ ""`): o leitor de tela continua lendo "E-mail: ...".
  expect(keys).toEqual(['"EMAIL=" / ""', '"LINKEDIN=" / ""', '"GITHUB=" / ""']);
  await expect(contact.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
});

test('trocar o idioma renomeia os arquivos', async ({ page }) => {
  await page.goto('/?tema=vscode&lang=en');

  await expect(page.getByRole('heading', { level: 2, name: 'About' })).toContainText('about.md');
  await expect(page.getByTestId('status-bar')).toContainText('English');
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Explorer fixo só no desktop');

  test('o Explorer navega e a aba acompanha a seção', async ({ page }) => {
    await page.goto('/?tema=vscode');
    const explorer = page.getByRole('navigation', { name: 'Seções' });

    await expect(page.getByTestId('active-tab')).toHaveText(/index\.jsx/);
    await explorer.getByRole('link', { name: 'experiencia.php' }).click();

    await expect(explorer.getByRole('link', { name: 'experiencia.php' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(page.getByRole('heading', { name: 'Experiência' })).toBeFocused();
    await expect(page.getByTestId('active-tab')).toHaveText(/experiencia\.php/);
    await expect(page.getByRole('navigation', { name: 'Arquivos abertos' })).toBeHidden();

    // O título não fica atrás da barra de abas.
    const tabs = await page.locator('[data-vscode="tabs"]').boundingBox();
    const heading = await page.getByRole('heading', { name: 'Experiência' }).boundingBox();
    expect(tabs && heading && heading.y >= tabs.y + tabs.height).toBe(true);
  });

  test('a rolagem manual também troca a aba', async ({ page }) => {
    await page.goto('/?tema=vscode');

    await page.getByRole('region', { name: 'Skills' }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);

    await expect(page.getByTestId('active-tab')).toHaveText(/skills\.json/);
  });
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'abas navegáveis só no mobile');

  test('as abas substituem o Explorer e navegam', async ({ page }) => {
    await page.goto('/?tema=vscode');
    const tabs = page.getByRole('navigation', { name: 'Arquivos abertos' });

    await expect(tabs.getByRole('link')).toHaveCount(7);
    await tabs.getByRole('link', { name: 'contato.env' }).click();

    await expect(tabs.getByRole('link', { name: 'contato.env' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(tabs.getByRole('link', { name: 'contato.env' })).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Contato' })).toBeFocused();
  });

  test('sem rolagem horizontal da página', async ({ page }) => {
    await page.goto('/?tema=vscode');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
