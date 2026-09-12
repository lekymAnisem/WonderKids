const HTML_TAG = /<[^>]*>/g;
const CONTROL_CHARS = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
  'g'
);
const MULTI_SPACE = /\s+/g;

export function stripHtml(input: string): string {
  return input.replace(HTML_TAG, ' ').replace(MULTI_SPACE, ' ').trim();
}

export function sanitizeText(input: string, maxLength = 2000): string {
  return stripHtml(input).replace(CONTROL_CHARS, '').slice(0, maxLength);
}

const BLOCKED_TERMS = [
  'gore',
  'blood',
  'weapon',
  'gun',
  'knife',
  'kill',
  'dead body',
  'nude',
  'naked',
  'sexual',
  'nsfw',
  'drugs',
  'alcohol',
  'smoking',
  'hate',
  'racist',
  'suicide',
  'self harm'
];

export interface PromptSafetyResult {
  safe: boolean;
  sanitized: string;
  violations: string[];
}

export function validateChildSafePrompt(rawPrompt: string): PromptSafetyResult {
  const sanitized = sanitizeText(rawPrompt, 400);
  const lower = sanitized.toLowerCase();
  const violations = BLOCKED_TERMS.filter((term) => lower.includes(term));
  return { safe: violations.length === 0, sanitized, violations };
}
