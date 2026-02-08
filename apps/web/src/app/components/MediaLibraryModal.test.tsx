import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaLibraryModal } from './MediaLibraryModal';
import { assetsApi } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  assetsApi: {
    list: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status = 500;
    code = 'ERROR';
  },
}));

describe('MediaLibraryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('fetches and displays asset thumbnails when opened', async () => {
    vi.mocked(assetsApi.list).mockResolvedValue({
      assets: [
        {
          id: 'asset-1',
          fileName: 'hero.jpg',
          size: 2048,
          publicUrl: 'https://cdn.example.com/hero.jpg',
          createdAt: '2026-02-08T08:00:00.000Z',
        },
      ],
    });

    render(
      <MediaLibraryModal
        isOpen
        projectId="project-1"
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );

    expect(screen.queryByText('Loading media library...')).not.toBeNull();
    expect(await screen.findByAltText('hero.jpg')).not.toBeNull();
    expect(screen.queryByText('hero.jpg')).not.toBeNull();
  });

  it('renders error state when assets loading fails', async () => {
    vi.mocked(assetsApi.list).mockRejectedValue(new Error('Load failed'));

    render(
      <MediaLibraryModal
        isOpen
        projectId="project-1"
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Failed to load media library');
    });
  });

  it('calls onSelect with selected asset publicUrl', async () => {
    vi.mocked(assetsApi.list).mockResolvedValue({
      assets: [
        {
          id: 'asset-1',
          fileName: 'hero.jpg',
          size: 2048,
          publicUrl: 'https://cdn.example.com/hero.jpg',
          createdAt: '2026-02-08T08:00:00.000Z',
        },
      ],
    });

    const onSelect = vi.fn();

    render(
      <MediaLibraryModal
        isOpen
        projectId="project-1"
        onClose={() => {}}
        onSelect={onSelect}
      />,
    );

    const cardButton = await screen.findByRole('button', { name: /hero\.jpg/i });
    fireEvent.click(cardButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        publicUrl: 'https://cdn.example.com/hero.jpg',
      }),
    );
  });
});
