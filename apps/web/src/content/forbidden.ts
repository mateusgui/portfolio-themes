/**
 * O que nunca pode aparecer no site nem nos currículos: a experiência e o projeto
 * excluídos, e qualquer forma de telefone.
 */
const FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /s[óo]\s*c[óo]pias/i,
  /hora\s*do\s*lixo/i,
  /\btel:/i,
  /whatsapp|wa\.me/i,
  // Telefone brasileiro: (67) 99999-9999, 67 9999-9999, 67999999999...
  /\(?\b\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}\b/,
];

/** Padrões proibidos encontrados no texto (lista vazia quando está tudo certo). */
export function findForbidden(text: string): string[] {
  return FORBIDDEN_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
}
