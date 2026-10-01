import { PauseIcon, PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

/** Contador de visitantes FALSO: um número local, sem API, que soma 1 a cada visita. */
export const VISITS_STORAGE_KEY = 'portfolio:retro-visits';

function nextVisits() {
  try {
    const saved = Number(localStorage.getItem(VISITS_STORAGE_KEY));
    if (Number.isInteger(saved) && saved > 0) return saved + 1;
  } catch {
    // Sem armazenamento, cada visita sorteia um número novo.
  }
  return 1000 + Math.floor(Math.random() * 9000);
}

function VisitorCounter() {
  const { t } = useTranslation();
  const [visits] = useState(nextVisits);

  useEffect(() => {
    try {
      localStorage.setItem(VISITS_STORAGE_KEY, String(visits));
    } catch {
      // Sem armazenamento, o número vale só para esta visita.
    }
  }, [visits]);

  // Puramente decorativo: o número é inventado, então fica fora dos leitores de tela.
  return (
    <div
      aria-hidden="true"
      data-testid="visitor-counter"
      className="hidden items-center gap-2 md:flex"
    >
      <span>{t('retro.visitors')}:</span>
      <span className="flex gap-px bg-border p-px">
        {String(visits)
          .padStart(6, '0')
          .slice(-6)
          .split('')
          .map((digit, index) => (
            <span key={index} className="bg-fg px-1 font-mono font-bold text-surface-alt">
              {digit}
            </span>
          ))}
      </span>
    </div>
  );
}

function UnderConstruction() {
  const { t } = useTranslation();

  return (
    <div
      aria-hidden="true"
      data-testid="under-construction"
      className="hidden shrink-0 items-center gap-2 sm:flex"
    >
      <svg viewBox="0 0 24 24" className="size-6 motion-safe:animate-blink">
        <path
          d="M12 1 L23 12 L12 23 L1 12 Z"
          className="fill-surface-alt stroke-fg"
          strokeWidth="1.5"
        />
        <path d="M12 6 V14 M12 17 V18.5" className="stroke-fg" strokeWidth="2.5" />
      </svg>
      <span className="font-heading font-bold">{t('retro.construction')}</span>
      <span data-retro="stripes" className="h-3 w-10 border border-fg" />
    </div>
  );
}

function Marquee() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const text = t('retro.marquee');

  return (
    <>
      {/* Saudação decorativa, como o selo e o contador: fica fora dos leitores de tela. */}
      <div
        aria-hidden="true"
        className="min-w-0 flex-1 overflow-hidden bg-fg py-1 font-mono font-bold whitespace-nowrap text-surface-alt shadow-theme"
      >
        <div
          data-testid="marquee"
          className="flex w-max motion-safe:animate-marquee"
          // Inline: o shorthand de `animate-marquee` sobrescreveria uma classe.
          style={paused ? { animationPlayState: 'paused' } : undefined}
        >
          <span className="px-4">★ {text}</span>
          {/* Cópia para o laço contínuo; parada, não precisa existir. */}
          {!reducedMotion && <span className="px-4">★ {text}</span>}
        </div>
      </div>

      {/* Com movimento reduzido o letreiro já está parado: sem botão. */}
      {!reducedMotion && (
        <button
          type="button"
          aria-label={t('retro.pauseMarquee')}
          aria-pressed={paused}
          onClick={() => {
            setPaused(!paused);
          }}
          className="grid size-8 shrink-0 place-items-center bg-surface shadow-theme hover:bg-surface-alt"
        >
          {paused ? (
            <PlayIcon aria-hidden="true" className="size-4" />
          ) : (
            <PauseIcon aria-hidden="true" className="size-4" />
          )}
        </button>
      )}
    </>
  );
}

/** Decoração do Retrô: barra no rodapé com selo, letreiro e contador de visitas. */
export function RetroBar() {
  return (
    <div
      data-testid="retro-bar"
      className="fixed inset-x-0 bottom-0 z-20 flex h-(--retro-bar-height) items-center gap-3 border-t border-border bg-surface px-2 text-sm shadow-theme lg:left-(--sidebar-width)"
    >
      <UnderConstruction />
      <Marquee />
      <VisitorCounter />
    </div>
  );
}
