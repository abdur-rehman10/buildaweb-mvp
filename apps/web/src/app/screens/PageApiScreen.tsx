import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, pagesApi } from '../../lib/api';
import { RendererStub } from '../../editor/RendererStub';

interface PageApiScreenProps {
  projectId: string;
  onBackToProjects: () => void;
}

export function PageApiScreen({ projectId, onBackToProjects }: PageApiScreenProps) {
  const [pageId, setPageId] = useState('');
  const [version, setVersion] = useState(1);
  const [editorJson, setEditorJson] = useState<Record<string, unknown>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPage = async () => {
    if (!pageId.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await pagesApi.get(projectId, pageId.trim());
      const page = res.page;
      setVersion(page.version);
      const json = page.editorJson;
      setEditorJson(
        typeof json === 'object' && json !== null && !Array.isArray(json)
          ? (json as Record<string, unknown>)
          : {},
      );
      setMessage('Page loaded');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    if (!pageId.trim()) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await pagesApi.update(projectId, pageId.trim(), {
        page: editorJson,
        version,
      });
      setVersion(res.version);
      setMessage('Page saved');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      if (apiError?.status === 409 || apiError?.code === 'VERSION_CONFLICT') {
        setMessage('This page was changed elsewhere. Reload required.');
        return;
      }
      setMessage(apiError?.message ?? 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page JSON</h1>
          <p className="text-muted-foreground">Project ID: {projectId}</p>
        </div>
        <Button variant="outline" onClick={onBackToProjects}>
          Back to Projects
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input
            label="Page ID"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="Paste page id"
          />
          <Input label="Version" value={String(version)} disabled />
          <Button onClick={() => void loadPage()} disabled={loading || !pageId.trim()}>
            {loading ? 'Loading...' : 'Load Page'}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Renderer stub (click text nodes to edit)</label>
          <RendererStub value={editorJson} onChange={setEditorJson} />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => void savePage()} disabled={saving || !pageId.trim()}>
            {saving ? 'Saving...' : 'Save Page'}
          </Button>
          <Button variant="outline" onClick={() => void loadPage()} disabled={loading || !pageId.trim()}>
            Reload
          </Button>
        </div>

        {message && (
          <p className="text-sm" role="alert">
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}
