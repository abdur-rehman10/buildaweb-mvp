import { z } from 'zod';
import {
  phase1EnumSchema,
  phase1HeadlineSchema,
  phase1ParagraphSchema,
  phase1StrictObject,
} from './phase1-strict-validator';

const featureItemSchema = phase1StrictObject({
  title: phase1HeadlineSchema(),
  description: phase1ParagraphSchema(),
});

const heroSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['hero']),
  headline: phase1HeadlineSchema(),
  subheadline: phase1ParagraphSchema(),
  cta: phase1HeadlineSchema(),
  imageQuery: phase1ParagraphSchema().optional(),
  imageUrl: z.string().trim().url().optional(),
});

const featuresSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['features']),
  items: z.array(featureItemSchema).min(1),
});

const pricingSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['pricing']),
  headline: phase1HeadlineSchema(),
  plans: z
    .array(
      phase1StrictObject({
        name: phase1HeadlineSchema(),
        price: phase1HeadlineSchema(),
        features: z.array(phase1ParagraphSchema()).min(1),
      }),
    )
    .min(1),
});

const footerSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['footer']),
  text: phase1ParagraphSchema(),
  links: z
    .array(
      phase1StrictObject({
        label: phase1HeadlineSchema(),
        href: phase1ParagraphSchema(),
      }),
    )
    .min(1),
});

const ctaSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['cta']),
  headline: phase1HeadlineSchema(),
  cta: phase1HeadlineSchema(),
  imageQuery: phase1ParagraphSchema().optional(),
  imageUrl: z.string().trim().url().optional(),
});

const testimonialsSectionSchema = phase1StrictObject({
  type: phase1EnumSchema(['testimonials']),
  items: z
    .array(
      phase1StrictObject({
        name: phase1HeadlineSchema(),
        quote: phase1ParagraphSchema(),
      }),
    )
    .min(1),
});

export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  featuresSectionSchema,
  pricingSectionSchema,
  footerSectionSchema,
  ctaSectionSchema,
  testimonialsSectionSchema,
]);

export type AiGeneratedSection = z.infer<typeof sectionSchema>;

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function resolveTemplatePlaceholders(
  value: string,
  tokens: Record<string, string>,
): string {
  return value.replace(PLACEHOLDER_REGEX, (_match, key: string) => {
    const resolved = tokens[key];
    if (typeof resolved === 'string' && resolved.trim()) {
      return resolved.trim();
    }
    return `literal:${key}`;
  });
}

function resolveTemplateData(
  value: unknown,
  tokens: Record<string, string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveTemplateData(entry, tokens));
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(record).map(([key, entry]) => [
        key,
        resolveTemplateData(entry, tokens),
      ]),
    );
  }

  if (typeof value === 'string') {
    return resolveTemplatePlaceholders(value, tokens);
  }

  return value;
}

const canonicalSectionTemplatesV1: ReadonlyArray<unknown> = [
  {
    type: 'hero',
    headline: 'Build {{business.name}} faster',
    subheadline:
      '{{business.industry}} teams launch pages with consistent structure and clear messaging.',
    cta: 'Get started',
    imageQuery: '{{image.heroQuery}}',
  },
  {
    type: 'features',
    items: [
      {
        title: 'Fast setup',
        description: 'Start with a schema-valid layout in minutes.',
      },
      {
        title: 'Deterministic output',
        description: 'Keep structure and copy consistent across runs.',
      },
      {
        title: 'Easy iteration',
        description: 'Update sections without breaking template rules.',
      },
    ],
  },
  {
    type: 'pricing',
    headline: 'Simple pricing for {{business.name}}',
    plans: [
      {
        name: 'Starter',
        price: '{{pricing.starter}}',
        features: ['Up to 5 pages', 'Basic analytics', 'Email support'],
      },
      {
        name: 'Growth',
        price: '{{pricing.growth}}',
        features: ['Unlimited pages', 'Team collaboration', 'Priority support'],
      },
    ],
  },
  {
    type: 'footer',
    text: '© {{business.name}}',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
];

export function buildCanonicalSectionTemplates(tokens: Record<string, string>) {
  return canonicalSectionTemplatesV1.map((template) =>
    sectionSchema.parse(resolveTemplateData(template, tokens)),
  );
}

export function canonicalTemplateTypeList() {
  return ['hero', 'features', 'pricing', 'footer'] as const;
}
