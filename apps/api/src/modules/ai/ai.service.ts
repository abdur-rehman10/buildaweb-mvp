import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type JsonRecord = Record<string, unknown>;

export type AiGeneratedPage = {
  title: string;
  slug: string;
  isHome?: boolean;
  editorJson: JsonRecord;
  seoJson?: JsonRecord;
};

export type AiGeneratedNavigationItem = {
  label: string;
  slug: string;
};

export type AiGeneratedSite = {
  pages: AiGeneratedPage[];
  navigation: AiGeneratedNavigationItem[];
  theme: JsonRecord;
};

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

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  private readString(value: unknown, fallback = '') {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
  }

  private asRecord(value: unknown): JsonRecord | null {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return null;
    return value as JsonRecord;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private normalizePrompt(prompt: string) {
    return prompt.trim();
  }

  private fallbackGeneration(prompt: string): AiGeneratedSite {
    const summary = prompt.length > 120 ? `${prompt.slice(0, 117)}...` : prompt;

    return {
      pages: [
        {
          title: 'Home',
          slug: '/',
          isHome: true,
          editorJson: {
            sections: [
              {
                id: 'section-home-hero',
                blocks: [
                  {
                    id: 'block-home-hero',
                    nodes: [
                      {
                        id: 'node-home-title',
                        type: 'text',
                        tag: 'h1',
                        content: summary || 'Welcome to your new site',
                      },
                      {
                        id: 'node-home-cta',
                        type: 'button',
                        label: 'Learn more',
                        href: '/about',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          seoJson: {
            title: 'Home',
            description: summary || 'Generated homepage',
          },
        },
        {
          title: 'About',
          slug: 'about',
          isHome: false,
          editorJson: {
            sections: [
              {
                id: 'section-about',
                blocks: [
                  {
                    id: 'block-about',
                    nodes: [
                      {
                        id: 'node-about-title',
                        type: 'text',
                        tag: 'h2',
                        content: 'About us',
                      },
                      {
                        id: 'node-about-body',
                        type: 'text',
                        content:
                          'This page was generated automatically. You can edit all content in the editor.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          seoJson: {
            title: 'About',
          },
        },
      ],
      navigation: [
        { label: 'Home', slug: '/' },
        { label: 'About', slug: '/about' },
      ],
      theme: {},
    };
  }

  private buildSystemPrompt() {
    return [
      'You generate website structures for a page editor JSON schema.',
      'Return STRICT JSON only (no markdown, no code fences, no extra text).',
      'Output shape:',
      '{',
      '  "pages": [',
      '    {',
      '      "title": "string",',
      '      "slug": "string",',
      '      "isHome": true|false,',
      '      "editorJson": { "sections": [ { "id":"string", "blocks":[{"id":"string","nodes":[...]}] } ] },',
      '      "seoJson": { "title":"string", "description":"string" }',
      '    }',
      '  ],',
      '  "navigation": [ { "label":"string", "slug":"string" } ],',
      '  "theme": {}',
      '}',
      'Node types allowed: text, button, image.',
      'editorJson must be valid nested sections -> blocks -> nodes arrays.',
      'Include at least 2 pages and exactly one home page.',
      'Use URL-safe slugs.',
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

  private normalizeSiteJson(input: unknown): AiGeneratedSite {
    const root = this.asRecord(input);
    if (!root) {
      throw new AiInvalidJsonError('AI response root must be an object');
    }

    const pagesRaw = this.asArray(root.pages);
    if (pagesRaw.length === 0) {
      throw new AiInvalidJsonError(
        'AI response must include at least one page',
      );
    }

    const pages: AiGeneratedPage[] = pagesRaw.map((entry, index) => {
      const page = this.asRecord(entry);
      if (!page) {
        throw new AiInvalidJsonError(`Page at index ${index} is not an object`);
      }

      const title = this.readString(page.title).trim();
      const slug = this.readString(page.slug).trim();
      const editorJson = this.asRecord(page.editorJson);
      const seoJson = this.asRecord(page.seoJson) ?? {};

      if (!title) {
        throw new AiInvalidJsonError(`Page at index ${index} is missing title`);
      }
      if (!slug) {
        throw new AiInvalidJsonError(`Page "${title}" is missing slug`);
      }
      if (!editorJson) {
        throw new AiInvalidJsonError(
          `Page "${title}" is missing editorJson object`,
        );
      }

      return {
        title,
        slug,
        isHome: page.isHome === true,
        editorJson,
        seoJson,
      };
    });

    const navigationRaw = this.asArray(root.navigation);
    const navigation: AiGeneratedNavigationItem[] = navigationRaw
      .map((entry) => this.asRecord(entry))
      .filter((entry): entry is JsonRecord => entry !== null)
      .map((entry) => ({
        label: this.readString(entry.label).trim(),
        slug: this.readString(entry.slug).trim(),
      }))
      .filter((entry) => entry.label.length > 0 && entry.slug.length > 0);

    const theme = this.asRecord(root.theme) ?? {};

    return { pages, navigation, theme };
  }

  async generateSiteFromPrompt(prompt: string): Promise<AiGeneratedSite> {
    const normalizedPrompt = this.normalizePrompt(prompt);
    if (!normalizedPrompt) {
      throw new AiGenerationError('Prompt is empty');
    }

    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim() ?? '';
    if (!apiKey) {
      return this.fallbackGeneration(normalizedPrompt);
    }

    const raw = await this.generateWithOpenAi(normalizedPrompt, apiKey);
    const parsed = this.parseJsonText(raw);
    return this.normalizeSiteJson(parsed);
  }
}
