import { expect, test, type Page } from '@playwright/test';

const THEMES = ['hacker', 'retro', 'minimal', 'vscode', 'paper'] as const;

/** Onde o elemento focado está, na ordem esperada de foco. */
const REGION_ORDER = ['skip', 'header', 'decoration', 'aside', 'main'] as const;

interface FocusStop {
  html: string;
  /** O foco já passou por este elemento (a volta completa terminou). */
  repeated: boolean;
  region: (typeof REGION_ORDER)[number];
  outlineStyle: string;
  outlineWidth: number;
  /** Algum ponto do elemento está visível e não coberto por barras fixas. */
  reachable: boolean;
}

async function focusStop(page: Page): Promise<FocusStop | null> {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement) || element === document.body) return null;

    const visited = ((window as { visited?: WeakSet<Element> }).visited ??= new WeakSet());
    const repeated = visited.has(element);
    visited.add(element);

    const region = element.matches('a[href="#conteudo"]')
      ? 'skip'
      : element.closest('header')
        ? 'header'
        : element.closest('aside, dialog')
          ? 'aside'
          : element.closest('main')
            ? 'main'
            : 'decoration';

    // Procura um ponto do elemento que não esteja atrás de navbar, abas ou barras fixas.
    const box = element.getBoundingClientRect();
    const points = [0.5, 0.2, 0.8].flatMap((x) =>
      [0.5, 0.2, 0.8].map((y) => [box.left + box.width * x, box.top + box.height * y] as const),
    );
    const reachable = points.some(([x, y]) => {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
      const top = document.elementFromPoint(x, y);
      return top !== null && (element === top || element.contains(top) || top.contains(element));
    });

    const style = getComputedStyle(element);
    return {
      html: `${element.outerHTML.slice(0, 60)}… "${element.textContent.trim().slice(0, 40)}"`,
      repeated,
      region,
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
      reachable,
    };
  });
}

/** Aperta Tab até o foco sair da página e devolve cada parada. */
async function tabThroughPage(page: Page) {
  const stops: FocusStop[] = [];
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const stop = await focusStop(page);
    if (!stop || stop.repeated) break;
    stops.push(stop);
  }
  return stops;
}

for (const theme of THEMES) {
  test(`${theme}: Tab percorre a página em ordem lógica, com foco visível e à mostra`, async ({
    page,
  }) => {
    await page.goto(`/?tema=${theme}`);
    await page.getByRole('main').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const stops = await tabThroughPage(page);

    // Todas as partes da página são alcançadas, até o último link do Contato.
    expect(stops[0]?.region).toBe('skip');
    expect(stops.some(({ region }) => region === 'header')).toBe(true);
    expect(stops.at(-1)?.html).toContain('github.com');

    // Ordem: skip link, navbar, decoração, sidebar, conteúdo; nunca volta.
    const order = stops.map(({ region }) => REGION_ORDER.indexOf(region));
    expect(order).toEqual([...order].sort((a, b) => a - b));

    for (const stop of stops) {
      expect.soft(stop.outlineStyle, `foco visível em ${stop.html}`).not.toBe('none');
      expect.soft(stop.outlineWidth, `foco visível em ${stop.html}`).toBeGreaterThanOrEqual(2);
      expect.soft(stop.reachable, `foco encoberto em ${stop.html}`).toBe(true);
    }
  });

  test(`${theme}: Shift+Tab volta sem esconder o foco atrás das barras`, async ({ page }) => {
    await page.goto(`/?tema=${theme}#contato`);
    await page.getByRole('main').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.getByRole('region').last().getByRole('link').last().focus();

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Shift+Tab');
      const stop = await focusStop(page);
      if (!stop || stop.region !== 'main') break;
      expect.soft(stop.reachable, `foco encoberto em ${stop.html}`).toBe(true);
    }
  });
}

test.describe('CA-11: com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const theme of THEMES) {
    test(`${theme}: nenhuma animação roda`, async ({ page }) => {
      await page.goto(`/?tema=${theme}`);
      await page.getByRole('main').waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      // Cobre animações e transições CSS (digitação, cursor, letreiro, rotações, ping...).
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          .map((animation) => {
            const target =
              animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
            return `${animation.constructor.name} em ${target?.outerHTML.slice(0, 80) ?? '?'}`;
          }),
      );
      expect(running).toEqual([]);
      await expect(page.locator('canvas')).toHaveCount(0);
    });
  }
});
