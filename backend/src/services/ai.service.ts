import OpenAI from 'openai';
import { env } from '../config/env';
import { coloringRepository } from '../repositories/coloring.repository';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { sanitizeText, validateChildSafePrompt } from '../utils/sanitize';
import { extractSvg, isChildSafeSvg, sanitizeSvg } from '../utils/svg';
import { storageService } from './storage.service';
import { ColoringCategory, Difficulty } from '@prisma/client';

const CHILD_SAFE_STYLE_PROMPT = [
  'You generate simple, safe coloring-book line art for young children.',
  'Return ONLY a single valid SVG document and nothing else: no markdown, no code fences, no explanation.',
  'Rules for the SVG:',
  '- Root element must be <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">',
  '- Pure white background: include <rect x="0" y="0" width="1024" height="1024" fill="#ffffff"/>',
  '- Use ONLY these elements: svg, g, path, rect, circle, ellipse, line, polyline, polygon, title, desc',
  '- Draw with thick black outlines: stroke="#000000" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"',
  '- No gradients, no shading, no color, no text, no watermark, no external references, no scripts, no event handlers',
  '- Large, simple, enclosed regions that are easy for a small child to color inside',
  '- Friendly, wholesome, non-violent, age-appropriate subject with a clear centered composition',
  '- Keep it simple: around 10 to 40 shape elements maximum'
].join('\n');

const CATEGORY_BY_HINT: Array<{ keywords: string[]; category: ColoringCategory }> = [
  { keywords: ['dinosaur', 'trex', 't-rex', 'raptor'], category: ColoringCategory.DINOSAURS },
  { keywords: ['space', 'rocket', 'astronaut', 'planet', 'star', 'moon'], category: ColoringCategory.SPACE },
  { keywords: ['car', 'truck', 'bus', 'train', 'plane', 'vehicle'], category: ColoringCategory.VEHICLES },
  { keywords: ['fish', 'whale', 'dolphin', 'ocean', 'sea', 'shark'], category: ColoringCategory.UNDER_THE_SEA },
  { keywords: ['dragon', 'unicorn', 'fairy', 'magic', 'castle'], category: ColoringCategory.FANTASY },
  { keywords: ['tree', 'forest', 'flower', 'garden', 'mountain', 'nature'], category: ColoringCategory.NATURE },
  { keywords: ['christmas', 'snow', 'autumn', 'spring', 'summer', 'winter', 'season'], category: ColoringCategory.SEASONS },
  { keywords: ['cat', 'dog', 'lion', 'elephant', 'animal', 'bear', 'rabbit'], category: ColoringCategory.ANIMALS }
];

function inferCategory(prompt: string): ColoringCategory {
  const lower = prompt.toLowerCase();
  const match = CATEGORY_BY_HINT.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return match ? match.category : ColoringCategory.ANIMALS;
}

function ageGroupToDifficulty(ageGroup: string): Difficulty {
  const normalized = ageGroup.replace(/\s/g, '');
  if (normalized.startsWith('3') || normalized.startsWith('4') || normalized.startsWith('5')) return Difficulty.EASY;
  if (normalized.startsWith('8') || normalized.startsWith('9')) return Difficulty.MEDIUM;
  return Difficulty.MEDIUM;
}

export interface GeneratedArtwork {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export interface GenerateColoringPageInput {
  prompt: string;
  ageGroup: string;
  createdById?: string;
  title?: string;
}

export const aiService = {
  /**
   * Calls the Groq OpenAI-compatible chat API (free text model) and returns a
   * sanitized SVG coloring page. Groq has no image-generation endpoint, so line
   * art is produced as vector SVG instead of a raster image.
   */
  async requestArtwork(fullPrompt: string): Promise<GeneratedArtwork> {
    if (!env.groq.apiKey) {
      throw AppError.serviceUnavailable('AI generation is not configured');
    }

    const client = new OpenAI({ apiKey: env.groq.apiKey, baseURL: env.groq.baseUrl });

    const completion = await client.chat.completions.create({
      model: env.groq.model,
      temperature: 0.5,
      max_completion_tokens: 4096,
      messages: [
        { role: 'system', content: CHILD_SAFE_STYLE_PROMPT },
        { role: 'user', content: fullPrompt }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const extracted = extractSvg(raw);
    if (!extracted) {
      throw AppError.serviceUnavailable('The AI provider did not return a usable illustration');
    }

    const svg = sanitizeSvg(extracted);
    if (!isChildSafeSvg(svg)) {
      throw AppError.serviceUnavailable('The generated illustration failed child-safety validation');
    }

    return { buffer: Buffer.from(svg, 'utf8'), contentType: 'image/svg+xml', extension: 'svg' };
  },

  async generateColoringPage(input: GenerateColoringPageInput) {
    const safety = validateChildSafePrompt(input.prompt);
    if (!safety.safe) {
      throw AppError.badRequest('The prompt contains content that is not appropriate for children', {
        violations: safety.violations
      });
    }
    if (safety.sanitized.length < 3) {
      throw AppError.badRequest('Please describe the picture using at least a few words');
    }

    const category = inferCategory(safety.sanitized);
    const fullPrompt = `Create a coloring page of: ${safety.sanitized}. Ages ${input.ageGroup}.`;

    const artwork = await aiService.requestArtwork(fullPrompt);
    if (!artwork.buffer.length) throw AppError.serviceUnavailable('Generated illustration was empty');

    const key = `ai-coloring/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${artwork.extension}`;
    const uploaded = await storageService.upload(artwork.buffer, key, artwork.contentType);

    const title = sanitizeText(input.title ?? safety.sanitized, 80) || 'My Coloring Page';

    const page = await coloringRepository.create({
      title,
      description: `AI-generated coloring page for ages ${input.ageGroup}.`,
      category,
      ageGroup: input.ageGroup,
      difficulty: ageGroupToDifficulty(input.ageGroup),
      lineArtUrl: uploaded.url,
      thumbnailUrl: uploaded.url,
      storageKey: uploaded.key,
      isPublished: true,
      isAiGenerated: true,
      prompt: safety.sanitized,
      createdById: input.createdById ?? null
    });

    logger.info('Generated AI coloring page', { id: page.id, category, ageGroup: input.ageGroup, model: env.groq.model });
    return page;
  }
};
