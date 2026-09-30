import { expect, test, type Page } from '@playwright/test';

const NAME = 'Mateus Guimarães Moraes Vilela';

async function switchToHacker(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('combobox', { name: 'Temas' }).selectOption('hacker');
  } else {
    await page.getByRole('button', { name: 'Hacker' }).click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hacker');
}

test('trocar para o Hacker aplica o visual de terminal sem recarregar', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.assign(window, { sameDocument: true });
  });

  await switchToHacker(page, isMobile);

  const body = page.locator('body');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(body).toHaveCSS('color', 'rgb(0, 255, 65)');
  await expect(body).toHaveCSS('font-family', /JetBrains Mono/);
  expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);

  // Digitação do nome no Hero: termina com o nome inteiro, que é o nome acessível do h1.
  await expect(page.getByTestId('typed')).toHaveText(`${NAME}█`, { timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible();

  // Chuva de caracteres ligada, com botão para desligar.
  const rain = page.getByRole('button', { name: 'Chuva de caracteres' });
  await expect(page.getByTestId('character-rain')).toBeAttached();
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('character-rain')).not.toBeAttached();
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  test('a sidebar mostra comandos e o cursor acompanha a seção ativa', async ({ page }) => {
    await page.goto('/?tema=hacker');
    const sidebar = page.getByRole('complementary');

    await expect(sidebar.getByRole('link', { name: 'início' })).toHaveText(/^>\s*início\s*█$/);

    await sidebar.getByRole('link', { name: 'projetos' }).click();

    await expect(sidebar.getByRole('link', { name: 'projetos' })).toHaveText(/^>\s*projetos\s*█$/);
    await expect(sidebar.getByTestId('cursor')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeFocused();
  });
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('sem digitação animada e sem chuva', async ({ page }) => {
    await page.goto('/?tema=hacker');

    await expect(page.getByTestId('typed')).toHaveText(`${NAME}█`);
    await expect(page.getByTestId('character-rain')).not.toBeAttached();
    await expect(page.getByRole('button', { name: 'Chuva de caracteres' })).not.toBeAttached();
    await expect(page.getByTestId('typed').locator('span').last()).toHaveCSS(
      'animation-name',
      'none',
    );
  });
});
