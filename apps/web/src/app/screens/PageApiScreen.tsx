import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, pagesApi } from '../../lib/api';

interface PageApiScreenProps {
  projectId: string;
  onBackToProjects: () => void;
}

export function PageApiScreen({ projectId, onBackToProjects }: PageApiScreenProps) {
  const [pageId, setPageId] = useState('');
  const [version, setVersion] = useState(1);
  const [editorJsonText, setEditorJsonText] = useState('{}');

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
      setEditorJsonText(JSON.stringify(page.editorJson ?? {}, null, 2));
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

    let parsed: Record<string, unknown>;
    try {
      const value = JSON.parse(editorJsonText) as unknown;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        setMessage('Editor JSON must be a JSON object');
        return;
      }
      parsed = value as Record<string, unknown>;
    } catch {
      setMessage('Editor JSON is not valid JSON');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await pagesApi.update(projectId, pageId.trim(), {
        page: parsed,
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

        <div>
          <label className="block text-sm font-medium mb-2">editorJson (temporary textarea)</label>
          <textarea
            className="w-full min-h-[320px] p-3 rounded-md border border-input bg-input-background font-mono text-sm"
            value={editorJsonText}
            onChange={(e) => setEditorJsonText(e.target.value)}
          />
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
