import { z } from 'zod';

export const PHASE1_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

export const PHASE1_TEXT_LIMITS = {
  headline: 300,
  paragraph: 1000,
} as const;

export function phase1StrictObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict();
}

export function phase1IdSchema() {
  return z.string().trim().regex(PHASE1_ID_REGEX);
}

export function phase1HeadlineSchema() {
  return z.string().trim().min(1).max(PHASE1_TEXT_LIMITS.headline);
}

export function phase1ParagraphSchema() {
  return z.string().trim().min(1).max(PHASE1_TEXT_LIMITS.paragraph);
}

export function phase1EnumSchema<const T extends [string, ...string[]]>(
  values: T,
) {
  return z.enum(values);
}
