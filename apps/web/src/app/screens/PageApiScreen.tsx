import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, pagesApi } from '../../lib/api';
import { RendererStub } from '../../editor/RendererStub';
import { addSection, type SectionPresetType } from '../../editor/sectionHelpers';

interface PageApiScreenProps {
  projectId: string;
  pageId: string | null;
  onPageIdChange: (pageId: string | null) => void;
  onBackToProjects: () => void;
}

export function PageApiScreen({ projectId, pageId, onPageIdChange, onBackToProjects }: PageApiScreenProps) {
  const [pageIdInput, setPageIdInput] = useState(pageId ?? '');
  const [version, setVersion] = useState(1);
  const [editorJson, setEditorJson] = useState<Record<string, unknown>>({});
  const [presetType, setPresetType] = useState<SectionPresetType>('hero');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPageIdInput(pageId ?? '');
  }, [pageId]);

  const loadPage = async (explicitPageId?: string) => {
    const targetPageId = (explicitPageId ?? pageIdInput).trim();
    if (!targetPageId) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await pagesApi.get(projectId, targetPageId);
      const page = res.page;
      setVersion(page.version);
      const json = page.editorJson;
      setEditorJson(
        typeof json === 'object' && json !== null && !Array.isArray(json)
          ? (json as Record<string, unknown>)
          : {},
      );
      onPageIdChange(targetPageId);
      setMessage('Page loaded');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pageId) return;
    void loadPage(pageId);
    // Intentional dependency on pageId/projectId only to trigger navigation-based loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, projectId]);

  const savePage = async () => {
    const targetPageId = pageIdInput.trim();
    if (!targetPageId) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await pagesApi.update(projectId, targetPageId, {
        page: editorJson,
        version,
      });
      setVersion(res.version);
      onPageIdChange(targetPageId);
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
            value={pageIdInput}
            onChange={(e) => setPageIdInput(e.target.value)}
            placeholder="Paste page id"
          />
          <Input label="Version" value={String(version)} disabled />
          <Button onClick={() => void loadPage()} disabled={loading || !pageIdInput.trim()}>
            {loading ? 'Loading...' : 'Load Page'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Add section preset</label>
              <select
                className="h-10 px-3 border rounded-md bg-background"
                value={presetType}
                onChange={(e) => setPresetType(e.target.value as SectionPresetType)}
              >
                <option value="hero">hero</option>
                <option value="features">features</option>
                <option value="cta">cta</option>
                <option value="pricing">pricing</option>
                <option value="contact">contact</option>
                <option value="footer">footer</option>
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditorJson((prev) => addSection(prev, presetType))}
            >
              Add Section
            </Button>
          </div>
          <label className="block text-sm font-medium">Renderer stub (click text nodes to edit)</label>
          <RendererStub value={editorJson} onChange={setEditorJson} />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => void savePage()} disabled={saving || !pageIdInput.trim()}>
            {saving ? 'Saving...' : 'Save Page'}
          </Button>
          <Button variant="outline" onClick={() => void loadPage()} disabled={loading || !pageIdInput.trim()}>
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
