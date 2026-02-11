import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { PexelsService } from './pexels.service';

type JsonRecord = Record<string, unknown>;

const IMAGE_PLACEHOLDER_SRC = 'https://placehold.co/1200x800?text=Image';

const featureItemSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const heroSectionSchema = z.object({
  type: z.literal('hero'),
  headline: z.string().trim().min(1),
  subheadline: z.string().trim().min(1),
  cta: z.string().trim().min(1),
  imageQuery: z.string().trim().min(1).optional(),
  imageUrl: z.string().trim().url().optional(),
});

const featuresSectionSchema = z.object({
  type: z.literal('features'),
  items: z.array(featureItemSchema).min(1),
});

const ctaSectionSchema = z.object({
  type: z.literal('cta'),
  headline: z.string().trim().min(1),
  cta: z.string().trim().min(1),
  imageQuery: z.string().trim().min(1).optional(),
  imageUrl: z.string().trim().url().optional(),
});

const testimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        quote: z.string().trim().min(1),
      }),
    )
    .min(1),
});

const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  featuresSectionSchema,
  ctaSectionSchema,
  testimonialsSectionSchema,
]);

const generatedPageSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  sections: z.array(sectionSchema).min(1),
});

const generatedSiteSchema = z
  .object({
    project: z.object({
      name: z.string().trim().min(1),
      industry: z.string().trim().min(1),
      primaryColor: z
        .string()
        .trim()
        .regex(/^#[0-9A-Fa-f]{6}$/),
      secondaryColor: z
        .string()
        .trim()
        .regex(/^#[0-9A-Fa-f]{6}$/),
      fontPair: z.object({
        heading: z.string().trim().min(1),
        body: z.string().trim().min(1),
      }),
    }),
    seo: z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      keywords: z.array(z.string().trim().min(1)).min(1),
    }),
    pages: z.array(generatedPageSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const normalizedSlugs = new Set<string>();
    let homeCount = 0;

    value.pages.forEach((page, index) => {
      const normalizedSlug = normalizeGeneratedSlug(page.slug);
      if (normalizedSlug === '/' || normalizedSlug === '/home') {
        homeCount += 1;
      }

      if (normalizedSlugs.has(normalizedSlug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pages', index, 'slug'],
          message: `Duplicate page slug "${page.slug}"`,
        });
      }
      normalizedSlugs.add(normalizedSlug);

      if (page.sections.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pages', index, 'sections'],
          message: 'Pages must include at least one section',
        });
      }
    });

    if (homeCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pages'],
        message: 'Exactly one home page is required',
      });
    }

    const homePage = value.pages.find((page) => {
      const normalizedSlug = normalizeGeneratedSlug(page.slug);
      return normalizedSlug === '/' || normalizedSlug === '/home';
    });

    if (!homePage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pages'],
        message: 'Home page is required',
      });
      return;
    }

    if (homePage.sections.length < 4 || homePage.sections.length > 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pages'],
        message: 'Home page must include 4 to 6 sections',
      });
    }
  });

export type AiGeneratedSection = z.infer<typeof sectionSchema>;
export type AiGeneratedPage = z.infer<typeof generatedPageSchema>;
export type AiGeneratedSite = z.infer<typeof generatedSiteSchema>;

export class AiInvalidJsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiInvalidJsonError';
  }
}

export class AiGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiGenerationError';
  }
}

