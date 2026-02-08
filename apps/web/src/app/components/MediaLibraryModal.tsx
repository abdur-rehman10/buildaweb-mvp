import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { assetsApi, ApiError, type ProjectAsset } from '../../lib/api';
import { Button } from './Button';
import { Card } from './Card';

interface MediaLibraryModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSelect: (asset: ProjectAsset) => void;
}

function formatDate(value?: string): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString();
}

export function MediaLibraryModal({ isOpen, projectId, onClose, onSelect }: MediaLibraryModalProps) {
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
    if (!isOpen) return;

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
        const message = err instanceof ApiError ? err.message : 'Failed to load media library';
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Media Library"
    >
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Media Library</h2>
            <p className="text-sm text-muted-foreground">Browse and reuse uploaded images.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-4 overflow-auto max-h-[70vh]">
          {loading && (
            <p className="text-sm text-muted-foreground" role="status">
              Loading media library...
            </p>
          )}

          {!loading && error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && sortedAssets.length === 0 && (
            <p className="text-sm text-muted-foreground">No uploaded images yet.</p>
          )}

          {!loading && !error && sortedAssets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="border rounded-md overflow-hidden text-left hover:border-primary"
                  onClick={() => onSelect(asset)}
                >
                  <img
                    src={asset.publicUrl}
                    alt={asset.fileName}
                    className="w-full h-32 object-cover bg-muted"
                    loading="lazy"
                  />
                  <div className="p-2 space-y-1">
                    <p className="text-sm font-medium truncate">{asset.fileName}</p>
                    <p className="text-xs text-muted-foreground">Uploaded: {formatDate(asset.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
