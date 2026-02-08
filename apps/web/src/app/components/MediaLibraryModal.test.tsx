import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MediaLibraryModal } from './MediaLibraryModal';
import { assetsApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  assetsApi: {
    list: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status = 500;
    code = 'ERROR';
  },
}));

describe('MediaLibraryModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays asset thumbnails when opened', async () => {
    (assetsApi.list as jest.Mock).mockResolvedValue({
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
    (assetsApi.list as jest.Mock).mockRejectedValue(new Error('Load failed'));

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
      expect(alert.textContent).toContain('Load failed');
    });
  });

  it('calls onSelect with selected asset publicUrl', async () => {
    (assetsApi.list as jest.Mock).mockResolvedValue({
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

    const onSelect = jest.fn();

    render(
      <MediaLibraryModal
        isOpen
        projectId="project-1"
        onClose={() => {}}
        onSelect={onSelect}
      />,
    );

    const thumbnail = await screen.findByAltText('hero.jpg');
    fireEvent.click(thumbnail);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        publicUrl: 'https://cdn.example.com/hero.jpg',
      }),
    );
  });
});