function normalizeGeneratedSlug(slug: string) {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed || trimmed === '/' || trimmed === 'home') return '/';
  return `/${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly pexels: PexelsService,
  ) {}

  private asRecord(value: unknown): JsonRecord | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as JsonRecord;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private readString(value: unknown, fallback = '') {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
  }

  private normalizePrompt(prompt: string) {
    return prompt.trim();
  }

  private fallbackGeneration(prompt: string): AiGeneratedSite {
    const summary = prompt.length > 160 ? `${prompt.slice(0, 157)}...` : prompt;

    return {
      project: {
        name: 'Generated Website',
        industry: 'general business',
        primaryColor: '#1F6FEB',
        secondaryColor: '#10B981',
        fontPair: {
          heading: 'Poppins',
          body: 'Inter',
        },
      },
      seo: {
        title: 'Generated Website',
        description: summary || 'A professionally generated website.',
        keywords: ['website', 'business', 'services'],
      },
      pages: [
        {
          slug: 'home',
          title: 'Home',
          sections: [
            {
              type: 'hero',
              headline: summary || 'Launch your business website in minutes',
              subheadline:
                'Build trust and convert visitors with a clear, professional site structure.',
              cta: 'Get started',
              imageQuery: 'modern business hero workspace',
            },
            {
              type: 'features',
              items: [
                {
                  title: 'Fast setup',
                  description:
                    'Publish a clear, conversion-focused site without design overhead.',
                },
                {
                  title: 'Easy updates',
                  description:
                    'Update pages and messaging quickly from one simple editor.',
                },
                {
                  title: 'Growth ready',
                  description:
                    'Start with essential pages and expand as your business grows.',
                },
              ],
            },
            {
              type: 'testimonials',
              items: [
                {
                  name: 'Happy Client',
                  quote:
                    'This process made launching our website much easier than expected.',
                },
              ],
            },
            {
              type: 'cta',
              headline: 'Ready to build your website?',
              cta: 'Start now',
              imageQuery: 'team collaboration office',
            },
          ],
        },
      ],
    };
  }

  private buildSystemPrompt() {
    return [
      'You are an expert website strategist and conversion psychologist.',
      'Generate complete website structures.',
      'Never hallucinate statistics.',
      'Never fabricate company history.',
      'Use neutral but persuasive tone.',
      'Select colors based on industry psychology.',
      'Return strict JSON only.',
      'Do not wrap in markdown.',
      'Do not include explanations.',
      '',
      'Output JSON schema:',
      '{',
      '  "project": {',
      '    "name": "string",',
      '    "industry": "string",',
      '    "primaryColor": "hex",',
      '    "secondaryColor": "hex",',
      '    "fontPair": { "heading": "string", "body": "string" }',
      '  },',
      '  "seo": {',
      '    "title": "string",',
      '    "description": "string",',
      '    "keywords": ["string"]',
      '  },',
      '  "pages": [',
      '    {',
      '      "slug": "home",',
      '      "title": "string",',
      '      "sections": [',
      '        { "type": "hero", "headline": "string", "subheadline": "string", "cta": "string", "imageQuery": "string" },',
      '        { "type": "features", "items": [{ "title": "string", "description": "string" }] },',
      '        { "type": "testimonials", "items": [{ "name": "string", "quote": "string" }] },',
      '        { "type": "cta", "headline": "string", "cta": "string", "imageQuery": "string" }',
      '      ]',
      '    }',
      '  ]',
      '}',
      '',
      'Rules:',
      '- Include at least one page and exactly one home page (slug "home").',
      '- Home page must have 4 to 6 sections.',
      '- Never return empty sections arrays.',
      '- Keep all fields populated with realistic business-safe copy.',
      '- Use URL-safe slug names.',
    ].join('\n');
  }

  private async generateWithOpenAi(prompt: string, apiKey: string) {
    const model =
      this.config.get<string>('OPENAI_MODEL')?.trim() || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new AiGenerationError(
        `OpenAI request failed: ${response.status} ${bodyText.slice(0, 200)}`,
      );
    }

    const payload = (await response.json()) as JsonRecord;
    const choices = this.asArray(payload.choices);
    const choice0 = this.asRecord(choices[0]);
    const message = this.asRecord(choice0?.message);
    const content = this.readString(message?.content).trim();

    if (!content) {
      throw new AiInvalidJsonError('AI response content is empty');
    }

    return content;
  }

  private parseJsonText(raw: string): unknown {
    const trimmed = raw.trim();
    const withoutFence = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      return JSON.parse(withoutFence);
    } catch {
      throw new AiInvalidJsonError('AI response is not valid JSON');
    }
  }

  private normalizeValidatedSite(site: AiGeneratedSite): AiGeneratedSite {
    return {
      project: {
        ...site.project,
        name: site.project.name.trim(),
        industry: site.project.industry.trim(),
        primaryColor: site.project.primaryColor.toUpperCase(),
        secondaryColor: site.project.secondaryColor.toUpperCase(),
        fontPair: {
          heading: site.project.fontPair.heading.trim(),
          body: site.project.fontPair.body.trim(),
        },
      },
      seo: {
        title: site.seo.title.trim(),
        description: site.seo.description.trim(),
        keywords: site.seo.keywords
          .map((entry) => entry.trim())
          .filter(Boolean),
      },
      pages: site.pages.map((page) => ({
        ...page,
        slug: page.slug.trim(),
        title: page.title.trim(),
        sections: page.sections.map((section) => ({ ...section })),
      })),
    };
  }

  private validateGeneratedSite(input: unknown): AiGeneratedSite {
    const parsed = generatedSiteSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join('; ');
      throw new AiInvalidJsonError(
        message || 'AI response failed schema validation',
      );
    }
    return this.normalizeValidatedSite(parsed.data);
  }

  private async injectImages(site: AiGeneratedSite): Promise<AiGeneratedSite> {
    const pages = await Promise.all(
      site.pages.map(async (page) => {
        const sections = await Promise.all(
          page.sections.map(async (section) => {
            if ('imageQuery' in section) {
              const imageQuery = section.imageQuery?.trim() ?? '';
              const resolvedImage =
                (imageQuery
                  ? await this.pexels.searchImage(imageQuery)
                  : null) ??
                section.imageUrl ??
                IMAGE_PLACEHOLDER_SRC;
              const nextSection = {
                ...section,
                imageUrl: resolvedImage,
              } as const;
              const withoutImageQuery = {
                ...nextSection,
              } as Record<string, unknown>;
              delete withoutImageQuery.imageQuery;
              return withoutImageQuery as AiGeneratedSection;
            }

            return section;
          }),
        );

        return {
          ...page,
          sections,
        };
      }),
    );

    return {
      ...site,
      pages,
    };
  }

  async generateSiteFromPrompt(prompt: string): Promise<AiGeneratedSite> {
    const normalizedPrompt = this.normalizePrompt(prompt);
    if (!normalizedPrompt) {
      throw new AiGenerationError('Prompt is empty');
    }

    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim() ?? '';
    if (!apiKey) {
      const fallback = this.fallbackGeneration(normalizedPrompt);
      return this.injectImages(fallback);
    }

    let lastError: AiInvalidJsonError | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const raw = await this.generateWithOpenAi(normalizedPrompt, apiKey);
        const parsed = this.parseJsonText(raw);
        const validated = this.validateGeneratedSite(parsed);
        return this.injectImages(validated);
      } catch (error) {
        if (error instanceof AiInvalidJsonError) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw (
      lastError ??
      new AiInvalidJsonError('AI response failed schema validation')
    );
  }
}
