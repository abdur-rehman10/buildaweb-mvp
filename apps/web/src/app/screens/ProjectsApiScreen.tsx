import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MediaLibraryModal } from '../components/MediaLibraryModal';
import {
  ApiError,
  assetsApi,
  navigationApi,
  pagesApi,
  projectsApi,
  publishApi,
  type ProjectAsset,
  type ProjectSettings,
  type PublishHistoryItem,
  type PageMetaSummary,
  type NavigationItem,
  type ProjectSummary,
  type PublishStatus,
} from '../../lib/api';
import { useLatestPublish } from '../hooks/useLatestPublish';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';
import { appToast } from '../../lib/toast';
import {
  buildPublishIndexUrl,
  buildPublishPageUrl,
  parsePublishBaseUrl,
  type PublishUrlBuilderInput,
} from '../../lib/publishUrls';

interface ProjectsApiScreenProps {
  activeProjectId: string | null;
  activePageId: string | null;
  onSelectActivePageId: (pageId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onOpenPage: (projectId: string, pageId: string) => void;
}

type ProjectSettingsAssetField = 'logoAssetId' | 'faviconAssetId' | 'defaultOgImageAssetId';

function toPublishedDisplayBaseUrl(baseUrl: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
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

function normalizeSlugToken(slug?: string): string {
  return (slug ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
}

function hasLegacyHomeMarker(page: Pick<PageMetaSummary, 'slug' | 'title'>): boolean {
  const rawSlug = (page.slug ?? '').trim().toLowerCase();
  const normalizedSlug = rawSlug.replace(/^\/+/, '').replace(/\/+$/, '');
  const normalizedTitle = (page.title ?? '').trim().toLowerCase();
  return rawSlug === '/' || normalizedSlug === 'home' || normalizedTitle === 'home';
}

function toPublishUrlInput(baseUrl: string): PublishUrlBuilderInput | null {
  return parsePublishBaseUrl(toPublishedDisplayBaseUrl(baseUrl));
}

function hasPagesEditedAfterPublish(params: { pages: PageMetaSummary[]; publishedAt: string | null }): boolean {
  if (!params.publishedAt) return false;
  const publishedAtMs = Date.parse(params.publishedAt);
  if (Number.isNaN(publishedAtMs)) return false;

  return params.pages.some((page) => {
    if (!page.updatedAt) return false;
    const updatedAtMs = Date.parse(String(page.updatedAt));
    return !Number.isNaN(updatedAtMs) && updatedAtMs > publishedAtMs;
  });
}

function formatPublishHistoryTime(value?: string | null): string {
  if (!value) return 'Unknown';
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return 'Unknown';
  return new Date(ts).toLocaleString();
}

function emptyProjectSettings(locale = 'en'): ProjectSettings {
  return {
    siteName: null,
    logoAssetId: null,
    faviconAssetId: null,
    defaultOgImageAssetId: null,
    locale,
  };
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
  const [previewDraftLoading, setPreviewDraftLoading] = useState(false);
  const [loadingPublishHistory, setLoadingPublishHistory] = useState(false);
  const [makingLivePublishId, setMakingLivePublishId] = useState<string | null>(null);
  const [publishHistory, setPublishHistory] = useState<PublishHistoryItem[]>([]);
  const [publishHistoryError, setPublishHistoryError] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishPreflightDetails, setPublishPreflightDetails] = useState<string[]>([]);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(emptyProjectSettings());
  const [loadingProjectSettings, setLoadingProjectSettings] = useState(false);
  const [savingProjectSettings, setSavingProjectSettings] = useState(false);
  const [projectSettingsMessage, setProjectSettingsMessage] = useState<string | null>(null);
  const [projectSettingsAssetUrls, setProjectSettingsAssetUrls] = useState<Record<string, string>>({});
  const [projectSettingsMediaTarget, setProjectSettingsMediaTarget] = useState<ProjectSettingsAssetField | null>(null);
  const [uploadingProjectSettingsTarget, setUploadingProjectSettingsTarget] = useState<ProjectSettingsAssetField | null>(null);
  const [projectSettingsUploadNonce, setProjectSettingsUploadNonce] = useState(0);
  const [duplicatingPageId, setDuplicatingPageId] = useState<string | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [settingHomePageId, setSettingHomePageId] = useState<string | null>(null);
  const [pendingDeletePage, setPendingDeletePage] = useState<PageMetaSummary | null>(null);
  const { latestPublish, latestPublishId, publishedAt, homePageId, loadingLatestPublish, latestPublishError, refreshLatestPublish } =
    useLatestPublish(activeProjectId);
  const publishedUrlInput = publishedUrl ? toPublishUrlInput(publishedUrl) : null;
  const publishedHomeUrl = publishedUrlInput ? buildPublishIndexUrl(publishedUrlInput) : null;
  const hasUnpublishedChanges = hasPagesEditedAfterPublish({
    pages: projectPages,
    publishedAt,
  });
  const homePageExistsById = homePageId ? projectPages.some((page) => page.id === homePageId) : false;
  const fallbackHomePage = projectPages.find((page) => hasLegacyHomeMarker(page)) ?? projectPages[0] ?? null;
  const homeExists = homePageId ? homePageExistsById : !!fallbackHomePage;
  const showHomeMissingBadge = projectPages.length === 0 || (!!homePageId && !homeExists);
  const hasAnyLiveSite = !!latestPublishId || publishStatus === 'live';
  const showRepublishCta = !!latestPublishId && hasUnpublishedChanges;
  const publishStatusLabel =
    publishStatus === 'publishing'
      ? 'Publishing'
      : publishStatus === 'failed'
        ? 'Failed'
        : hasAnyLiveSite
          ? hasUnpublishedChanges
            ? 'Live (outdated) • Unpublished changes'
            : 'Live (up to date)'
          : 'Not published';
  const publishButtonLabel =
    publishStarting || publishStatus === 'publishing'
      ? 'Publishing...'
      : showRepublishCta
        ? 'Republish to update live site'
        : 'Publish';
  const preflightDisabledReason =
    publishPreflightDetails.length > 0 ? 'Fix publish issues listed below before retrying.' : null;
  const publishDisabledReason =
    publishStarting || publishStatus === 'publishing'
      ? 'Publishing is already in progress.'
      : preflightDisabledReason
        ? preflightDisabledReason
      : projectPages.length === 0
        ? 'Create at least one page before publishing.'
        : null;
  const previewDisabledReason = projectPages.length === 0 ? 'Create at least one page before previewing.' : null;
  const activeProject = activeProjectId ? projects.find((project) => project.id === activeProjectId) ?? null : null;

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

  const resolveProjectSettingsAssetUrls = async (projectId: string, settings: ProjectSettings) => {
    const assetIds = [settings.logoAssetId, settings.faviconAssetId, settings.defaultOgImageAssetId]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value): value is string => !!value);

    if (assetIds.length === 0) {
      setProjectSettingsAssetUrls({});
      return;
    }

    try {
      const resolved = await assetsApi.resolve(projectId, [...new Set(assetIds)]);
      const urlById: Record<string, string> = {};
      for (const item of resolved.items) {
        if (item.assetId && item.publicUrl) {
          urlById[item.assetId] = item.publicUrl;
        }
      }
      setProjectSettingsAssetUrls(urlById);
    } catch (err) {
      setProjectSettingsAssetUrls({});
      const message = getUserFriendlyErrorMessage(err, 'Failed to resolve project setting assets');
      setProjectSettingsMessage(message);
    }
  };

