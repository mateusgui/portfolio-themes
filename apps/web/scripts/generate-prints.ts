/**
 * Converte os prints originais dos projetos nos WebP servidos nos cards. Os
 * originais ficam em `src/assets/projetos/` e **não** são versionados (como os
 * avatares); só os WebP de `public/projetos/` entram no git. O build não roda
 * este script: rode à mão quando um print mudar.
 *
 *   npm run prints
 *
 * A pasta dos originais precisa ter um arquivo por projeto, com estes nomes
 * (qualquer extensão de imagem): "MVP Flask", "Projeto INDEX", "Protocol Tracker"
 * e "CRM".
 * O print deste portfólio não sai daqui: vem de `npm run screenshots`.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/projetos');

/** Nome do arquivo original de cada projeto (o id vira o nome do WebP). */
const SOURCE_NAMES: Record<string, string> = {
  noc: 'mvp flask',
  index: 'projeto index',
  'protocol-tracker': 'protocol tracker',
  crm: 'crm',
};

/** Largura servida no card: o dobro do espaço real (~390 px) em telas retina. */
const WIDTH = 960;
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const sourceDir = process.argv[2] ?? join(root, 'src/assets/projetos');
const files = readdirSync(sourceDir);

function findSource(name: string) {
  const file = files.find(
    (candidate) =>
      parse(candidate).name.toLowerCase() === name &&
      EXTENSIONS.includes(extname(candidate).toLowerCase()),
  );
  if (!file) throw new Error(`Print "${name}" não encontrado em ${sourceDir}`);
  return join(sourceDir, file);
}

mkdirSync(outDir, { recursive: true });

for (const [id, name] of Object.entries(SOURCE_NAMES)) {
  const path = join(outDir, `${id}.webp`);
  // `rotate()` aplica a orientação do EXIF; os metadados (EXIF, GPS) não são copiados.
  const { height } = await sharp(findSource(name))
    .rotate()
    .resize({ width: WIDTH })
    .webp({ quality: 80 })
    .toFile(path);
  const size = Math.round(statSync(path).size / 1024);
  console.log(`✓ ${path} (${String(WIDTH)}×${String(height)}, ${String(size)} kB)`);
}
