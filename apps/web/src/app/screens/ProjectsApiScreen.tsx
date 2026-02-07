import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ApiError, pagesApi, projectsApi, type ProjectSummary } from '../../lib/api';

interface ProjectsApiScreenProps {
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onOpenPage: (projectId: string, pageId: string) => void;
}

type ProjectPageListItem = {
  id: string;
  title?: string;
  slug?: string;
};

function toPageList(value: unknown): ProjectPageListItem[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const record = item as Record<string, unknown>;
      const idRaw = record.id ?? record._id;
      const id = typeof idRaw === 'string' ? idRaw : typeof idRaw === 'number' ? String(idRaw) : '';
      if (!id) return null;

      return {
        id,
        title: typeof record.title === 'string' ? record.title : undefined,
        slug: typeof record.slug === 'string' ? record.slug : undefined,
      };
    })
    .filter((item): item is ProjectPageListItem => item !== null);
}

export function ProjectsApiScreen({ activeProjectId, onSelectProject, onOpenPage }: ProjectsApiScreenProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [defaultLocale, setDefaultLocale] = useState('en');

  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const [lastPageId, setLastPageId] = useState<string | null>(null);
  const [projectPages, setProjectPages] = useState<ProjectPageListItem[] | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list();
      setProjects(res.projects);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    setLoadingProjectDetails(true);
    setError(null);
    try {
      const detail = await projectsApi.get(projectId);
      const detailRecord = detail.project as unknown as Record<string, unknown>;
      setProjectPages(toPageList(detailRecord.pages));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load project details';
      setError(message);
      setProjectPages(null);
    } finally {
      setLoadingProjectDetails(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      setLastPageId(null);
      setProjectPages(null);
      return;
    }

    const stored = window.localStorage.getItem(`baw_last_page_${activeProjectId}`);
    setLastPageId(stored);
    void loadProjectDetails(activeProjectId);
  }, [activeProjectId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await projectsApi.create({
        name: name.trim(),
        defaultLocale: defaultLocale.trim() || 'en',
      });
      setName('');
      await loadProjects();
      onSelectProject(res.project_id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create project';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId || !newPageTitle.trim() || !newPageSlug.trim()) return;

    setCreatingPage(true);
    setError(null);
    try {
      const res = await pagesApi.create(activeProjectId, {
        title: newPageTitle.trim(),
        slug: newPageSlug.trim(),
      });

      window.localStorage.setItem(`baw_last_page_${activeProjectId}`, res.page_id);
      setLastPageId(res.page_id);
      setNewPageTitle('');
      setNewPageSlug('');

      if (projectPages) {
        setProjectPages([
          ...projectPages,
          { id: res.page_id, title: newPageTitle.trim(), slug: newPageSlug.trim() },
        ]);
      }

      onOpenPage(activeProjectId, res.page_id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create page';
      setError(message);
    } finally {
      setCreatingPage(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">List, create, and select your active project.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Website"
            required
          />
          <Input
            label="Default locale"
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            placeholder="en"
          />
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your projects</h2>
          <Button variant="outline" size="sm" onClick={() => void loadProjects()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}

        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-3 border rounded-md flex items-center justify-between ${
                activeProjectId === project.id ? 'border-primary' : 'border-border'
              }`}
            >
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-xs text-muted-foreground">
                  {project.status} • locale: {project.defaultLocale}
                </div>
              </div>
              <Button size="sm" onClick={() => onSelectProject(project.id)}>
                {activeProjectId === project.id ? 'Selected' : 'Select'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {activeProjectId && (
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="font-semibold">Active project pages</h2>
            <p className="text-sm text-muted-foreground">Project ID: {activeProjectId}</p>
          </div>

          <form onSubmit={handleCreatePage} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Input
              label="Page title"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Home"
              required
            />
            <Input
              label="Slug"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="home"
              required
            />
            <Button type="submit" disabled={creatingPage}>
              {creatingPage ? 'Creating...' : 'Create Page'}
            </Button>
          </form>

          {lastPageId && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenPage(activeProjectId, lastPageId)}>
                Open last page
              </Button>
              <span className="text-xs text-muted-foreground">Last page: {lastPageId}</span>
            </div>
          )}

          {loadingProjectDetails && (
            <p className="text-sm text-muted-foreground">Loading project details...</p>
          )}

          {projectPages && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Pages from project response</h3>
              {projectPages.length === 0 && (
                <p className="text-sm text-muted-foreground">No pages returned.</p>
              )}
              {projectPages.map((page) => (
                <div key={page.id} className="border rounded-md p-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{page.title ?? page.id}</div>
                    {page.slug && <div className="text-xs text-muted-foreground">/{page.slug}</div>}
                  </div>
                  <Button size="sm" onClick={() => onOpenPage(activeProjectId, page.id)}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
