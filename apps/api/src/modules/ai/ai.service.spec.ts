import { ConfigService } from '@nestjs/config';
import { AiInvalidJsonError, AiService } from './ai.service';
import { PexelsService } from './pexels.service';

describe('AiService strict validation', () => {
  const config = {
    get: jest.fn().mockReturnValue(''),
  } as unknown as ConfigService;

  const pexels = {
    searchImage: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
  } as unknown as PexelsService;

  const service = new AiService(config, pexels);

  const validPayload = {
    project: {
      name: 'Site Name',
      industry: 'Technology',
      primaryColor: '#1F6FEB',
      secondaryColor: '#10B981',
      fontPair: { heading: 'Poppins', body: 'Inter' },
    },
    seo: {
      title: 'Title',
      description: 'Description',
      keywords: ['one'],
    },
    pages: [
      {
        slug: 'home',
        title: 'Home',
        sections: [
          {
            type: 'hero',
            headline: 'Headline',
            subheadline: 'Paragraph',
            cta: 'Start',
          },
          {
            type: 'features',
            items: [{ title: 'One', description: 'Desc' }],
          },
          {
            type: 'testimonials',
            items: [{ name: 'Jane', quote: 'Great!' }],
          },
          {
            type: 'cta',
            headline: 'Join now',
            cta: 'Sign up',
          },
        ],
      },
    ],
  };

  it('rejects unknown root fields deterministically', () => {
    const payload = { ...validPayload, unexpected: true };
    expect(() =>
      (
        service as unknown as { validateGeneratedSite: (i: unknown) => unknown }
      ).validateGeneratedSite(payload),
    ).toThrow(AiInvalidJsonError);
  });

  it('rejects unknown nested fields deterministically', () => {
    const payload = {
      ...validPayload,
      pages: [
        {
          ...validPayload.pages[0],
          sections: [
            {
              type: 'hero',
              headline: 'Headline',
              subheadline: 'Paragraph',
              cta: 'Start',
              extraField: 'not allowed',
            },
            ...validPayload.pages[0].sections.slice(1),
          ],
        },
      ],
    };

    expect(() =>
      (
        service as unknown as { validateGeneratedSite: (i: unknown) => unknown }
      ).validateGeneratedSite(payload),
    ).toThrow(AiInvalidJsonError);
  });
});
