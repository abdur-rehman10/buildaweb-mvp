import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsApiScreen } from './ProjectsApiScreen';
import { ApiError, assetsApi, navigationApi, pagesApi, projectsApi, publishApi } from '../../lib/api';
import { appToast } from '../../lib/toast';

vi.mock('../../lib/api', () => {
  class MockApiError extends Error {
    status: number;
    code: string;
    details?: string[];

    constructor(params: { status: number; code: string; message: string; details?: string[] }) {
      super(params.message);
      this.name = 'ApiError';
      this.status = params.status;
      this.code = params.code;
      this.details = params.details;
    }
  }

  return {
    ApiError: MockApiError,
    projectsApi: {
      list: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
      setHome: vi.fn(),
    },
    pagesApi: {
      list: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      updateMeta: vi.fn(),
      duplicate: vi.fn(),
      remove: vi.fn(),
      preview: vi.fn(),
    },
    navigationApi: {
      get: vi.fn(),
      update: vi.fn(),
    },
    publishApi: {
      create: vi.fn(),
      list: vi.fn(),
      setLatest: vi.fn(),
      getLatest: vi.fn(),
      getStatus: vi.fn(),
    },
    assetsApi: {
      resolve: vi.fn(),
      upload: vi.fn(),
      list: vi.fn(),
    },
  };
});

vi.mock('../../lib/toast', () => ({
  appToast: {
    success: vi.fn(),
    error: vi.fn(),
    apiError: vi.fn(),
  },
}));

const project = {
  id: 'project-1',
  name: 'Main site',
  status: 'draft' as const,
  defaultLocale: 'en',
};

const pages = [
  {
    id: 'page-home',
    title: 'Home',
    slug: '/',
    isHome: true,
    version: 1,
  },
  {
    id: 'page-about',
    title: 'About',
    slug: '/about',
    isHome: false,
    version: 2,
  },
];

function renderScreen() {
  return render(
    <ProjectsApiScreen
      activeProjectId="project-1"
      activePageId={null}
      onSelectActivePageId={() => {}}
      onSelectProject={() => {}}
      onOpenPage={() => {}}
      onOpenAssetsLibrary={() => {}}
    />,
  );
}

