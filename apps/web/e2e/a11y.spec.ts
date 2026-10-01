import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const THEMES = ['hacker', 'retro', 'minimal', 'vscode', 'paper'] as const;
const LANGUAGES = ['pt-BR', 'en', 'es'] as const;

// Critérios WCAG 2.2 níveis A e AA.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  // Resumo legível em caso de falha: regra, impacto e os elementos afetados.
  return violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map(({ target }) => target.join(' ')),
  }));
}

async function open(page: Page, theme: string, lang: string) {
  await page.goto(`/?tema=${theme}&lang=${lang}`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  // O app renderiza depois do chunk do tema: audita a página pronta, não a vazia.
  await expect(page.getByRole('main')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

for (const theme of THEMES) {
  for (const lang of LANGUAGES) {
    test(`CA-10: axe sem violações: tema ${theme}, idioma ${lang}`, async ({ page }) => {
      await open(page, theme, lang);

      expect(await audit(page)).toEqual([]);
    });
  }
}

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'drawer só existe no mobile');

  for (const theme of THEMES) {
    test(`axe sem violações com o drawer aberto: tema ${theme}`, async ({ page }) => {
      await open(page, theme, 'pt-BR');
      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      expect(await audit(page)).toEqual([]);
    });
  }
});
