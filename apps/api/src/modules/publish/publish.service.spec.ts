import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AssetsService } from '../assets/assets.service';
import { MinioService } from '../assets/minio.service';
import { NavigationDocument } from '../navigation/navigation.schema';
import { PageDocument } from '../pages/page.schema';
import { PreviewRendererService } from '../pages/preview-renderer.service';
import { ProjectDocument } from '../projects/project.schema';
import { PublishDocument } from './publish.schema';
import { PublishService } from './publish.service';

type MockPublishModel = {
  create: jest.Mock;
  find: jest.Mock;
};

type MockPageModel = {
  find: jest.Mock;
};

type MockNavigationModel = {
  findOne: jest.Mock;
};

type MockProjectModel = {
  updateOne: jest.Mock;
};

type MockAssetsService = {
  getByIdsScoped: jest.Mock;
};

type MockMinioService = {
  upload: jest.Mock;
};

type MockConfigService = {
  get: jest.Mock;
};

describe('PublishService pretty URLs', () => {
  let service: PublishService;
  let publishModel: MockPublishModel;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;
  let projectModel: MockProjectModel;
  let assets: MockAssetsService;
  let minio: MockMinioService;
  let config: MockConfigService;

  const mockLeanExec = <T>(value: T) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const baseParams = {
    tenantId: 'default',
    projectId: 'project-1',
    ownerUserId: 'user-1',
  };

  beforeEach(() => {
    const publishDoc = {
      _id: '507f1f77bcf86cd799439011',
      tenantId: 'default',
      projectId: 'project-1',
      ownerUserId: 'user-1',
      status: 'publishing' as const,
      baseUrl: 'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/temp/',
      errorMessage: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    };

    publishModel = {
      create: jest.fn().mockResolvedValue(publishDoc),
      find: jest.fn(),
    };

    pageModel = {
      find: jest.fn().mockReturnValue(
        mockLeanExec([
          {
            _id: '507f1f77bcf86cd799439021',
            title: 'Home',
            slug: '/',
            isHome: true,
            editorJson: {
              sections: [
                {
                  blocks: [
                    {
                      nodes: [{ type: 'text', content: 'Home page' }],
                    },
                  ],
                },
              ],
            },
          },
          {
            _id: '507f1f77bcf86cd799439022',
            title: 'About',
            slug: '/about',
            isHome: false,
            editorJson: {
              sections: [
                {
                  blocks: [
                    {
                      nodes: [{ type: 'button', label: 'Go home', href: '/' }],
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ),
    };

    navigationModel = {
      findOne: jest.fn().mockReturnValue(
        mockLeanExec({
          itemsJson: [
            { label: 'Home', pageId: '507f1f77bcf86cd799439021' },
            { label: 'About', pageId: '507f1f77bcf86cd799439022' },
          ],
        }),
      ),
    };

    projectModel = {
      updateOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    };

    assets = {
      getByIdsScoped: jest.fn().mockResolvedValue([]),
    };

    minio = {
      upload: jest.fn().mockResolvedValue('http://localhost:9000/buildaweb/object'),
    };

    config = {
      get: jest.fn((key: string) => {
        if (key === 'MINIO_PUBLIC_BASE_URL') return 'http://localhost:9000';
        if (key === 'MINIO_BUCKET') return 'buildaweb';
        return undefined;
      }),
    };

    service = new PublishService(
      publishModel as unknown as Model<PublishDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      projectModel as unknown as Model<ProjectDocument>,
      new PreviewRendererService(),
      assets as unknown as AssetsService,
      minio as unknown as MinioService,
      config as unknown as ConfigService,
    );
  });

  it('fails preflight when there are no pages', async () => {
    pageModel.find.mockReturnValueOnce(mockLeanExec([]));

    await expect(service.createAndPublish(baseParams)).rejects.toMatchObject({
      name: 'PublishPreflightError',
      code: 'PUBLISH_PREFLIGHT_FAILED',
      details: ['At least one page is required to publish.'],
    });

    expect(publishModel.create).not.toHaveBeenCalled();
    expect(minio.upload).not.toHaveBeenCalled();
  });

  it('fails preflight when duplicate slugs exist', async () => {
    pageModel.find.mockReturnValueOnce(
      mockLeanExec([
        {
          _id: '507f1f77bcf86cd799439031',
          title: 'Home',
          slug: '/',
          isHome: true,
          editorJson: {},
        },
        {
          _id: '507f1f77bcf86cd799439032',
          title: 'About',
          slug: '/About',
          isHome: false,
          editorJson: {},
        },
        {
          _id: '507f1f77bcf86cd799439033',
          title: 'About 2',
          slug: 'about',
          isHome: false,
          editorJson: {},
        },
      ]),
    );
    navigationModel.findOne.mockReturnValueOnce(mockLeanExec({ itemsJson: [] }));

    await expect(service.createAndPublish(baseParams)).rejects.toMatchObject({
      code: 'PUBLISH_PREFLIGHT_FAILED',
      details: expect.arrayContaining([expect.stringContaining('Duplicate slug "about"')]),
    });

    expect(publishModel.create).not.toHaveBeenCalled();
    expect(minio.upload).not.toHaveBeenCalled();
  });

  it('fails preflight when no home page exists', async () => {
    pageModel.find.mockReturnValueOnce(
      mockLeanExec([
        {
          _id: '507f1f77bcf86cd799439041',
          title: 'About',
          slug: '/about',
          isHome: false,
          editorJson: {},
        },
      ]),
    );
    navigationModel.findOne.mockReturnValueOnce(mockLeanExec({ itemsJson: [] }));

    await expect(service.createAndPublish(baseParams)).rejects.toMatchObject({
      code: 'PUBLISH_PREFLIGHT_FAILED',
      details: expect.arrayContaining([expect.stringContaining('Exactly one home page is required')]),
    });

    expect(publishModel.create).not.toHaveBeenCalled();
  });

  it('fails preflight when navigation references missing pageId', async () => {
    navigationModel.findOne.mockReturnValueOnce(
      mockLeanExec({
        itemsJson: [{ label: 'Ghost', pageId: '507f1f77bcf86cd799439099' }],
      }),
    );

    await expect(service.createAndPublish(baseParams)).rejects.toMatchObject({
      code: 'PUBLISH_PREFLIGHT_FAILED',
      details: expect.arrayContaining([expect.stringContaining('Navigation item 1 references missing pageId')]),
    });

    expect(publishModel.create).not.toHaveBeenCalled();
    expect(minio.upload).not.toHaveBeenCalled();
  });

  it('uploads published HTML with directory-style navigation links', async () => {
    const result = await service.createAndPublish(baseParams);

    expect(result.status).toBe('live');
    expect(result.url).toBe(
      'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/507f1f77bcf86cd799439011/',
    );

    const uploads = minio.upload.mock.calls.map((call) => call[0] as { objectPath: string; buffer: Buffer });
    const homeUpload = uploads.find((upload) => upload.objectPath.endsWith('/index.html'));
    const aboutUpload = uploads.find((upload) => upload.objectPath.endsWith('/about/index.html'));
    const cssUpload = uploads.find((upload) => upload.objectPath.endsWith('/styles.css'));

    expect(homeUpload).toBeDefined();
    expect(aboutUpload).toBeDefined();
    expect(cssUpload).toBeDefined();

    const homeHtml = homeUpload!.buffer.toString('utf-8');
    expect(homeHtml).toContain('<nav class="baw-nav">');
    expect(homeHtml).toContain('href="about/"');
    expect(homeHtml).not.toContain('index.html');

    const aboutHtml = aboutUpload!.buffer.toString('utf-8');
    expect(aboutHtml).toContain('href="../"');
    expect(aboutHtml).toContain('href="../styles.css"');
    expect(aboutHtml).not.toContain('index.html');

    const css = cssUpload!.buffer.toString('utf-8');
    expect(css).toContain('.baw-nav{display:flex;gap:12px;padding:12px 0}');
    expect(css).toContain('.baw-nav a{text-decoration:none}');

    expect(projectModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'project-1',
        tenantId: 'default',
        ownerUserId: 'user-1',
      },
      {
        $set: {
          latestPublishId: '507f1f77bcf86cd799439011',
          publishedAt: expect.any(Date),
        },
      },
    );
  });

  it('injects seo meta tags into published html and resolves og:image from asset id', async () => {
    pageModel.find.mockReturnValueOnce(
      mockLeanExec([
        {
          _id: '507f1f77bcf86cd799439061',
          title: 'Home',
          slug: '/',
          isHome: true,
          seoJson: {
            title: 'SEO Home',
            description: 'Home description',
            ogTitle: 'Home OG',
            ogDescription: 'Home OG Description',
            ogImageAssetId: '507f1f77bcf86cd799439099',
          },
          editorJson: { sections: [] },
        },
      ]),
    );
    navigationModel.findOne.mockReturnValueOnce(mockLeanExec({ itemsJson: [] }));
    assets.getByIdsScoped.mockResolvedValueOnce([
      {
        _id: '507f1f77bcf86cd799439099',
        publicUrl: 'http://localhost:9000/buildaweb/tenants/default/projects/project-1/assets/hero.png',
      },
    ]);

    await service.createAndPublish(baseParams);

    const uploads = minio.upload.mock.calls.map((call) => call[0] as { objectPath: string; buffer: Buffer });
    const homeUpload = uploads.find((upload) => upload.objectPath.endsWith('/index.html'));

    expect(homeUpload).toBeDefined();

    const html = homeUpload!.buffer.toString('utf-8');
    expect(html).toContain('<title>SEO Home</title>');
    expect(html).toContain('<meta name="description" content="Home description" />');
    expect(html).toContain('<meta property="og:title" content="Home OG" />');
    expect(html).toContain('<meta property="og:description" content="Home OG Description" />');
    expect(html).toContain(
      '<meta property="og:image" content="http://localhost:9000/buildaweb/tenants/default/projects/project-1/assets/hero.png" />',
    );
  });

  it('lists publishes scoped to project/user sorted by createdAt desc with limit', async () => {
    const exec = jest.fn().mockResolvedValue([{ _id: 'publish-1' }, { _id: 'publish-2' }]);
    const limit = jest.fn().mockReturnValue({ exec });
    const sort = jest.fn().mockReturnValue({ limit });
    publishModel.find.mockReturnValue({ sort });

    const result = await service.listByProjectScoped({
      tenantId: 'default',
      projectId: 'project-1',
      ownerUserId: 'user-1',
      limit: 10,
    });

    expect(publishModel.find).toHaveBeenCalledWith({
      tenantId: 'default',
      projectId: 'project-1',
      ownerUserId: 'user-1',
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limit).toHaveBeenCalledWith(10);
    expect(result).toEqual([{ _id: 'publish-1' }, { _id: 'publish-2' }]);
  });
});