describe('ProjectsApiScreen toasts', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    vi.mocked(projectsApi.list).mockResolvedValue({
      projects: [project],
    });
    vi.mocked(pagesApi.list).mockResolvedValue({
      pages,
    });
    vi.mocked(projectsApi.get).mockResolvedValue({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'draft',
        defaultLocale: 'en',
        homePageId: null,
        latestPublishId: null,
        publishedAt: null,
        hasUnpublishedChanges: true,
      },
    });
    vi.mocked(projectsApi.getSettings).mockResolvedValue({
      settings: {
        siteName: null,
        logoAssetId: null,
        faviconAssetId: null,
        defaultOgImageAssetId: null,
        locale: 'en',
      },
    });
    vi.mocked(assetsApi.resolve).mockResolvedValue({ items: [] });
    vi.mocked(navigationApi.get).mockResolvedValue({
      items: [],
    });
    vi.mocked(publishApi.getStatus).mockResolvedValue({
      publishId: 'publish-1',
      status: 'publishing',
      url: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/example/',
    });
    vi.mocked(publishApi.list).mockResolvedValue({
      publishes: [],
    });
    vi.mocked(publishApi.setLatest).mockResolvedValue({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'publish-1',
        publishedAt: '2026-02-09T10:00:00.000Z',
        hasUnpublishedChanges: false,
      },
    });
    vi.mocked(pagesApi.duplicate).mockResolvedValue({
      page_id: 'page-home-copy',
    });
  });

  it('shows a success toast when duplicating a page', async () => {
    renderScreen();
    await screen.findAllByRole('button', { name: 'Duplicate' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]);

    await waitFor(() => {
      expect(pagesApi.duplicate).toHaveBeenCalledWith('project-1', 'page-home');
    });

    await waitFor(() => {
      expect(appToast.success).toHaveBeenCalledWith(
        'Duplicated "Home"',
        expect.objectContaining({
          eventKey: 'page-duplicated:project-1:page-home',
        }),
      );
    });
  });

  it('shows API error message toast on delete version conflict', async () => {
    vi.mocked(pagesApi.remove).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'VERSION_CONFLICT',
        message: 'Page changed elsewhere',
      }),
    );

    renderScreen();
    await screen.findAllByRole('button', { name: 'Delete' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(pagesApi.remove).toHaveBeenCalledWith('project-1', 'page-home', 1);
    });

    await waitFor(() => {
      expect(appToast.error).toHaveBeenCalledWith(
        'This page was modified elsewhere. Please reload.',
        expect.objectContaining({
          eventKey: 'page-delete-conflict:project-1:page-home',
        }),
      );
    });
  });

  it('shows a friendly network error message when an API call fails due to network', async () => {
    vi.mocked(pagesApi.duplicate).mockRejectedValue(new TypeError('Failed to fetch'));

    renderScreen();
    await screen.findAllByRole('button', { name: 'Duplicate' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]);

    await waitFor(() => {
      expect(appToast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.',
        expect.objectContaining({
          eventKey: 'page-duplicate-error:project-1:page-home',
        }),
      );
    });
  });

  it('disables delete when project has only one page and shows a hint', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({
      pages: [pages[0]],
    });

    renderScreen();
    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete' });

    expect((deleteButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(deleteButtons[0].getAttribute('title')).toBe('Cannot delete the only page in a project.');
    expect(screen.getByText('Delete is disabled because a project must keep at least one page.')).not.toBeNull();
  });

  it('disables publish button while publishing is in progress', async () => {
    vi.mocked(publishApi.create).mockResolvedValue({
      publishId: 'publish-2',
      status: 'publishing',
      url: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/example/',
    });

    renderScreen();
    const publishButton = await screen.findByRole('button', { name: 'Publish' });

    fireEvent.click(publishButton);

    const publishingButton = await screen.findByRole('button', { name: 'Publishing...' });
    expect((publishingButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows preflight errors and does not enter polling state when publish preflight fails', async () => {
    vi.mocked(publishApi.create).mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'PUBLISH_PREFLIGHT_FAILED',
        message: 'Publish preflight validation failed',
        details: ['Exactly one home page is required, but none was found.', 'Duplicate slug "about" found on 2 pages.'],
      }),
    );

    renderScreen();
    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    fireEvent.click(publishButton);

    expect(await screen.findByText('Fix before publishing')).not.toBeNull();
    expect(screen.getByText('Exactly one home page is required, but none was found.')).not.toBeNull();
    expect(screen.getByText('Duplicate slug "about" found on 2 pages.')).not.toBeNull();

    expect(screen.queryByRole('button', { name: 'Publishing...' })).toBeNull();
    expect(publishApi.getStatus).not.toHaveBeenCalled();

    const blockedPublishButton = screen.getByRole('button', { name: 'Publish' });
    expect((blockedPublishButton as HTMLButtonElement).disabled).toBe(true);

    await waitFor(() => {
      expect(appToast.error).toHaveBeenCalledWith(
        'Fix publish issues before publishing',
        expect.objectContaining({
          eventKey: 'publish-preflight-error:project-1',
        }),
      );
    });
  });

  it('disables set home action for the current home page', async () => {
    renderScreen();
    const setHomeButtons = await screen.findAllByRole('button', { name: 'Set as Home' });

    expect((setHomeButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(setHomeButtons[0].getAttribute('title')).toBe('This page is already the home page.');
  });

  it('does not show home-missing badge when legacy fallback finds Home page', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({
      pages: [
        {
          id: 'page-home',
          title: 'Home',
          slug: 'home',
          isHome: false,
          version: 1,
        },
      ],
    });

    renderScreen();

    await screen.findByRole('button', { name: 'Publish' });
    expect(screen.queryByText('Home page missing')).toBeNull();
  });

  it('does not show home-missing badge when project.homePageId points to an existing page', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({
      pages: [
        {
          id: 'page-about',
          title: 'About',
          slug: '/about',
          isHome: false,
          version: 1,
        },
      ],
    });
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'draft',
        defaultLocale: 'en',
        homePageId: 'page-about',
        latestPublishId: null,
        publishedAt: null,
        hasUnpublishedChanges: true,
      },
    });

    renderScreen();

    await screen.findByRole('button', { name: 'Publish' });
    expect(screen.queryByText('Home page missing')).toBeNull();
  });

  it('shows home-missing badge when project.homePageId points to a missing page', async () => {
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'draft',
        defaultLocale: 'en',
        homePageId: 'missing-page-id',
        latestPublishId: null,
        publishedAt: null,
        hasUnpublishedChanges: true,
      },
    });

    renderScreen();

    expect(await screen.findByText('Home page missing')).not.toBeNull();
  });

  it('shows home-missing badge when project has zero pages', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({ pages: [] });

    renderScreen();

    expect(await screen.findByText('Home page missing')).not.toBeNull();
  });

  it('shows published root and subpage links with index.html by default and copies those URLs', async () => {
    const publishedBaseUrl = 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/';
    vi.mocked(publishApi.create).mockResolvedValue({
      publishId: 'publish-1',
      status: 'live',
      url: publishedBaseUrl,
    });

    renderScreen();

    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    fireEvent.click(publishButton);

    const homePageUrl = `${publishedBaseUrl}index.html`;
    const homeLink = await screen.findByRole('link', { name: 'Open published site' });
    expect(homeLink.getAttribute('href')).toBe(homePageUrl);

    const aboutPageUrl = `${publishedBaseUrl}about/index.html`;
    const aboutLink = await screen.findByRole('link', { name: aboutPageUrl });
    expect(aboutLink.getAttribute('href')).toBe(aboutPageUrl);

    expect(screen.getAllByText(/index\.html/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Copy URL' }));
    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(homePageUrl);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy About URL' }));
    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(aboutPageUrl);
    });
  });

  it('shows index.html subpage links when publish URL uses proxy port', async () => {
    const proxyPublishedBaseUrl = 'http://localhost:8080/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/';
    vi.mocked(publishApi.create).mockResolvedValue({
      publishId: 'publish-1',
      status: 'live',
      url: proxyPublishedBaseUrl,
    });

    renderScreen();

    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    fireEvent.click(publishButton);

    const homeLink = await screen.findByRole('link', { name: 'Open published site' });
    expect(homeLink.getAttribute('href')).toBe(`${proxyPublishedBaseUrl}index.html`);

    const aboutPageUrl = `${proxyPublishedBaseUrl}about/index.html`;
    const aboutLink = await screen.findByRole('link', { name: aboutPageUrl });
    expect(aboutLink.getAttribute('href')).toBe(aboutPageUrl);
  });

  it('maps slug "home" to root index.html for published page URLs', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({
      pages: [
        {
          id: 'page-home',
          title: 'Home',
          slug: 'home',
          isHome: false,
          version: 1,
        },
        {
          id: 'page-about',
          title: 'About',
          slug: 'about',
          isHome: false,
          version: 1,
        },
      ],
    });

    const publishedBaseUrl = 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-home-slug/';
    vi.mocked(publishApi.create).mockResolvedValue({
      publishId: 'publish-home-slug',
      status: 'live',
      url: publishedBaseUrl,
    });

    renderScreen();

    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    fireEvent.click(publishButton);

    const expectedHomeUrl = `${publishedBaseUrl}index.html`;
    const homeUrlLink = await screen.findByRole('link', { name: expectedHomeUrl });
    expect(homeUrlLink.getAttribute('href')).toBe(expectedHomeUrl);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Home URL' }));
    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(expectedHomeUrl);
    });
  });

  it('shows Live (up to date) status and link on initial render when latest publish exists', async () => {
    const latestUrl = 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-2/';
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'publish-2',
        publishedAt: '2026-02-08T10:00:00.000Z',
        hasUnpublishedChanges: false,
      },
    });
    vi.mocked(publishApi.getStatus).mockResolvedValueOnce({
      publishId: 'publish-2',
      status: 'live',
      url: latestUrl,
    });

    renderScreen();

    const status = await screen.findByText('Live (up to date)');
    expect(status).not.toBeNull();
    expect(projectsApi.get).toHaveBeenCalledWith('project-1');
    expect(publishApi.getStatus).toHaveBeenCalledWith('project-1', 'publish-2');

    const homeLink = await screen.findByRole('link', { name: 'Open published site' });
    expect(homeLink.getAttribute('href')).toBe(`${latestUrl}index.html`);
  });

  it('disables publish action when live site is up to date', async () => {
    const latestUrl = 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-2/';
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'publish-2',
        publishedAt: '2026-02-08T10:00:00.000Z',
        hasUnpublishedChanges: false,
      },
    });
    vi.mocked(publishApi.getStatus).mockResolvedValueOnce({
      publishId: 'publish-2',
      status: 'live',
      url: latestUrl,
    });

    renderScreen();

    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    expect((publishButton as HTMLButtonElement).disabled).toBe(true);
    expect(publishButton.getAttribute('title')).toBe('No unpublished changes to publish.');
  });

  it('shows Not published on initial render when latest publish is null', async () => {
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'draft',
        defaultLocale: 'en',
        latestPublishId: null,
        publishedAt: null,
        hasUnpublishedChanges: true,
      },
    });

    renderScreen();

    const status = await screen.findByText('Not published');
    expect(status).not.toBeNull();
  });

  it('updates to Live (up to date) when a publish completes', async () => {
    const latestUrl = 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-3/';
    vi.mocked(projectsApi.get)
      .mockResolvedValueOnce({
        project: {
          id: 'project-1',
          name: 'Main site',
          status: 'draft',
          defaultLocale: 'en',
          latestPublishId: null,
          publishedAt: null,
          hasUnpublishedChanges: true,
        },
      })
      .mockResolvedValueOnce({
        project: {
          id: 'project-1',
          name: 'Main site',
          status: 'published',
          defaultLocale: 'en',
          latestPublishId: 'publish-3',
          publishedAt: '2026-02-08T11:00:00.000Z',
          hasUnpublishedChanges: false,
        },
      });

    vi.mocked(publishApi.getStatus).mockImplementation(async (_projectId: string, publishId: string) => {
      if (publishId === 'publish-3') {
        return {
          publishId: 'publish-3',
          status: 'live',
          url: latestUrl,
        };
      }
      return {
        publishId: 'publish-3',
        status: 'publishing',
        url: latestUrl,
      };
    });

    vi.mocked(publishApi.create).mockResolvedValue({
      publishId: 'publish-3',
      status: 'publishing',
      url: latestUrl,
    });

    renderScreen();
    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Live (up to date)')).not.toBeNull();
    });

    await waitFor(() => {
      expect(projectsApi.get).toHaveBeenCalledTimes(2);
    });

    const homeLink = await screen.findByRole('link', { name: 'Open published site' });
    expect(homeLink.getAttribute('href')).toBe(`${latestUrl}index.html`);
  });

  it('shows Live (outdated) and republish CTA when backend reports unpublished changes', async () => {
    vi.mocked(pagesApi.list).mockResolvedValueOnce({
      pages: [
        {
          id: 'page-home',
          title: 'Home',
          slug: '/',
          isHome: true,
          version: 2,
          updatedAt: '2026-02-09T12:00:00.000Z',
        },
      ],
    });

    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'publish-10',
        publishedAt: '2026-02-09T11:00:00.000Z',
        hasUnpublishedChanges: true,
      },
    });
    vi.mocked(publishApi.getStatus).mockResolvedValueOnce({
      publishId: 'publish-10',
      status: 'live',
      url: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-10/',
    });

    renderScreen();

    const status = await screen.findByText('Live (outdated) • Unpublished changes');
    expect(status).not.toBeNull();

    const republishButton = await screen.findByRole('button', { name: 'Republish to update live site' });
    expect((republishButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders publish history empty state', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [],
    });

    renderScreen();

    expect(await screen.findByText('Publish History')).not.toBeNull();
    expect(await screen.findByText('No publishes yet')).not.toBeNull();
  });

  it('renders publish history rows with created time and status', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-1',
          status: 'live',
          createdAt: '2026-02-09T10:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-1/',
        },
        {
          publishId: 'pub-2',
          status: 'failed',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-2/',
        },
      ],
    });

    renderScreen();

    expect((await screen.findAllByText(/Created:/)).length).toBe(2);
    expect(screen.getByText('live')).not.toBeNull();
    expect(screen.getByText('failed')).not.toBeNull();
  });

  it('copy button in publish history copies index.html URL', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-copy',
          status: 'live',
          createdAt: '2026-02-09T10:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-copy/',
        },
      ],
    });

    renderScreen();

    const copyButton = await screen.findByRole('button', { name: 'Copy publish URL pub-copy' });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-copy/index.html',
      );
    });
  });

  it('open link in publish history points to index.html URL', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-open',
          status: 'live',
          createdAt: '2026-02-09T10:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-open/',
        },
      ],
    });

    renderScreen();

    const openLink = await screen.findByRole('link', { name: 'Open publish pub-open' });
    expect(openLink.getAttribute('href')).toBe('http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-open/index.html');
  });

  it('live publish row shows Live badge and disabled Make Live button', async () => {
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'pub-live',
        publishedAt: '2026-02-09T10:00:00.000Z',
        hasUnpublishedChanges: false,
      },
    });
    vi.mocked(publishApi.getStatus).mockResolvedValueOnce({
      publishId: 'pub-live',
      status: 'live',
      url: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-live/',
    });
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-live',
          status: 'live',
          createdAt: '2026-02-09T10:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-live/',
        },
        {
          publishId: 'pub-old',
          status: 'live',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-old/',
        },
      ],
    });

    renderScreen();

    const makeLiveButton = await screen.findByRole('button', { name: 'Make live pub-live' });
    expect((makeLiveButton as HTMLButtonElement).disabled).toBe(true);
    expect(await screen.findByLabelText('Live publish pub-live')).not.toBeNull();
  });

  it('clicking Make Live calls API with correct publishId', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-old',
          status: 'live',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-old/',
        },
      ],
    });

    renderScreen();

    const makeLiveButton = await screen.findByRole('button', { name: 'Make live pub-old' });
    fireEvent.click(makeLiveButton);

    await waitFor(() => {
      expect(publishApi.setLatest).toHaveBeenCalledWith('project-1', { publishId: 'pub-old' });
    });
  });

  it('after Make Live success, UI reflects new live publish row', async () => {
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-old',
          status: 'live',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-old/',
        },
      ],
    });

    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: 'pub-old',
        publishedAt: '2026-02-09T11:00:00.000Z',
        hasUnpublishedChanges: false,
      },
    });
    vi.mocked(publishApi.getStatus).mockResolvedValueOnce({
      publishId: 'pub-old',
      status: 'live',
      url: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-old/',
    });
    vi.mocked(publishApi.list).mockResolvedValueOnce({
      publishes: [
        {
          publishId: 'pub-old',
          status: 'live',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-old/',
        },
      ],
    });

    renderScreen();

    const makeLiveButton = await screen.findByRole('button', { name: 'Make live pub-old' });
    fireEvent.click(makeLiveButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Live publish pub-old')).not.toBeNull();
    });
  });

  it('Make Live error shows toast and UI does not crash', async () => {
    vi.mocked(projectsApi.get).mockReset();
    vi.mocked(projectsApi.get).mockResolvedValue({
      project: {
        id: 'project-1',
        name: 'Main site',
        status: 'draft',
        defaultLocale: 'en',
        latestPublishId: null,
        publishedAt: null,
        hasUnpublishedChanges: true,
      },
    });

    vi.mocked(publishApi.list).mockReset();
    vi.mocked(publishApi.list).mockResolvedValue({
      publishes: [
        {
          publishId: 'pub-error',
          status: 'live',
          createdAt: '2026-02-09T09:00:00.000Z',
          baseUrl: 'http://localhost:9000/buildaweb-sites/tenants/default/projects/project-1/publishes/pub-error/',
        },
      ],
    });
    vi.mocked(publishApi.setLatest).mockRejectedValueOnce(
      new ApiError({
        status: 500,
        code: 'SERVER_ERROR',
        message: 'Unable to set latest publish',
      }),
    );

    renderScreen();

    const makeLiveButton = await screen.findByRole('button', { name: 'Make live pub-error' });
    fireEvent.click(makeLiveButton);

    await waitFor(() => {
      expect(appToast.error).toHaveBeenCalledWith(
        'Unable to set latest publish',
        expect.objectContaining({
          eventKey: 'publish-make-live-error:project-1:pub-error',
        }),
      );
    });

    expect(screen.getByText('Publish History')).not.toBeNull();
  });
});