  const loadProjectSettings = async (projectId: string, fallbackLocale = 'en') => {
    setLoadingProjectSettings(true);
    setProjectSettingsMessage(null);
    try {
      const res = await projectsApi.getSettings(projectId);
      const settings = {
        siteName: res.settings.siteName ?? null,
        logoAssetId: res.settings.logoAssetId ?? null,
        faviconAssetId: res.settings.faviconAssetId ?? null,
        defaultOgImageAssetId: res.settings.defaultOgImageAssetId ?? null,
        locale: (res.settings.locale || fallbackLocale || 'en').trim() || 'en',
      };
      setProjectSettings(settings);
      await resolveProjectSettingsAssetUrls(projectId, settings);
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load project settings');
      setProjectSettingsMessage(message);
      const fallback = emptyProjectSettings(fallbackLocale || 'en');
      setProjectSettings(fallback);
      setProjectSettingsAssetUrls({});
    } finally {
      setLoadingProjectSettings(false);
    }
  };

  const saveProjectSettings = async () => {
    if (!activeProjectId) return;

    setSavingProjectSettings(true);
    setProjectSettingsMessage(null);
    try {
      const payload = {
        siteName: projectSettings.siteName?.trim() ? projectSettings.siteName.trim() : null,
        logoAssetId: projectSettings.logoAssetId?.trim() ? projectSettings.logoAssetId.trim() : null,
        faviconAssetId: projectSettings.faviconAssetId?.trim() ? projectSettings.faviconAssetId.trim() : null,
        defaultOgImageAssetId: projectSettings.defaultOgImageAssetId?.trim()
          ? projectSettings.defaultOgImageAssetId.trim()
          : null,
        locale: projectSettings.locale?.trim() ? projectSettings.locale.trim() : 'en',
      };

      const res = await projectsApi.updateSettings(activeProjectId, payload);
      setProjectSettings({
        siteName: res.settings.siteName ?? null,
        logoAssetId: res.settings.logoAssetId ?? null,
        faviconAssetId: res.settings.faviconAssetId ?? null,
        defaultOgImageAssetId: res.settings.defaultOgImageAssetId ?? null,
        locale: (res.settings.locale || 'en').trim() || 'en',
      });
      await resolveProjectSettingsAssetUrls(activeProjectId, {
        siteName: res.settings.siteName ?? null,
        logoAssetId: res.settings.logoAssetId ?? null,
        faviconAssetId: res.settings.faviconAssetId ?? null,
        defaultOgImageAssetId: res.settings.defaultOgImageAssetId ?? null,
        locale: (res.settings.locale || 'en').trim() || 'en',
      });
      setProjectSettingsMessage('Project settings saved');
      appToast.success('Project settings saved', {
        eventKey: `project-settings-saved:${activeProjectId}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to save project settings');
      setProjectSettingsMessage(message);
      appToast.error(message, {
        eventKey: `project-settings-save-error:${activeProjectId}`,
      });
    } finally {
      setSavingProjectSettings(false);
    }
  };

  const uploadProjectSettingsAsset = async (target: ProjectSettingsAssetField, file: File) => {
    if (!activeProjectId) return;

    setUploadingProjectSettingsTarget(target);
    setProjectSettingsMessage(null);
    try {
      const uploaded = await assetsApi.upload(activeProjectId, file);
      setProjectSettings((prev) => ({ ...prev, [target]: uploaded.assetId }));
      setProjectSettingsAssetUrls((prev) => ({ ...prev, [uploaded.assetId]: uploaded.publicUrl }));
      setProjectSettingsMessage('Asset uploaded. Save project settings to persist.');
      appToast.success('Asset uploaded', {
        eventKey: `project-settings-asset-uploaded:${activeProjectId}:${target}:${uploaded.assetId}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to upload asset');
      setProjectSettingsMessage(message);
      appToast.error(message, {
        eventKey: `project-settings-asset-upload-error:${activeProjectId}:${target}`,
      });
    } finally {
      setProjectSettingsUploadNonce((prev) => prev + 1);
      setUploadingProjectSettingsTarget(null);
    }
  };

  const selectProjectSettingsAssetFromLibrary = (target: ProjectSettingsAssetField, asset: ProjectAsset) => {
    setProjectSettings((prev) => ({ ...prev, [target]: asset.id }));
    setProjectSettingsAssetUrls((prev) => ({ ...prev, [asset.id]: asset.publicUrl }));
    setProjectSettingsMediaTarget(null);
    setProjectSettingsMessage('Asset selected. Save project settings to persist.');
    appToast.success('Asset selected', {
      eventKey: `project-settings-asset-selected:${activeProjectId ?? 'unknown'}:${target}:${asset.id}`,
    });
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

  const loadPublishHistory = async (projectId: string) => {
    setLoadingPublishHistory(true);
    setPublishHistoryError(null);
    try {
      const res = await publishApi.list(projectId, 10);
      setPublishHistory(res.publishes ?? []);
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load publish history');
      setPublishHistory([]);
      setPublishHistoryError(message);
    } finally {
      setLoadingPublishHistory(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      setLastPageId(null);
      setProjectPages([]);
      setProjectSettings(emptyProjectSettings());
      setProjectSettingsAssetUrls({});
      setProjectSettingsMessage(null);
      setIsNavigationEditorOpen(false);
      setNavigationItems([]);
      setNavigationMessage(null);
      setPublishHistory([]);
      setPublishHistoryError(null);
      return;
    }

    const stored = window.localStorage.getItem(`baw_last_page_${activeProjectId}`);
    setLastPageId(stored);
    void loadProjectPages(activeProjectId);
    void loadProjectSettings(activeProjectId, activeProject?.defaultLocale ?? 'en');
    void loadPublishHistory(activeProjectId);
  }, [activeProjectId, activePageId]);

  useEffect(() => {
    setPublishStarting(false);
    setPublishId(null);
    setPublishStatus(null);
    setPublishedUrl(null);
    setPublishError(null);
    setPublishPreflightDetails([]);
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
          void refreshLatestPublish();
          void loadPublishHistory(activeProjectId);
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
  }, [activeProjectId, publishId, publishStatus, refreshLatestPublish]);

  useEffect(() => {
    if (publishStatus === 'publishing') return;

    if (latestPublish) {
      setPublishId(latestPublish.publishId);
      setPublishStatus(latestPublish.status);
      setPublishedUrl(latestPublish.url);
      setPublishError(latestPublish.errorMessage ?? null);
      return;
    }

    // If there is no persisted publish record and no local publish session, show "Not published".
    if (!publishId) {
      setPublishStatus(null);
      setPublishedUrl(null);
      setPublishError(null);
    }
  }, [latestPublish, publishId, publishStatus]);

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
      setPublishPreflightDetails([]);
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
    setPublishPreflightDetails([]);
    setPublishMessage(null);
    try {
      const result = await publishApi.create(activeProjectId);
      setPublishId(result.publishId);
      setPublishStatus(result.status);
      setPublishedUrl(result.url);
      setPublishPreflightDetails([]);
      appToast.success('Publish started', {
        eventKey: `publish-started:${result.publishId}`,
      });

      if (result.status === 'failed') {
        const message = result.errorMessage ?? 'Publish failed';
        setPublishError(message);
        appToast.error(message, {
          eventKey: `publish-failed:${result.publishId}`,
        });
      } else if (result.status === 'live') {
        void refreshLatestPublish();
        void loadPublishHistory(activeProjectId);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      if (apiError?.code === 'PUBLISH_PREFLIGHT_FAILED') {
        const details = Array.isArray(apiError.details) && apiError.details.length > 0 ? apiError.details : [apiError.message];
        setPublishPreflightDetails(details);
        setPublishMessage(null);
        appToast.error('Fix publish issues before publishing', {
          eventKey: `publish-preflight-error:${activeProjectId}`,
        });
        return;
      }

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

  const copyPublishHistoryUrl = async (publishIdValue: string, url: string) => {
    try {
      await window.navigator.clipboard.writeText(url);
      appToast.success('Published URL copied', {
        eventKey: `publish-history-url-copied:${publishIdValue}`,
      });
    } catch {
      appToast.error('Failed to copy published URL', {
        eventKey: `publish-history-url-copy-error:${publishIdValue}`,
      });
    }
  };

  const makePublishLive = async (entry: PublishHistoryItem) => {
    if (!activeProjectId) return;
    if (latestPublishId && entry.publishId === latestPublishId) return;

    setMakingLivePublishId(entry.publishId);
    try {
      await publishApi.setLatest(activeProjectId, { publishId: entry.publishId });
      setPublishStatus('live');
      setPublishedUrl(entry.baseUrl);
      setPublishError(null);

      await Promise.all([
        loadPublishHistory(activeProjectId),
        refreshLatestPublish(),
        loadProjects(),
      ]);

      appToast.success('Live publish updated', {
        eventKey: `publish-make-live-success:${activeProjectId}:${entry.publishId}`,
      });
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to set live publish');
      appToast.error(message, {
        eventKey: `publish-make-live-error:${activeProjectId}:${entry.publishId}`,
      });
    } finally {
      setMakingLivePublishId(null);
    }
  };

  const refreshPagesAndNavigation = async (projectId: string) => {
    await loadProjectPages(projectId);
    await loadNavigation(projectId);
  };

  const resolvePreviewTargetPageId = () => {
    if (activePageId && projectPages.some((page) => page.id === activePageId)) {
      return activePageId;
    }

    const homePage = projectPages.find((page) => page.isHome || normalizeSlugToken(page.slug) === 'home');
    if (homePage) {
      return homePage.id;
    }

    return projectPages[0]?.id ?? null;
  };

  const previewDraft = async () => {
    if (!activeProjectId) return;

    const targetPageId = resolvePreviewTargetPageId();
    if (!targetPageId) {
      appToast.error('Create at least one page before previewing', {
        eventKey: `preview-draft-missing-page:${activeProjectId}`,
      });
      return;
    }

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      appToast.error('Pop-up blocked. Please allow pop-ups and try again.', {
        eventKey: `preview-draft-popup-blocked:${activeProjectId}`,
      });
      return;
    }

    setPreviewDraftLoading(true);
    try {
      const preview = await pagesApi.preview(activeProjectId, targetPageId);
      const lang = typeof preview.lang === 'string' && preview.lang.trim().length > 0 ? preview.lang.trim() : 'en';
      const headTags = typeof preview.headTags === 'string' ? preview.headTags : '';
      const srcdoc = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${headTags}<style>${preview.css}</style></head><body>${preview.html}</body></html>`;
      previewWindow.document.open();
      previewWindow.document.write(srcdoc);
      previewWindow.document.close();
      previewWindow.document.title = 'Draft Preview';
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err, 'Failed to load preview');
      appToast.error(message, {
        eventKey: `preview-draft-error:${activeProjectId}:${targetPageId}`,
      });
      previewWindow.close();
    } finally {
      setPreviewDraftLoading(false);
    }
  };

  const showPublishCard =
    loadingLatestPublish || publishStatus !== null || !!publishError || !!publishedHomeUrl || !!publishMessage || !latestPublish;

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
      setPublishPreflightDetails([]);
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
      setPublishPreflightDetails([]);
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
      setPublishPreflightDetails([]);

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
              {showHomeMissingBadge && (
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  Home page missing
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => void previewDraft()}
                disabled={previewDraftLoading || !!previewDisabledReason}
                title={previewDisabledReason ?? undefined}
              >
                {previewDraftLoading ? 'Loading Preview...' : 'Preview Draft'}
              </Button>
              <Button type="button" variant="outline" onClick={toggleNavigationEditor}>
                {isNavigationEditorOpen ? 'Close Navigation' : 'Edit Navigation'}
              </Button>
              <Button
                type="button"
                onClick={() => void startPublish()}
                disabled={!!publishDisabledReason}
                title={publishDisabledReason ?? undefined}
              >
                {publishButtonLabel}
              </Button>
            </div>
          </div>
          {publishDisabledReason && (
            <p className="text-xs text-muted-foreground" role="note">
              {publishDisabledReason}
            </p>
          )}

          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Project Settings</h3>
              <Button
                type="button"
                onClick={() => void saveProjectSettings()}
                disabled={savingProjectSettings || loadingProjectSettings}
              >
                {savingProjectSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            {loadingProjectSettings && (
              <p className="text-sm text-muted-foreground">Loading project settings...</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Site Name"
                value={projectSettings.siteName ?? ''}
                onChange={(e) =>
                  setProjectSettings((prev) => ({
                    ...prev,
                    siteName: e.target.value,
                  }))
                }
                placeholder="My website"
              />
              <Input
                label="Locale"
                value={projectSettings.locale}
                onChange={(e) =>
                  setProjectSettings((prev) => ({
                    ...prev,
                    locale: e.target.value,
                  }))
                }
                placeholder="en"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="border rounded-md p-3 space-y-2">
                <Input
                  label="Logo Asset ID"
                  value={projectSettings.logoAssetId ?? ''}
                  onChange={(e) =>
                    setProjectSettings((prev) => ({
                      ...prev,
                      logoAssetId: e.target.value.trim() ? e.target.value.trim() : null,
                    }))
                  }
                  placeholder="Select or upload asset"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setProjectSettingsMediaTarget('logoAssetId')}>
                    Select
                  </Button>
                  <label className="inline-flex">
                    <input
                      key={`project-settings-logo-upload-${projectSettingsUploadNonce}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadProjectSettingsAsset('logoAssetId', file);
                        }
                      }}
                    />
                    <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm cursor-pointer">
                      {uploadingProjectSettingsTarget === 'logoAssetId' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectSettings((prev) => ({ ...prev, logoAssetId: null }))}
                    disabled={!projectSettings.logoAssetId}
                  >
                    Clear
                  </Button>
                </div>
                {projectSettings.logoAssetId && projectSettingsAssetUrls[projectSettings.logoAssetId] && (
                  <a
                    href={projectSettingsAssetUrls[projectSettings.logoAssetId]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline text-primary break-all"
                  >
                    {projectSettingsAssetUrls[projectSettings.logoAssetId]}
                  </a>
                )}
              </div>

              <div className="border rounded-md p-3 space-y-2">
                <Input
                  label="Favicon Asset ID"
                  value={projectSettings.faviconAssetId ?? ''}
                  onChange={(e) =>
                    setProjectSettings((prev) => ({
                      ...prev,
                      faviconAssetId: e.target.value.trim() ? e.target.value.trim() : null,
                    }))
                  }
                  placeholder="Select or upload asset"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectSettingsMediaTarget('faviconAssetId')}
                  >
                    Select
                  </Button>
                  <label className="inline-flex">
                    <input
                      key={`project-settings-favicon-upload-${projectSettingsUploadNonce}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadProjectSettingsAsset('faviconAssetId', file);
                        }
                      }}
                    />
                    <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm cursor-pointer">
                      {uploadingProjectSettingsTarget === 'faviconAssetId' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectSettings((prev) => ({ ...prev, faviconAssetId: null }))}
                    disabled={!projectSettings.faviconAssetId}
                  >
                    Clear
                  </Button>
                </div>
                {projectSettings.faviconAssetId && projectSettingsAssetUrls[projectSettings.faviconAssetId] && (
                  <a
                    href={projectSettingsAssetUrls[projectSettings.faviconAssetId]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline text-primary break-all"
                  >
                    {projectSettingsAssetUrls[projectSettings.faviconAssetId]}
                  </a>
                )}
              </div>

              <div className="border rounded-md p-3 space-y-2">
                <Input
                  label="Default OG Image Asset ID"
                  value={projectSettings.defaultOgImageAssetId ?? ''}
                  onChange={(e) =>
                    setProjectSettings((prev) => ({
                      ...prev,
                      defaultOgImageAssetId: e.target.value.trim() ? e.target.value.trim() : null,
                    }))
                  }
                  placeholder="Select or upload asset"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectSettingsMediaTarget('defaultOgImageAssetId')}
                  >
                    Select
                  </Button>
                  <label className="inline-flex">
                    <input
                      key={`project-settings-og-upload-${projectSettingsUploadNonce}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadProjectSettingsAsset('defaultOgImageAssetId', file);
                        }
                      }}
                    />
                    <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm cursor-pointer">
                      {uploadingProjectSettingsTarget === 'defaultOgImageAssetId' ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectSettings((prev) => ({ ...prev, defaultOgImageAssetId: null }))}
                    disabled={!projectSettings.defaultOgImageAssetId}
                  >
                    Clear
                  </Button>
                </div>
                {projectSettings.defaultOgImageAssetId && projectSettingsAssetUrls[projectSettings.defaultOgImageAssetId] && (
                  <a
                    href={projectSettingsAssetUrls[projectSettings.defaultOgImageAssetId]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline text-primary break-all"
                  >
                    {projectSettingsAssetUrls[projectSettings.defaultOgImageAssetId]}
                  </a>
                )}
              </div>
            </div>

            {projectSettingsMessage && (
              <p className="text-sm" role="status">
                {projectSettingsMessage}
              </p>
            )}
          </div>

          {showPublishCard && (
            <div className="border rounded-md p-3 space-y-1">
              {!publishStatus && loadingLatestPublish && !latestPublishId && (
                <p className="text-sm">
                  Publish status: <strong>Loading...</strong>
                </p>
              )}
              {(!loadingLatestPublish || publishStatus || latestPublishId) && (
                <p className="text-sm">
                  Publish status: <strong>{publishStatusLabel}</strong>
                </p>
              )}
              {publishError && (
                <p className="text-sm text-destructive" role="alert">
                  {publishError}
                </p>
              )}
              {!publishError && latestPublishError && (
                <p className="text-sm text-destructive" role="alert">
                  {latestPublishError}
                </p>
              )}
              {publishPreflightDetails.length > 0 && (
                <div className="border border-amber-400/70 rounded-md p-3 bg-amber-50/70 text-amber-900" role="alert">
                  <p className="text-sm font-medium">Fix before publishing</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    {publishPreflightDetails.map((detail, index) => (
                      <li key={`publish-preflight-${index}`}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
              {publishStatus === 'live' && publishedHomeUrl && (
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
                      if (!publishedUrlInput) return null;
                      let pageUrl: string;
                      try {
                        pageUrl = buildPublishPageUrl({
                          ...publishedUrlInput,
                          slug: page.slug,
                          isHome: page.isHome,
                        });
                      } catch {
                        return null;
                      }
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

          <div className="border rounded-md p-3 space-y-2">
            <h3 className="text-sm font-medium">Publish History</h3>
            {loadingPublishHistory && (
              <p className="text-sm text-muted-foreground">Loading publish history...</p>
            )}
            {!loadingPublishHistory && publishHistoryError && (
              <p className="text-sm text-destructive" role="alert">
                {publishHistoryError}
              </p>
            )}
            {!loadingPublishHistory && !publishHistoryError && publishHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">No publishes yet</p>
            )}
            {!loadingPublishHistory && publishHistory.length > 0 && (
              <div className="space-y-2">
                {publishHistory.map((entry) => {
                  const entryUrlInput = toPublishUrlInput(entry.baseUrl);
                  if (!entryUrlInput) return null;
                  const homeUrl = buildPublishIndexUrl(entryUrlInput);
                  const isLivePublish = !!latestPublishId && entry.publishId === latestPublishId;
                  return (
                    <div key={`publish-history-${entry.publishId}`} className="border rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Created: {formatPublishHistoryTime(entry.createdAt)}</div>
                      <div className="text-xs">
                        Status:{' '}
                        <span className="font-medium">
                          {entry.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={homeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline text-primary"
                          aria-label={`Open publish ${entry.publishId}`}
                        >
                          Open
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void copyPublishHistoryUrl(entry.publishId, homeUrl)}
                          aria-label={`Copy publish URL ${entry.publishId}`}
                        >
                          Copy URL
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void makePublishLive(entry)}
                          disabled={isLivePublish || makingLivePublishId === entry.publishId}
                          aria-label={`Make live ${entry.publishId}`}
                        >
                          {makingLivePublishId === entry.publishId ? 'Making Live...' : 'Make Live'}
                        </Button>
                        {isLivePublish && (
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                            aria-label={`Live publish ${entry.publishId}`}
                          >
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

      {activeProjectId && (
        <MediaLibraryModal
          isOpen={!!projectSettingsMediaTarget}
          projectId={activeProjectId}
          onClose={() => setProjectSettingsMediaTarget(null)}
          onSelect={(asset) => {
            if (!projectSettingsMediaTarget) return;
            selectProjectSettingsAssetFromLibrary(projectSettingsMediaTarget, asset);
          }}
        />
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
