import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageApiScreen } from './PageApiScreen';
import { assetsApi, pagesApi } from '../../lib/api';
import { appToast } from '../../lib/toast';

vi.mock('../../editor/RendererStub', () => ({
  RendererStub: ({ value }: { value: Record<string, unknown> }) => (
    <div data-testid="renderer-stub">{JSON.stringify(value)}</div>
  ),
}));

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
    pagesApi: {
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      updateMeta: vi.fn(),
      duplicate: vi.fn(),
      remove: vi.fn(),
      preview: vi.fn(),
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

function renderScreen() {
  return render(
    <PageApiScreen
      projectId="project-1"
      pageId="page-1"
      onPageIdChange={() => {}}
      onBackToProjects={() => {}}
    />,
  );
}

describe('PageApiScreen SEO panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(pagesApi.list).mockResolvedValue({
      pages: [
        {
          id: 'page-1',
          title: 'Home',
          slug: '/',
          isHome: true,
          version: 3,
        },
      ],
    });

    vi.mocked(pagesApi.get).mockResolvedValue({
      page: {
        id: 'page-1',
        title: 'Home',
        slug: '/',
        isHome: true,
        editorJson: {},
        seoJson: {
          title: 'Initial SEO Title',
          description: 'Initial SEO Description',
        },
        version: 3,
      },
    });

    vi.mocked(pagesApi.update).mockResolvedValue({
      page_id: 'page-1',
      version: 4,
    });

    vi.mocked(assetsApi.resolve).mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders existing seoJson values', async () => {
    renderScreen();

    expect(await screen.findByDisplayValue('Initial SEO Title')).not.toBeNull();
    expect(screen.getByDisplayValue('Initial SEO Description')).not.toBeNull();
    expect(screen.getByText('Meta Description')).not.toBeNull();
  });

  it('saves seoJson via pages update payload', async () => {
    renderScreen();
    await screen.findByDisplayValue('Initial SEO Title');

    fireEvent.change(screen.getByPlaceholderText('SEO title'), {
      target: { value: 'New SEO Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('Meta description'), {
      target: { value: 'New SEO Description' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Page' }));

    await waitFor(() => {
      expect(pagesApi.update).toHaveBeenCalledWith(
        'project-1',
        'page-1',
        expect.objectContaining({
          version: 3,
          seoJson: {
            title: 'New SEO Title',
            description: 'New SEO Description',
          },
        }),
      );
    });
  });

  it('shows success toast after saving page with seo', async () => {
    renderScreen();
    await screen.findByDisplayValue('Initial SEO Title');

    fireEvent.click(screen.getByRole('button', { name: 'Save Page' }));

    await waitFor(() => {
      expect(appToast.success).toHaveBeenCalledWith(
        'Page saved',
        expect.objectContaining({
          eventKey: 'page-saved:project-1:page-1:4',
        }),
      );
    });
  });
});
