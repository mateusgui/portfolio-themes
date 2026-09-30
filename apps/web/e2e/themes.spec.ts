import { expect, test, type Page } from '@playwright/test';

/** Registra, desde antes do primeiro script da página, cada valor que `data-theme` assume. */
async function recordThemes(page: Page) {
  await page.addInitScript(() => {
    const log: string[] = [];
    Object.assign(window, { themeLog: log });
    new MutationObserver((mutations) => {
      for (const { target } of mutations) {
        if (target === document.documentElement) {
          log.push(document.documentElement.dataset.theme ?? '');
        }
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-theme'] });
  });
  return () => page.evaluate(() => (window as unknown as { themeLog: string[] }).themeLog);
}

const html = (page: Page) => page.locator('html');

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'botões de tema só no desktop');

  test('CA-01: do Hacker para o Papel, sem recarregar e na mesma seção', async ({ page }) => {
    await page.goto('/?tema=hacker#projetos');
    await expect(html(page)).toHaveAttribute('data-theme', 'hacker');
    const projetos = page.getByRole('complementary').getByRole('link', { name: 'Projetos' });
    await expect(projetos).toHaveAttribute('aria-current', 'location');
    await page.evaluate(() => {
      Object.assign(window, { sameDocument: true });
    });

    await page.getByRole('button', { name: 'Papel' }).click();

    await expect(html(page)).toHaveAttribute('data-theme', 'paper');
    await expect(page.getByRole('button', { name: 'Papel' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Hacker' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(projetos).toHaveAttribute('aria-current', 'location');
    expect(await page.evaluate(() => 'sameDocument' in window)).toBe(true);
    // A altura das seções muda com a fonte do tema; o que se mantém é a seção atual.
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeInViewport();
  });

  test('CA-02: VS Code escolhido abre já no VS Code após recarregar, sem piscar', async ({
    page,
  }) => {
    const themeLog = await recordThemes(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'VS Code' }).click();
    await expect(html(page)).toHaveAttribute('data-theme', 'vscode');

    await page.reload();

    await expect(page.getByRole('button', { name: 'VS Code' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await themeLog()).toEqual(['vscode']);
  });
});

test.describe('primeira visita', () => {
  test.describe('com o sistema em modo escuro', () => {
    test.use({ colorScheme: 'dark' });

    test('abre no VS Code', async ({ page }) => {
      const themeLog = await recordThemes(page);
      await page.goto('/');

      await expect(html(page)).toHaveAttribute('data-theme', 'vscode');
      expect(await themeLog()).toEqual(['vscode']);
    });
  });

  test.describe('com o sistema em modo claro', () => {
    test.use({ colorScheme: 'light' });

    test('abre no Minimalista', async ({ page }) => {
      await page.goto('/');

      await expect(html(page)).toHaveAttribute('data-theme', 'minimal');
    });
  });
});

test.describe('query string', () => {
  test('?tema= e ?lang= aplicam, salvam e saem da URL', async ({ page }) => {
    await page.goto('/?tema=paper&lang=en&origem=cv#sobre');

    await expect(html(page)).toHaveAttribute('data-theme', 'paper');
    await expect(html(page)).toHaveAttribute('lang', 'en');
    expect(new URL(page.url()).search).toBe('?origem=cv');
    expect(new URL(page.url()).hash).toBe('#sobre');

    await page.reload();

    await expect(html(page)).toHaveAttribute('data-theme', 'paper');
    await expect(html(page)).toHaveAttribute('lang', 'en');
  });

  test('valores inválidos são ignorados e também saem da URL', async ({ page }) => {
    await page.goto('/?tema=dark&lang=fr');

    await expect(html(page)).toHaveAttribute('data-theme', 'minimal');
    await expect(html(page)).toHaveAttribute('lang', 'pt-BR');
    expect(new URL(page.url()).search).toBe('');
  });

  test('a escolha manual depois do link vence o link', async ({ page, isMobile }) => {
    await page.goto('/?tema=hacker');

    if (isMobile) {
      await page.getByRole('combobox', { name: 'Temas' }).selectOption('retro');
    } else {
      await page.getByRole('button', { name: 'Retrô' }).click();
    }
    await page.reload();

    await expect(html(page)).toHaveAttribute('data-theme', 'retro');
  });
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'seletor compacto só no mobile');

  test('o seletor compacto troca o tema', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('group', { name: 'Temas' })).toBeHidden();

    await page.getByRole('combobox', { name: 'Temas' }).selectOption('vscode');

    await expect(html(page)).toHaveAttribute('data-theme', 'vscode');
  });
});
