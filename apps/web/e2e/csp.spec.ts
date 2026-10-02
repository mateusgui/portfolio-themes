import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

/**
 * O preview do Vite não aplica o `_headers` (quem aplica é a Cloudflare). Aqui a
 * CSP gerada no build é injetada nas respostas HTML, para garantir que ela não
 * bloqueia nada do próprio site.
 */
const headersPath = join(dirname(fileURLToPath(import.meta.url)), '../dist/_headers');

/** Lida no teste, não no carregamento: o `dist` só existe depois do build do webServer. */
function builtCsp() {
  return /Content-Security-Policy: (.+)/.exec(readFileSync(headersPath, 'utf-8'))?.[1];
}

for (const path of ['/', '/en/']) {
  for (const theme of ['hacker', 'retro', 'minimal', 'vscode', 'paper']) {
    test(`a CSP não bloqueia nada: ${path}, tema ${theme}`, async ({ page }) => {
      const csp = builtCsp();
      expect(csp).toBeTruthy();
      await page.route('**/*', async (route) => {
        const response = await route.fetch();
        const isHtml = response
          .headersArray()
          .some(
            ({ name, value }) =>
              name.toLowerCase() === 'content-type' && value.includes('text/html'),
          );
        await route.fulfill({
          response,
          headers: isHtml
            ? { ...response.headers(), 'content-security-policy': csp ?? '' }
            : response.headers(),
        });
      });
      const violations: string[] = [];
      await page.exposeFunction('reportViolation', (directive: string) => {
        violations.push(directive);
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          void (
            window as unknown as { reportViolation: (d: string) => Promise<void> }
          ).reportViolation(`${event.violatedDirective} ${event.blockedURI}`);
        });
      });

      await page.goto(`${path}?tema=${theme}`);
      await page.getByRole('main').waitFor();
      // Troca de tema baixa outro chunk; troca de idioma re-renderiza tudo.
      await page
        .getByRole('group')
        .getByRole('button')
        .nth(theme === 'retro' ? 0 : 1)
        .click();
      await expect(page.locator('html')).not.toHaveAttribute('data-theme', theme);
      // A foto do novo tema também precisa passar pela CSP.
      await expect
        .poll(() =>
          page
            .getByRole('main')
            .getByRole('img')
            .first()
            .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
        )
        .toBe(true);
      await page.locator('header select').last().selectOption('es');
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');

      expect(violations).toEqual([]);
    });
  }
}
