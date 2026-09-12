const ALLOWED_TAGS = 'svg|g|path|rect|circle|ellipse|line|polyline|polygon|title|desc';
const DRAWING_TAG = /<\s*(path|circle|ellipse|line|polyline|polygon|rect)\b/i;

const DANGEROUS_ELEMENTS = [
  'script',
  'foreignObject',
  'image',
  'use',
  'iframe',
  'style',
  'animate',
  'animateMotion',
  'animateTransform',
  'set',
  'a',
  'filter',
  'mask',
  'pattern',
  'symbol',
  'linearGradient',
  'radialGradient',
  'defs'
];

export function extractSvg(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
  const match = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  return match ? match[0] : null;
}

export function sanitizeSvg(input: string): string {
  let svg = input;

  svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  svg = svg.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  svg = svg.replace(/<!DOCTYPE[^>]*>/gi, '');
  svg = svg.replace(/<\?[\s\S]*?\?>/g, '');

  for (const tag of DANGEROUS_ELEMENTS) {
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    svg = svg.replace(new RegExp(`<\\s*${escaped}\\b[\\s\\S]*?<\\s*\\/\\s*${escaped}\\s*>`, 'gi'), '');
    svg = svg.replace(new RegExp(`<\\s*${escaped}\\b[^>]*\\/?>`, 'gi'), '');
  }

  svg = svg.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  svg = svg.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  svg = svg.replace(/\s(href|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  svg = svg.replace(/url\s*\([^)]*\)/gi, 'none');

  svg = svg.replace(new RegExp(`<\\s*(?!\\/?(?:${ALLOWED_TAGS})\\b)[a-zA-Z][^>]*>`, 'gi'), '');
  svg = svg.replace(new RegExp(`<\\/\\s*(?!(?:${ALLOWED_TAGS})\\b)[a-zA-Z][^>]*>`, 'gi'), '');

  if (!/\sxmlns=/.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/viewBox=/i.test(svg) && !/\swidth=/i.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg viewBox="0 0 1024 1024"');
  }

  return svg.trim();
}

export function isChildSafeSvg(svg: string): boolean {
  if (!svg.toLowerCase().startsWith('<svg')) return false;
  if (!DRAWING_TAG.test(svg)) return false;
  if (/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(svg)) return false;
  return true;
}
