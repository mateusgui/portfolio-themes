/**
 * Converte as fotos originais (uma por tema) nos WebP do Hero, em duas larguras
 * e no formato vertical 3:4. Os originais ficam fora do repositório; só os WebP
 * gerados em `src/assets/avatars/` são versionados. O build não roda este
 * script: rode à mão quando uma foto mudar, passando a pasta dos originais:
 *
 *   npm run avatars -- "C:\caminho\para\as fotos"
 *
 * A pasta precisa ter um arquivo por tema, com estes nomes (qualquer extensão
 * de imagem): hacker, retro, minimalista, vscode e papel.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import type { ThemeId } from '../src/themes/registry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/assets/avatars');

/** Nome do arquivo original de cada tema (os originais estão nomeados em português). */
const SOURCE_NAMES: Record<ThemeId, string> = {
  hacker: 'hacker',
  retro: 'retro',
  minimal: 'minimalista',
  vscode: 'vscode',
  paper: 'papel',
};

const WIDTHS = [480, 960];
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const sourceDir = process.argv[2] ?? process.env.AVATARS_SRC;
if (!sourceDir) {
  console.error('Informe a pasta dos originais: npm run avatars -- "<pasta>"');
  process.exit(1);
}

const files = readdirSync(sourceDir);

function findSource(name: string) {
  const file = files.find(
    (candidate) =>
      parse(candidate).name.toLowerCase() === name &&
      EXTENSIONS.includes(extname(candidate).toLowerCase()),
  );
  if (!file) throw new Error(`Foto "${name}" não encontrada em ${sourceDir}`);
  return join(sourceDir, file);
}

mkdirSync(outDir, { recursive: true });

for (const [theme, name] of Object.entries(SOURCE_NAMES)) {
  const source = findSource(name);
  for (const width of WIDTHS) {
    const path = join(outDir, `avatar-${theme}-${String(width)}.webp`);
    // `rotate()` aplica a orientação do EXIF; os metadados (EXIF, GPS) não são copiados.
    await sharp(source)
      .rotate()
      .resize({ width, height: (width * 4) / 3, fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(path);
    console.log(`✓ ${path} (${String(Math.round(statSync(path).size / 1024))} kB)`);
  }
}
