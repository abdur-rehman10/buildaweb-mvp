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
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
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
      }),
    };

    navigationModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          itemsJson: [
            { label: 'Home', pageId: '507f1f77bcf86cd799439021' },
            { label: 'About', pageId: '507f1f77bcf86cd799439022' },
          ],
        }),
      }),
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

  it('uploads published HTML with directory-style navigation links', async () => {
    const result = await service.createAndPublish({
      tenantId: 'default',
      projectId: 'project-1',
      ownerUserId: 'user-1',
    });

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
