import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RendererStub } from './RendererStub';

describe('RendererStub image actions', () => {
  it('opens media library callback when clicking Media Library button', () => {
    const onOpenMediaLibrary = jest.fn();

    render(
      <RendererStub
        value={{
          sections: [
            {
              id: 'section-1',
              type: 'hero',
              blocks: [
                {
                  id: 'block-1',
                  nodes: [{ id: 'node-image-1', type: 'image', asset_ref: null }],
                },
              ],
            },
          ],
        }}
        onChange={() => {}}
        assetsById={{}}
        projectPages={[]}
        onUploadImage={async () => ({ assetId: 'asset-1', publicUrl: 'https://cdn.example.com/image.jpg' })}
        onOpenMediaLibrary={onOpenMediaLibrary}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Media Library' }));
    expect(onOpenMediaLibrary).toHaveBeenCalledWith('node-image-1');
  });
});
