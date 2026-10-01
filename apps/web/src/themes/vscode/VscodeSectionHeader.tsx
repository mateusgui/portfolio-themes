import { ChevronRightIcon } from 'lucide-react';

import type { SectionId } from '../../sections/sections.ts';
import type { SectionHeaderProps } from '../registry.ts';
import { FileIcon } from './FileIcon.tsx';
import { useFileName } from './files.ts';

type Syntax = 'keyword' | 'control' | 'string' | 'comment' | 'type' | 'variable' | 'tag';

/** Trecho de código em volta do título; `null` deixa a cor padrão do texto. */
type Token = readonly [text: string, syntax: Syntax | null];

interface TitleSyntax {
  before: readonly Token[];
  title: Syntax | null;
  after?: readonly Token[];
}

// Cada seção escreve o título como a primeira linha do seu tipo de arquivo.
const TITLE_SYNTAX: Record<SectionId, TitleSyntax> = {
  inicio: { before: [['<h1>', 'tag']], title: null, after: [['</h1>', 'tag']] },
  sobre: { before: [['## ', 'keyword']], title: 'keyword' },
  skills: {
    before: [['"', 'variable']],
    title: 'variable',
    after: [
      ['"', 'variable'],
      [': {', null],
    ],
  },
  projetos: {
    before: [
      ['export ', 'control'],
      ['const ', 'keyword'],
    ],
    title: 'variable',
    after: [[' = [', null]],
  },
  experiencia: {
    before: [
      ['<?php ', 'tag'],
      ['// ', 'comment'],
    ],
    title: 'comment',
  },
  formacao: { before: [['class ', 'keyword']], title: 'type', after: [[':', null]] },
  contato: { before: [['# ', 'comment']], title: 'comment' },
};

function Tokens({ tokens }: { tokens: readonly Token[] }) {
  return tokens.map(([text, syntax]) => (
    <span key={text} data-syntax={syntax ?? undefined} className="whitespace-pre-wrap">
      {text}
    </span>
  ));
}

/**
 * Título como código: breadcrumb do arquivo e a sintaxe da linguagem em volta
 * do título. Tudo o que é código fica fora do nome acessível (`aria-hidden`).
 */
export function VscodeSectionHeader({ id, title }: SectionHeaderProps) {
  const fileName = useFileName(id);
  const { before, title: titleSyntax, after = [] } = TITLE_SYNTAX[id];

  return (
    <>
      <span
        aria-hidden="true"
        data-testid="breadcrumb"
        className="mb-3 flex items-center gap-1 font-body text-xs text-muted"
      >
        portfolio
        <ChevronRightIcon className="size-3" />
        src
        <ChevronRightIcon className="size-3" />
        <FileIcon id={id} />
        {fileName}
      </span>
      <span aria-hidden="true">
        <Tokens tokens={before} />
      </span>
      <span data-syntax={titleSyntax ?? undefined}>{title}</span>
      <span aria-hidden="true">
        <Tokens tokens={after} />
      </span>
    </>
  );
}
