import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AiInvalidJsonError, AiService } from '../src/modules/ai/ai.service';
import { PexelsService } from '../src/modules/ai/pexels.service';
import { NavigationDocument } from '../src/modules/navigation/navigation.schema';
import { PageDocument } from '../src/modules/pages/page.schema';
import { PublishDocument } from '../src/modules/publish/publish.schema';
import { ProjectDocument } from '../src/modules/projects/project.schema';
import { ProjectsService } from '../src/modules/projects/projects.service';

type MockConfigMap = Record<string, string | undefined>;

function createConfigService(values: MockConfigMap) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function openAiResponse(content: string) {
  return {
    ok: true,
    json: () => ({
      choices: [
        {
          message: {
            content,
          },
        },
      ],
    }),
  } as Response;
}

function pexelsResponse(url: string) {
  return {
    ok: true,
    json: () => ({
      photos: [
        {
          src: {
            large: url,
          },
        },
      ],
    }),
  } as Response;
}

function requestUrlToString(input: RequestInfo | URL): string {
  if (input instanceof URL) return input.toString();
  if (typeof input === 'string') return input;
  if (input instanceof Request) return input.url;
  return '';
}

const validAiJson = JSON.stringify({
  project: {
    name: 'Acme Studio',
    industry: 'creative agency',
    primaryColor: '#1F6FEB',
    secondaryColor: '#10B981',
    fontPair: {
      heading: 'Poppins',
      body: 'Inter',
    },
  },
  seo: {
    title: 'Acme Studio',
    description: 'Creative agency website',
    keywords: ['agency', 'design', 'branding'],
  },
  pages: [
    {
      slug: 'home',
      title: 'Home',
      sections: [
        {
          type: 'hero',
          headline: 'Build standout brands',
          subheadline: 'We help teams grow through design.',
          cta: 'Book a call',
          imageQuery: 'creative team brainstorming',
        },
        {
          type: 'features',
          items: [
            {
              title: 'Brand strategy',
              description: 'Position your brand with clarity.',
            },
          ],
        },
        {
          type: 'testimonials',
          items: [
            {
              name: 'Client One',
              quote: 'Great strategic partner.',
            },
          ],
        },
        {
          type: 'cta',
          headline: "Let's work together",
          cta: 'Start project',
          imageQuery: 'office meeting collaboration',
        },
      ],
    },
  ],
});

describe('AiService full generator', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('generates structured site data', async () => {
    const config = createConfigService({
      OPENAI_API_KEY: 'openai-test-key',
      OPENAI_MODEL: 'gpt-4o-mini',
      PEXELS_API_KEY: 'pexels-test-key',
    });

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = requestUrlToString(input);
      if (url.includes('openai.com')) return openAiResponse(validAiJson);
      if (url.includes('pexels.com')) {
        return pexelsResponse(
          'https://images.pexels.com/photos/123/photo.jpeg',
        );
      }
      return { ok: false, json: () => ({}) } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const pexels = new PexelsService(config);
    const service = new AiService(config, pexels);

    const result = await service.generateSiteFromPrompt(
      'Generate a modern creative agency website with persuasive copy.',
    );

    expect(result.project.name).toBe('Acme Studio');
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].sections.length).toBeGreaterThanOrEqual(4);
  });

  it('rejects invalid JSON after retry', async () => {
    const config = createConfigService({
      OPENAI_API_KEY: 'openai-test-key',
      OPENAI_MODEL: 'gpt-4o-mini',
      PEXELS_API_KEY: 'pexels-test-key',
    });

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = requestUrlToString(input);
      if (url.includes('openai.com')) return openAiResponse('not-json');
      return { ok: false, json: () => ({}) } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const pexels = new PexelsService(config);
    const service = new AiService(config, pexels);

    await expect(
      service.generateSiteFromPrompt('Generate a website'),
    ).rejects.toBeInstanceOf(AiInvalidJsonError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects pages with empty sections', async () => {
    const config = createConfigService({
      OPENAI_API_KEY: 'openai-test-key',
      OPENAI_MODEL: 'gpt-4o-mini',
      PEXELS_API_KEY: 'pexels-test-key',
    });

    const invalidSite = JSON.stringify({
      project: {
        name: 'Acme',
        industry: 'tech',
        primaryColor: '#1F6FEB',
        secondaryColor: '#10B981',
        fontPair: { heading: 'Poppins', body: 'Inter' },
      },
      seo: {
        title: 'Acme',
        description: 'Acme website',
        keywords: ['acme'],
      },
      pages: [
        {
          slug: 'home',
          title: 'Home',
          sections: [],
        },
      ],
    });

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = requestUrlToString(input);
      if (url.includes('openai.com')) return openAiResponse(invalidSite);
      return { ok: false, json: () => ({}) } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const pexels = new PexelsService(config);
    const service = new AiService(config, pexels);

    await expect(
      service.generateSiteFromPrompt('Generate a website'),
    ).rejects.toBeInstanceOf(AiInvalidJsonError);
  });

  it('injects imageUrl from Pexels', async () => {
    const config = createConfigService({
      OPENAI_API_KEY: 'openai-test-key',
      OPENAI_MODEL: 'gpt-4o-mini',
      PEXELS_API_KEY: 'pexels-test-key',
    });

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = requestUrlToString(input);
      if (url.includes('openai.com')) return openAiResponse(validAiJson);
      if (url.includes('pexels.com')) {
        return pexelsResponse(
          'https://images.pexels.com/photos/999/photo.jpeg',
        );
      }
      return { ok: false, json: () => ({}) } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const pexels = new PexelsService(config);
    const service = new AiService(config, pexels);

    const result = await service.generateSiteFromPrompt('Generate a website');
    const heroSection = result.pages[0].sections.find(
      (section) => section.type === 'hero',
    );

    expect(heroSection).toBeDefined();
    expect(
      heroSection && 'imageUrl' in heroSection ? heroSection.imageUrl : null,
    ).toBe('https://images.pexels.com/photos/999/photo.jpeg');
  });

  it('does not keep imageQuery in saved AI output', async () => {
    const config = createConfigService({
      OPENAI_API_KEY: 'openai-test-key',
      OPENAI_MODEL: 'gpt-4o-mini',
      PEXELS_API_KEY: 'pexels-test-key',
    });

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = requestUrlToString(input);
      if (url.includes('openai.com')) return openAiResponse(validAiJson);
      if (url.includes('pexels.com')) {
        return pexelsResponse(
          'https://images.pexels.com/photos/777/photo.jpeg',
        );
      }
      return { ok: false, json: () => ({}) } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const pexels = new PexelsService(config);
    const service = new AiService(config, pexels);

    const result = await service.generateSiteFromPrompt('Generate a website');

    const hasImageQuery = result.pages.some((page) =>
      page.sections.some((section) => 'imageQuery' in section),
    );

    expect(hasImageQuery).toBe(false);
  });
});

