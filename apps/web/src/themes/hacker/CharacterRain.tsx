import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

/** Preferência salva: a chuva começa ligada e o usuário pode desligar. */
export const RAIN_STORAGE_KEY = 'portfolio:hacker-rain';

const CHARACTERS = 'アカサタナハマヤラワ0123456789ABCDEF<>/{}[]=+*';
const FONT_SIZE = 16;
const FRAME_INTERVAL = 50;

function readEnabled() {
  try {
    return localStorage.getItem(RAIN_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function saveEnabled(enabled: boolean) {
  try {
    localStorage.setItem(RAIN_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
}

/** Canvas com a chuva; a cor vem do token `--theme-accent`. */
function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let drops: number[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / FONT_SIZE) }, () =>
        Math.floor((Math.random() * canvas.height) / FONT_SIZE),
      );
    };
    resize();
    window.addEventListener('resize', resize);

    const styles = getComputedStyle(document.documentElement);
    const color = styles.getPropertyValue('--theme-accent').trim();
    const background = styles.getPropertyValue('--theme-bg').trim();

    let frame = 0;
    let last = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < FRAME_INTERVAL || document.hidden) return;
      last = time;

      // Rastro: cobre o quadro anterior com o fundo quase transparente.
      context.globalAlpha = 0.1;
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      context.fillStyle = color;
      context.font = `${String(FONT_SIZE)}px monospace`;

      drops = drops.map((row, column) => {
        const char = CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
        context.fillText(char, column * FONT_SIZE, row * FONT_SIZE);
        const reset = row * FONT_SIZE > canvas.height && Math.random() > 0.975;
        return reset ? 0 : row + 1;
      });
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="character-rain"
      className="pointer-events-none fixed inset-0 -z-10 opacity-20"
    />
  );
}

/** Decoração do tema Hacker: chuva de caracteres no fundo, desligável. */
export function CharacterRain() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(readEnabled);

  // Com movimento reduzido não há chuva, nem o botão para controlá-la.
  if (reducedMotion) return null;

  return (
    <>
      {enabled && <RainCanvas />}
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => {
          setEnabled(!enabled);
          saveEnabled(!enabled);
        }}
        className="fixed right-4 bottom-4 z-20 rounded-theme border border-border bg-surface px-3 py-1.5 font-mono text-sm shadow-theme hover:bg-surface-alt aria-pressed:text-accent"
      >
        {t('hacker.rain')}
      </button>
    </>
  );
}
