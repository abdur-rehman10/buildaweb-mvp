import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsApiScreen } from './ProjectsApiScreen';
import { ApiError, navigationApi, pagesApi, projectsApi, publishApi } from '../../lib/api';
import { appToast } from '../../lib/toast';

vi.mock('../../lib/api', () => {
  class MockApiError extends Error {
    status: number;
    code: string;

    constructor(params: { status: number; code: string; message: string }) {
      super(params.message);
      this.name = 'ApiError';
      this.status = params.status;
      this.code = params.code;
    }
  }

  return {
    ApiError: MockApiError,
    projectsApi: {
      list: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
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
      getStatus: vi.fn(),
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
    />,
  );
}

describe('ProjectsApiScreen toasts', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(projectsApi.list).mockResolvedValue({
      projects: [project],
    });
    vi.mocked(pagesApi.list).mockResolvedValue({
      pages,
    });
    vi.mocked(navigationApi.get).mockResolvedValue({
      items: [],
    });
    vi.mocked(publishApi.getStatus).mockResolvedValue({
      publishId: 'publish-1',
      status: 'publishing',
      url: 'http://localhost:9000/buildaweb-sites/example/',
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
      url: 'http://localhost:9000/buildaweb-sites/example/',
    });

    renderScreen();
    const publishButton = await screen.findByRole('button', { name: 'Publish' });

    fireEvent.click(publishButton);

    const publishingButton = await screen.findByRole('button', { name: 'Publishing...' });
    expect((publishingButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables set home action for the current home page', async () => {
    renderScreen();
    const setHomeButtons = await screen.findAllByRole('button', { name: 'Set as Home' });

    expect((setHomeButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(setHomeButtons[0].getAttribute('title')).toBe('This page is already the home page.');
  });
});
