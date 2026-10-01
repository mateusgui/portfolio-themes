import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { CharacterRain } from './CharacterRain.tsx';

/** Contexto 2D falso: o jsdom não desenha em canvas. */
function fakeContext() {
  return {
    globalAlpha: 1,
    fillStyle: '',
    font: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
  };
}

let context: ReturnType<typeof fakeContext>;
let getContext: MockInstance<HTMLCanvasElement['getContext']>;
let frames: Map<number, FrameRequestCallback>;

beforeEach(() => {
  context = fakeContext();
  getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  frames = new Map();
  let next = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++next, callback);
    return next;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  document.documentElement.style.setProperty('--theme-accent', '#00ff41');
  document.documentElement.style.setProperty('--theme-bg', '#000000');
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

/** Roda o quadro pendente no instante `time` (ms). */
function runFrame(time: number) {
  const [id, callback] = [...frames.entries()].at(-1) ?? [];
  if (!id || !callback) throw new Error('nenhum quadro pendente');
  frames.delete(id);
  act(() => {
    callback(time);
  });
}

describe('chuva de caracteres (canvas)', () => {
  it('desenha uma coluna de caracteres por largura de letra, com as cores do tema', () => {
    render(<CharacterRain />);

    runFrame(1000);

    const columns = Math.ceil(window.innerWidth / 16);
    expect(context.fillText).toHaveBeenCalledTimes(columns);
    expect(context.fillStyle).toBe('#00ff41');
    // O rastro cobre o quadro anterior com o fundo do tema.
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, window.innerWidth, window.innerHeight);
  });

  it('limita a taxa de quadros e pausa com a aba escondida', () => {
    render(<CharacterRain />);
    runFrame(1000);
    context.fillText.mockClear();

    runFrame(1010); // menos de 50 ms depois: não desenha
    expect(context.fillText).not.toHaveBeenCalled();

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    runFrame(2000);
    expect(context.fillText).not.toHaveBeenCalled();
  });

  it('acompanha o tamanho da janela e limpa tudo ao sair', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { container, unmount } = render(<CharacterRain />);
    const canvas = container.querySelector('canvas');

    window.innerWidth = 320;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(canvas?.width).toBe(320);

    unmount();
    expect(frames.size).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('sem contexto 2D, não quebra', () => {
    getContext.mockReturnValue(null);

    expect(() => render(<CharacterRain />)).not.toThrow();
    expect(frames.size).toBe(0);
  });
});
