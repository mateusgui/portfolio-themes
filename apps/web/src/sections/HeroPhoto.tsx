import { useTranslation } from 'react-i18next';

import { AVATAR_SIZES } from '../themes/avatars.ts';
import { getTheme } from '../themes/registry.ts';
import { useTheme } from '../themes/useTheme.ts';

/**
 * Foto do Hero: a do tema atual, vinda do registro de temas. A moldura (raio,
 * borda, sombra) usa os tokens do tema. Carrega com prioridade; as dos outros
 * temas são pré-carregadas pelo `ThemeProvider` com o navegador ocioso.
 */
export function HeroPhoto() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { avatar } = getTheme(theme);

  return (
    <div
      data-hero-photo=""
      className="rounded-theme border border-border bg-surface p-1 shadow-theme"
    >
      {/* As classes de largura precisam bater com `AVATAR_SIZES`. */}
      <img
        src={avatar.src}
        srcSet={avatar.srcSet}
        sizes={AVATAR_SIZES}
        width={avatar.width}
        height={avatar.height}
        alt={t(`hero.photoAlt.${theme}`)}
        fetchPriority="high"
        className="block aspect-3/4 h-auto w-52 rounded-theme object-cover md:w-64 xl:w-72"
      />
    </div>
  );
}
