import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ApiError,
  navigationApi,
  pagesApi,
  projectsApi,
  publishApi,
  type PageMetaSummary,
  type NavigationItem,
  type ProjectSummary,
  type PublishStatus,
} from '../../lib/api';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';
import { appToast } from '../../lib/toast';

interface ProjectsApiScreenProps {
  activeProjectId: string | null;
  activePageId: string | null;
  onSelectActivePageId: (pageId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onOpenPage: (projectId: string, pageId: string) => void;
}

function normalizePublishedBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function toPublishedDisplayBaseUrl(baseUrl: string): string {
  const normalizedBase = normalizePublishedBaseUrl(baseUrl);
  const proxyBase = (import.meta.env.VITE_PRETTY_URL_PROXY_BASE_URL as string | undefined)?.trim();
  if (!proxyBase) return normalizedBase;

  try {
    const originalUrl = new URL(normalizedBase);
    const proxyUrl = new URL(proxyBase.endsWith('/') ? proxyBase : `${proxyBase}/`);
    return `${proxyUrl.origin}${originalUrl.pathname}`;
  } catch {
    return normalizedBase;
  }
}

function shouldUsePrettySubpageUrls(displayBaseUrl: string): boolean {
  const envPrettyUrls = parseBooleanEnv(import.meta.env.VITE_PUBLISH_PRETTY_SUBPAGE_URLS as string | undefined);
  if (envPrettyUrls) return true;

  try {
    const parsed = new URL(displayBaseUrl);
    return parsed.port === '8080';
  } catch {
    return false;
  }
}

function toPublishedHomeUrl(baseUrl: string): string {
  const normalizedBase = normalizePublishedBaseUrl(baseUrl);
  return `${normalizedBase}index.html`;
}

function normalizePublishedPagePath(params: { slug?: string; isHome?: boolean }) {
  if (params.isHome) return '';
  const raw = (params.slug ?? '').trim();
  if (!raw || raw === '/') return '';
  return `${raw.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
}

function toPublishedPageUrl(params: {
  baseUrl: string;
  page: Pick<PageMetaSummary, 'slug' | 'isHome'>;
  usePrettySubpageUrls: boolean;
}) {
  const { baseUrl, page, usePrettySubpageUrls } = params;
  const normalizedBase = normalizePublishedBaseUrl(baseUrl);
  const pagePath = normalizePublishedPagePath({
    slug: page.slug,
    isHome: page.isHome,
  });
  if (!pagePath) {
    return toPublishedHomeUrl(normalizedBase);
  }

  if (usePrettySubpageUrls) {
    return `${normalizedBase}${pagePath}`;
  }

  return `${normalizedBase}${pagePath}index.html`;
}

export function ProjectsApiScreen({
  activeProjectId,
  activePageId,
  onSelectActivePageId,
  onSelectProject,
  onOpenPage,
}: ProjectsApiScreenProps) {
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
  const [projectPages, setProjectPages] = useState<PageMetaSummary[]>([]);
  const [isNavigationEditorOpen, setIsNavigationEditorOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loadingNavigation, setLoadingNavigation] = useState(false);
  const [savingNavigation, setSavingNavigation] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState<string | null>(null);
  const [publishStarting, setPublishStarting] = useState(false);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [duplicatingPageId, setDuplicatingPageId] = useState<string | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [settingHomePageId, setSettingHomePageId] = useState<string | null>(null);
  const [pendingDeletePage, setPendingDeletePage] = useState<PageMetaSummary | null>(null);
  const publishedBaseUrl = publishedUrl ? toPublishedDisplayBaseUrl(publishedUrl) : null;
  const usePrettySubpageUrls = publishedBaseUrl ? shouldUsePrettySubpageUrls(publishedBaseUrl) : false;
  const publishedHomeUrl = publishedBaseUrl ? toPublishedHomeUrl(publishedBaseUrl) : null;
  const publishDisabledReason =
    publishStarting || publishStatus === 'publishing'
      ? 'Publishing is already in progress.'
      : projectPages.length === 0
        ? 'Create at least one page before publishing.'
        : null;

  const normalizeNavigationItems = (items: unknown): NavigationItem[] => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const label = typeof record.label === 'string' ? record.label : '';
        const pageId = typeof record.pageId === 'string' ? record.pageId : '';
        if (!label || !pageId) return null;
        return { label, pageId };
      })
      .filter((item): item is NavigationItem => item !== null);
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list();
      setProjects(res.projects);
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load projects');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPageOptionLabel = (page: PageMetaSummary) => {
    const title = (page.title || page.id).trim();
    const slug = (page.slug || '').trim();
    if (!slug) return title;
    return `${title} (${slug})`;
  };

  const loadProjectPages = async (projectId: string) => {
    setLoadingProjectDetails(true);
    setError(null);
    try {
      const { pages } = await pagesApi.list(projectId);
      setProjectPages(pages);

      const hasActivePage = !!activePageId && pages.some((page) => page.id === activePageId);
      if (pages.length > 0 && !hasActivePage) {
        const firstPageId = pages[0].id;
        window.localStorage.setItem(`baw_last_page_${projectId}`, firstPageId);
        setLastPageId(firstPageId);
        onSelectActivePageId(firstPageId);
      }

      if (pages.length === 0) {
        window.localStorage.removeItem(`baw_last_page_${projectId}`);
        setLastPageId(null);
        onSelectActivePageId(null);
      }
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load project pages');
      setError(message);
      setProjectPages([]);
    } finally {
      setLoadingProjectDetails(false);
    }
  };

  const loadNavigation = async (projectId: string) => {
    setLoadingNavigation(true);
    setNavigationMessage(null);
    try {
      const nav = await navigationApi.get(projectId);
      setNavigationItems(normalizeNavigationItems(nav.items));
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load navigation');
      setNavigationMessage(message);
      setNavigationItems([]);
    } finally {
      setLoadingNavigation(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      setLastPageId(null);
      setProjectPages([]);
      setIsNavigationEditorOpen(false);
      setNavigationItems([]);
      setNavigationMessage(null);
      return;
    }

    const stored = window.localStorage.getItem(`baw_last_page_${activeProjectId}`);
    setLastPageId(stored);
    void loadProjectPages(activeProjectId);
  }, [activeProjectId, activePageId]);

  useEffect(() => {
    setPublishStarting(false);
    setPublishId(null);
    setPublishStatus(null);
    setPublishedUrl(null);
    setPublishError(null);
    setPublishMessage(null);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || !publishId || publishStatus !== 'publishing') return;

    let cancelled = false;
    const pollPublishStatus = async () => {
      try {
        const result = await publishApi.getStatus(activeProjectId, publishId);
        if (cancelled) return;

        setPublishStatus(result.status);
        setPublishedUrl(result.url);

        if (result.status === 'failed') {
          const message = result.errorMessage ?? 'Publish failed';
          setPublishError(message);
          appToast.error(message, {
            eventKey: `publish-failed:${publishId}`,
          });
          return;
        }

        if (result.status === 'live') {
          setPublishError(null);
          appToast.success('Project published successfully', {
            eventKey: `publish-live:${publishId}`,
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message = getUserFriendlyErrorMessage(err, 'Failed to check publish status');
        setPublishError(message);
        setPublishStatus('failed');
        appToast.error(message, {
          eventKey: `publish-status-error:${publishId}`,
        });
      }
    };

    void pollPublishStatus();
    const interval = window.setInterval(() => {
      void pollPublishStatus();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeProjectId, publishId, publishStatus]);

  const toggleNavigationEditor = () => {
    if (!activeProjectId) return;

    const nextOpen = !isNavigationEditorOpen;
    setIsNavigationEditorOpen(nextOpen);
    if (nextOpen) {
      void loadNavigation(activeProjectId);
      void loadProjectPages(activeProjectId);
    }
  };

  const updateNavigationLabel = (index: number, label: string) => {
    setNavigationItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, label } : item)));
  };

  const addNavigationItem = () => {
    setNavigationItems((prev) => [...prev, { label: '', pageId: '' }]);
  };

  const removeNavigationItem = (index: number) => {
    setNavigationItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateNavigationPageId = (index: number, pageId: string) => {
    setNavigationItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const selectedPage = projectPages.find((page) => page.id === pageId);
        const nextLabel = item.label.trim()
          ? item.label
          : (selectedPage?.title || selectedPage?.id || '');

        return {
          ...item,
          pageId,
          label: nextLabel,
        };
      }),
    );
  };

  const getPageDisplay = (pageId: string) => {
    const page = projectPages.find((item) => item.id === pageId);
    if (!page) return null;
    return formatPageOptionLabel(page);
  };

  const moveNavigationItem = (index: number, direction: 'up' | 'down') => {
    setNavigationItems((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const saveNavigation = async () => {
    if (!activeProjectId) return;

    const missingPage = navigationItems.some((item) => !item.pageId.trim());
    if (missingPage) {
      setNavigationMessage('Each navigation item must have a target page');
      return;
    }

    const missingLabel = navigationItems.some((item) => !item.label.trim());
    if (missingLabel) {
      setNavigationMessage('Navigation labels are required');
      return;
    }

    const pageIds = navigationItems.map((item) => item.pageId.trim());
    const hasDuplicates = new Set(pageIds).size !== pageIds.length;
    if (hasDuplicates) {
      setNavigationMessage('Duplicate target pages are not allowed in navigation');
      return;
    }

    setSavingNavigation(true);
    setNavigationMessage(null);
    try {
      const res = await navigationApi.update(activeProjectId, {
        items: navigationItems.map((item) => ({ label: item.label.trim(), pageId: item.pageId })),
      });
      setNavigationItems(normalizeNavigationItems(res.items));
      setNavigationMessage('Navigation saved');
      appToast.success('Navigation saved', {
        eventKey: `navigation-saved:${activeProjectId}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to save navigation');
      setNavigationMessage(message);
      appToast.error(message, {
        eventKey: `navigation-save-error:${activeProjectId}`,
      });
    } finally {
      setSavingNavigation(false);
    }
  };

  const startPublish = async () => {
    if (!activeProjectId) return;

    setPublishStarting(true);
    setPublishError(null);
    setPublishMessage(null);
    try {
      const result = await publishApi.create(activeProjectId);
      setPublishId(result.publishId);
      setPublishStatus(result.status);
      setPublishedUrl(result.url);
      appToast.success('Publish started', {
        eventKey: `publish-started:${result.publishId}`,
      });

      if (result.status === 'failed') {
        const message = result.errorMessage ?? 'Publish failed';
        setPublishError(message);
        appToast.error(message, {
          eventKey: `publish-failed:${result.publishId}`,
        });
      }
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to publish project');
      setPublishError(message);
      setPublishStatus('failed');
      appToast.error(message, {
        eventKey: `publish-start-error:${activeProjectId}`,
      });
    } finally {
      setPublishStarting(false);
    }
  };

  const copyPublishedUrl = async (url?: string) => {
    const targetUrl = url ?? publishedHomeUrl;
    if (!targetUrl) return;

    try {
      await window.navigator.clipboard.writeText(targetUrl);
      setPublishMessage('URL copied');
      appToast.success('Published URL copied', {
        eventKey: `publish-url-copied:${activeProjectId ?? 'unknown'}`,
      });
    } catch {
      setPublishMessage('Failed to copy URL');
      appToast.error('Failed to copy published URL', {
        eventKey: `publish-url-copy-error:${activeProjectId ?? 'unknown'}`,
      });
    }
  };

  const refreshPagesAndNavigation = async (projectId: string) => {
    await loadProjectPages(projectId);
    await loadNavigation(projectId);
  };

  const handleDuplicatePage = async (page: PageMetaSummary) => {
    if (!activeProjectId) return;

    setDuplicatingPageId(page.id);
    try {
      await pagesApi.duplicate(activeProjectId, page.id);
      await refreshPagesAndNavigation(activeProjectId);
      appToast.success(`Duplicated "${page.title}"`, {
        eventKey: `page-duplicated:${activeProjectId}:${page.id}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to duplicate page');
      appToast.error(message, {
        eventKey: `page-duplicate-error:${activeProjectId}:${page.id}`,
      });
    } finally {
      setDuplicatingPageId(null);
    }
  };

  const handleDeletePage = async (page: PageMetaSummary) => {
    if (!activeProjectId) return;

    setDeletingPageId(page.id);
    try {
      await pagesApi.remove(activeProjectId, page.id, page.version);
      if (window.localStorage.getItem(`baw_last_page_${activeProjectId}`) === page.id) {
        window.localStorage.removeItem(`baw_last_page_${activeProjectId}`);
      }

      await refreshPagesAndNavigation(activeProjectId);
      appToast.success(`Deleted "${page.title}"`, {
        eventKey: `page-deleted:${activeProjectId}:${page.id}`,
      });
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      if (apiError?.status === 409 || apiError?.code === 'VERSION_CONFLICT') {
        await refreshPagesAndNavigation(activeProjectId);
        const message = getUserFriendlyErrorMessage(err, 'This page changed elsewhere. List refreshed.');
        appToast.error(message, {
          eventKey: `page-delete-conflict:${activeProjectId}:${page.id}`,
        });
      } else {
        const message = getUserFriendlyErrorMessage(err, 'Failed to delete page');
        appToast.error(message, {
          eventKey: `page-delete-error:${activeProjectId}:${page.id}`,
        });
      }
    } finally {
      setDeletingPageId(null);
      setPendingDeletePage(null);
    }
  };

  const handleSetHomePage = async (page: PageMetaSummary) => {
    if (!activeProjectId) return;

    setSettingHomePageId(page.id);
    try {
      await projectsApi.setHome(activeProjectId, { pageId: page.id });
      await refreshPagesAndNavigation(activeProjectId);
      appToast.success(`"${page.title}" set as home page`, {
        eventKey: `page-home-set:${activeProjectId}:${page.id}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to set home page');
      appToast.error(message, {
        eventKey: `page-home-set-error:${activeProjectId}:${page.id}`,
      });
    } finally {
      setSettingHomePageId(null);
    }
  };

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
      appToast.success('Project created', {
        eventKey: `project-created:${res.project_id}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to create project');
      setError(message);
      appToast.error(message, {
        eventKey: 'project-create-error',
      });
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
      await loadProjectPages(activeProjectId);

      onOpenPage(activeProjectId, res.page_id);
      appToast.success('Page created', {
        eventKey: `page-created:${activeProjectId}:${res.page_id}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to create page');
      setError(message);
      appToast.error(message, {
        eventKey: `page-create-error:${activeProjectId}`,
      });
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
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your projects</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void loadProjects();
              if (activeProjectId) {
                void loadProjectPages(activeProjectId);
              }
            }}
            disabled={loading}
          >
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Active project pages</h2>
              <p className="text-sm text-muted-foreground">Project ID: {activeProjectId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={toggleNavigationEditor}>
                {isNavigationEditorOpen ? 'Close Navigation' : 'Edit Navigation'}
              </Button>
              <Button
                type="button"
                onClick={() => void startPublish()}
                disabled={!!publishDisabledReason}
                title={publishDisabledReason ?? undefined}
              >
                {publishStarting || publishStatus === 'publishing' ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
          {publishDisabledReason && (
            <p className="text-xs text-muted-foreground" role="note">
              {publishDisabledReason}
            </p>
          )}

          {(publishStatus || publishError || publishedHomeUrl || publishMessage) && (
            <div className="border rounded-md p-3 space-y-1">
              {publishStatus && (
                <p className="text-sm">
                  Publish status: <strong>{publishStatus}</strong>
                </p>
              )}
              {publishError && (
                <p className="text-sm text-destructive" role="alert">
                  {publishError}
                </p>
              )}
              {publishStatus === 'live' && publishedBaseUrl && publishedHomeUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={publishedHomeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-primary"
                    >
                      Open published site
                    </a>
                    <Button type="button" variant="outline" size="sm" onClick={() => void copyPublishedUrl()}>
                      Copy URL
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {projectPages.map((page) => {
                      const pageUrl = toPublishedPageUrl({
                        baseUrl: publishedBaseUrl,
                        page,
                        usePrettySubpageUrls,
                      });
                      return (
                        <div key={`published-url-${page.id}`} className="flex items-center gap-2 text-xs">
                          <span className="min-w-24 text-muted-foreground">{page.title}</span>
                          <a href={pageUrl} target="_blank" rel="noreferrer" className="underline text-primary break-all">
                            {pageUrl}
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void copyPublishedUrl(pageUrl)}
                          >
                            {`Copy ${page.title} URL`}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {publishMessage && (
                <p className="text-xs text-muted-foreground" role="status">
                  {publishMessage}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
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
                <Button
                  type="submit"
                  disabled={creatingPage || !newPageTitle.trim() || !newPageSlug.trim() || !activeProjectId}
                >
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
            </div>

            <aside className="border rounded-md p-3 space-y-2">
              <h3 className="text-sm font-medium">Pages</h3>
              {projectPages.length === 0 && (
                <p className="text-sm text-muted-foreground">No pages returned.</p>
              )}
              {projectPages.length === 1 && (
                <p className="text-xs text-muted-foreground" role="note">
                  Delete is disabled because a project must keep at least one page.
                </p>
              )}
              {projectPages.map((page) => (
                <div key={page.id} className="w-full text-left border rounded-md p-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{page.title ?? page.id}</div>
                      {page.slug && <div className="text-xs text-muted-foreground">/{page.slug}</div>}
                      <div className="text-xs text-muted-foreground">v{page.version}</div>
                    </div>
                    {page.isHome && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium">
                        Home
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenPage(activeProjectId, page.id)}
                    >
                      Open
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleSetHomePage(page)}
                      disabled={page.isHome || settingHomePageId === page.id}
                      title={page.isHome ? 'This page is already the home page.' : undefined}
                    >
                      {settingHomePageId === page.id ? 'Setting...' : 'Set as Home'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDuplicatePage(page)}
                      disabled={duplicatingPageId === page.id}
                    >
                      {duplicatingPageId === page.id ? 'Duplicating...' : 'Duplicate'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setPendingDeletePage(page)}
                      disabled={projectPages.length <= 1 || deletingPageId === page.id}
                      title={projectPages.length <= 1 ? 'Cannot delete the only page in a project.' : undefined}
                    >
                      {deletingPageId === page.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </aside>
          </div>

          {isNavigationEditorOpen && (
            <div className="border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Navigation</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNavigationItem()}
                    disabled={loadingNavigation}
                  >
                    Add Navigation Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void loadNavigation(activeProjectId);
                      void loadProjectPages(activeProjectId);
                    }}
                    disabled={loadingNavigation}
                  >
                    {loadingNavigation ? 'Loading...' : 'Reload Navigation'}
                  </Button>
                </div>
              </div>

              {navigationItems.length === 0 && !loadingNavigation && (
                <p className="text-sm text-muted-foreground">No navigation items.</p>
              )}

              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <div key={`${item.pageId}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-7">
                      <Input
                        label={`Label ${index + 1}`}
                        value={item.label}
                        onChange={(e) => updateNavigationLabel(index, e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1">Target page</label>
                      <select
                        className="h-10 px-3 border rounded-md bg-background w-full"
                        value={item.pageId}
                        onChange={(e) => updateNavigationPageId(index, e.target.value)}
                      >
                        <option value="">Select page</option>
                        {projectPages.length === 0 && (
                          <option value={item.pageId || ''} disabled>
                            No pages available
                          </option>
                        )}
                        {projectPages.map((page) => (
                          <option key={page.id} value={page.id}>
                            {formatPageOptionLabel(page)}
                          </option>
                        ))}
                        {!projectPages.some((page) => page.id === item.pageId) && item.pageId && (
                          <option value={item.pageId}>
                            Missing page ({item.pageId})
                          </option>
                        )}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {`Linked: ${getPageDisplay(item.pageId) ?? `missing page (${item.pageId})`}`}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveNavigationItem(index, 'up')}
                        disabled={index === 0}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveNavigationItem(index, 'down')}
                        disabled={index === navigationItems.length - 1}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeNavigationItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => void saveNavigation()}
                  disabled={savingNavigation || loadingNavigation}
                >
                  {savingNavigation ? 'Saving...' : 'Save Navigation'}
                </Button>
                {navigationMessage && (
                  <p className="text-sm" role="alert">
                    {navigationMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!pendingDeletePage}
        onClose={() => setPendingDeletePage(null)}
        onConfirm={() => {
          if (!pendingDeletePage) return;
          void handleDeletePage(pendingDeletePage);
        }}
        title="Delete page?"
        description={
          pendingDeletePage
            ? `Delete "${pendingDeletePage.title}"? This action cannot be undone.`
            : 'Delete this page?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
