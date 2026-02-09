import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { assetsApi, type ProjectAsset } from '../../lib/api';
import { appToast } from '../../lib/toast';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';

interface MediaLibraryProps {
  projectId: string | null;
  onBack: () => void;
}

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

function formatBytes(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 'Unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ projectId, onBack }: MediaLibraryProps) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedAssets = useMemo(
    () =>
      [...assets].sort((a, b) => {
        const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTs - aTs;
      }),
    [assets],
  );

  useEffect(() => {
    if (!projectId) {
      setAssets([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    assetsApi
      .list(projectId)
      .then((res) => {
        if (cancelled) return;
        setAssets(res.assets);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = getUserFriendlyErrorMessage(err, 'Failed to load assets');
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const copyUrl = async (asset: ProjectAsset) => {
    try {
      await navigator.clipboard.writeText(asset.publicUrl);
      appToast.success('Asset URL copied', {
        eventKey: `asset-url-copied:${projectId ?? 'unknown'}:${asset.id}`,
      });
    } catch {
      appToast.error('Failed to copy asset URL', {
        eventKey: `asset-url-copy-error:${projectId ?? 'unknown'}:${asset.id}`,
      });
    }
  };

  if (!projectId) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Assets Library</h1>
        <p className="text-sm text-muted-foreground">
          Select a project first to view its assets library.
        </p>
        <Button type="button" onClick={onBack}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Assets Library</h1>
          <p className="text-sm text-muted-foreground">
            Browse uploaded images and reuse them from page image pickers.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Projects
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground" role="status">
          Loading assets...
        </p>
      )}

      {!loading && error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && sortedAssets.length === 0 && (
        <p className="text-sm text-muted-foreground">No assets yet. Upload an image in the editor to see it here.</p>
      )}

      {!loading && !error && sortedAssets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedAssets.map((asset) => (
            <Card key={asset.id} className="p-3 space-y-3">
              <img
                src={asset.publicUrl}
                alt={asset.fileName}
                className="w-full h-36 object-cover rounded-md bg-muted"
                loading="lazy"
              />
              <div className="space-y-1 text-sm">
                <p className="font-medium break-all">{asset.fileName}</p>
                <p className="text-muted-foreground">Created: {formatDate(asset.createdAt)}</p>
                <p className="text-muted-foreground">Type: {asset.mimeType || 'Unknown'}</p>
                <p className="text-muted-foreground">Size: {formatBytes(asset.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={asset.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline text-primary"
                >
                  Open
                </a>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyUrl(asset)}>
                  Copy URL
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