describe('ProjectsService.createFromPrompt', () => {
  const buildModels = () => {
    const projectModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    const pageModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn(),
      updateOne: jest.fn(),
      deleteMany: jest.fn(),
      insertMany: jest.fn(),
    };

    const navigationModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const publishModel = {
      find: jest.fn(),
    };

    return { projectModel, pageModel, navigationModel, publishModel };
  };

  it('creates structured pages and strips imageQuery before persistence', async () => {
    const { projectModel, pageModel, navigationModel, publishModel } =
      buildModels();

    projectModel.findOne.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce({
          _id: '507f1f77bcf86cd799439100',
          tenantId: 'default',
          ownerUserId: 'user-1',
        })
        .mockResolvedValueOnce({
          _id: '507f1f77bcf86cd799439100',
          tenantId: 'default',
          ownerUserId: 'user-1',
        }),
    });

    pageModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
    pageModel.insertMany.mockResolvedValue([]);

    navigationModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'nav-1' }),
    });

    projectModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    });

    const ai = {
      generateSiteFromPrompt: jest
        .fn()
        .mockResolvedValue(JSON.parse(validAiJson)),
    } as unknown as AiService;

    const service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      publishModel as unknown as Model<PublishDocument>,
      ai,
    );

    await service.createFromPrompt({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: '507f1f77bcf86cd799439100',
      prompt: 'Generate a website',
    });

    expect(pageModel.insertMany).toHaveBeenCalledTimes(1);
    const insertManyMock = pageModel.insertMany as jest.Mock<
      unknown,
      [Array<Record<string, unknown>>]
    >;
    const firstInsertCall = insertManyMock.mock.calls.at(0);
    if (!firstInsertCall) {
      throw new Error('insertMany was not called');
    }
    const [insertedDocs] = firstInsertCall;
    const serialized = JSON.stringify(insertedDocs);

    expect(insertedDocs.length).toBeGreaterThan(0);
    expect(serialized).not.toContain('imageQuery');
  });

  it('rejects empty sections when persisting generated output', async () => {
    const { projectModel, pageModel, navigationModel, publishModel } =
      buildModels();

    projectModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439100',
        tenantId: 'default',
        ownerUserId: 'user-1',
      }),
    });

    const ai = {
      generateSiteFromPrompt: jest.fn().mockResolvedValue({
        project: {
          name: 'Acme',
          industry: 'tech',
          primaryColor: '#1F6FEB',
          secondaryColor: '#10B981',
          fontPair: { heading: 'Poppins', body: 'Inter' },
        },
        seo: {
          title: 'Acme',
          description: 'Acme desc',
          keywords: ['acme'],
        },
        pages: [
          {
            slug: 'home',
            title: 'Home',
            sections: [],
          },
        ],
      }),
    } as unknown as AiService;

    const service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      publishModel as unknown as Model<PublishDocument>,
      ai,
    );

    await expect(
      service.createFromPrompt({
        tenantId: 'default',
        ownerUserId: 'user-1',
        projectId: '507f1f77bcf86cd799439100',
        prompt: 'Generate a website',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
