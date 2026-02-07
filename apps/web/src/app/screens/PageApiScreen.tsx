import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, assetsApi, pagesApi } from '../../lib/api';
import { RendererStub } from '../../editor/RendererStub';
import { addSection, type SectionPresetType, updateImageNodeAssetRefById } from '../../editor/sectionHelpers';

interface PageApiScreenProps {
  projectId: string;
  pageId: string | null;
  onPageIdChange: (pageId: string | null) => void;
  onBackToProjects: () => void;
}

export function PageApiScreen({ projectId, pageId, onPageIdChange, onBackToProjects }: PageApiScreenProps) {
  const [pageIdInput, setPageIdInput] = useState(pageId ?? '');
  const [pageTitleInput, setPageTitleInput] = useState('');
  const [pageSlugInput, setPageSlugInput] = useState('');
  const [version, setVersion] = useState(1);
  const [editorJson, setEditorJson] = useState<Record<string, unknown>>({});
  const [assetsById, setAssetsById] = useState<Record<string, string>>({});
  const [presetType, setPresetType] = useState<SectionPresetType>('hero');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string | null>(null);
  const [previewHash, setPreviewHash] = useState<string | null>(null);
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
      setPageTitleInput(typeof page.title === 'string' ? page.title : '');
      setPageSlugInput(typeof page.slug === 'string' ? page.slug : '');
      const json = page.editorJson;
      setEditorJson(
        typeof json === 'object' && json !== null && !Array.isArray(json)
          ? (json as Record<string, unknown>)
          : {},
      );
      setAssetsById({});
      onPageIdChange(targetPageId);
      setMessage('Page loaded');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const copyPageId = async () => {
    const targetPageId = pageIdInput.trim();
    if (!targetPageId) return;

    try {
      await navigator.clipboard.writeText(targetPageId);
      setMessage('Page ID copied');
    } catch {
      setMessage('Failed to copy page ID');
    }
  };

  const saveMeta = async () => {
    const targetPageId = pageIdInput.trim();
    const title = pageTitleInput.trim();
    const slug = pageSlugInput.trim();

    if (!targetPageId || !title || !slug) {
      setMessage('Title and slug are required');
      return;
    }

    setMetaSaving(true);
    setMessage(null);
    try {
      const res = await pagesApi.updateMeta(projectId, targetPageId, { title, slug });
      setPageTitleInput(res.page.title);
      setPageSlugInput(res.page.slug);
      setVersion(res.page.version);
      setMessage('Page metadata saved');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to save page metadata');
    } finally {
      setMetaSaving(false);
    }
  };

  const duplicatePage = async () => {
    const targetPageId = pageIdInput.trim();
    if (!targetPageId) return;

    const duplicateTitle = window.prompt('New page title', `${pageTitleInput || 'Untitled'} Copy`);
    if (duplicateTitle === null) return;

    const duplicateSlug = window.prompt('New page slug', `${pageSlugInput || 'page'}-copy`);
    if (duplicateSlug === null) return;

    const title = duplicateTitle.trim();
    const slug = duplicateSlug.trim();
    if (!title || !slug) {
      setMessage('Duplicate requires title and slug');
      return;
    }

    setDuplicating(true);
    setMessage(null);
    try {
      const res = await pagesApi.duplicate(projectId, targetPageId, { title, slug });
      onPageIdChange(res.page_id);
      setPageIdInput(res.page_id);
      await loadPage(res.page_id);
      setMessage('Page duplicated');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to duplicate page');
    } finally {
      setDuplicating(false);
    }
  };

  const deletePage = async () => {
    const targetPageId = pageIdInput.trim();
    if (!targetPageId) return;

    const confirmed = window.confirm('Delete this page?');
    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);
    try {
      await pagesApi.remove(projectId, targetPageId);
      const lastKey = `baw_last_page_${projectId}`;
      if (window.localStorage.getItem(lastKey) === targetPageId) {
        window.localStorage.removeItem(lastKey);
      }
      onPageIdChange(null);
      onBackToProjects();
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to delete page');
    } finally {
      setDeleting(false);
    }
  };

  const previewPage = async () => {
    const targetPageId = pageIdInput.trim();
    if (!targetPageId) return;

    setPreviewLoading(true);
    setMessage(null);
    try {
      const preview = await pagesApi.preview(projectId, targetPageId);
      setPreviewHash(preview.hash);
      setPreviewSrcDoc(`<!doctype html><html><head><meta charset="utf-8"><style>${preview.css}</style></head><body>${preview.html}</body></html>`);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const uploadImageForNode = async (_nodeId: string, file: File) => {
    const nodeId = _nodeId;
    try {
      const uploaded = await assetsApi.upload(projectId, file);
      setAssetsById((prev) => ({ ...prev, [uploaded.assetId]: uploaded.publicUrl }));
      setEditorJson((prev) => updateImageNodeAssetRefById(prev, nodeId, uploaded.assetId, uploaded.publicUrl));
      return uploaded;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setMessage(apiError?.message ?? 'Failed to upload image');
      throw err;
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyPageId} disabled={!pageIdInput.trim()}>
            Copy pageId
          </Button>
          <Button variant="outline" onClick={onBackToProjects}>
            Back to Projects
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input
            label="Title"
            value={pageTitleInput}
            onChange={(e) => setPageTitleInput(e.target.value)}
            placeholder="Page title"
          />
          <Input
            label="Slug"
            value={pageSlugInput}
            onChange={(e) => setPageSlugInput(e.target.value)}
            placeholder="page-slug"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void saveMeta()}
            disabled={metaSaving || !pageIdInput.trim()}
          >
            {metaSaving ? 'Saving...' : 'Save Meta'}
          </Button>
        </div>

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
          <RendererStub
            value={editorJson}
            onChange={setEditorJson}
            assetsById={assetsById}
            onUploadImage={uploadImageForNode}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => void savePage()} disabled={saving || !pageIdInput.trim()}>
            {saving ? 'Saving...' : 'Save Page'}
          </Button>
          <Button variant="outline" onClick={() => void previewPage()} disabled={previewLoading || !pageIdInput.trim()}>
            {previewLoading ? 'Loading Preview...' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={() => void loadPage()} disabled={loading || !pageIdInput.trim()}>
            Reload
          </Button>
          <Button variant="outline" onClick={() => void duplicatePage()} disabled={duplicating || !pageIdInput.trim()}>
            {duplicating ? 'Duplicating...' : 'Duplicate Page'}
          </Button>
          <Button variant="destructive" onClick={() => void deletePage()} disabled={deleting || !pageIdInput.trim()}>
            {deleting ? 'Deleting...' : 'Delete Page'}
          </Button>
        </div>

        {message && (
          <p className="text-sm" role="alert">
            {message}
          </p>
        )}

        {previewHash && (
          <p className="text-xs text-muted-foreground">
            Preview hash: {previewHash}
          </p>
        )}

        {previewSrcDoc && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Preview</label>
            <iframe
              title="Page Preview"
              srcDoc={previewSrcDoc}
              className="w-full min-h-[420px] border rounded-md bg-white"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
