type SnapshotProjectInput = {
  defaultLocale?: unknown;
  locale?: unknown;
  siteName?: unknown;
  faviconAssetId?: unknown;
  defaultOgImageAssetId?: unknown;
};

type SnapshotPageInput = {
  _id?: unknown;
  title?: unknown;
  slug?: unknown;
  isHome?: boolean;
  editorJson?: unknown;
  seoJson?: unknown;
};

type SnapshotNavigationInput = unknown;

export type PublishDraftSnapshot = {
  pages: Array<{
    slug: string;
    title: string;
    editorJson: unknown;
    seoJson: unknown;
  }>;
  navigation: Array<{
    label: string;
    targetSlug: string;
  }>;
  settings: {
    siteName: string | null;
    faviconAssetId: string | null;
    locale: string;
    defaultOgImageAssetId: string | null;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function normalizeOptionalString(value: unknown): string | null {
  const trimmed = readString(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

function toPageSlug(params: { slug: unknown; isHome?: boolean; fallbackPageId: string }): string {
  const rawSlug = readString(params.slug).trim();
  if (params.isHome || rawSlug === '/') return '/';

  const normalized = normalizeSlug(rawSlug);
  if (normalized) return `/${normalized}`;
  return `/page-${params.fallbackPageId}`;
}

function resolveHomePage(pages: SnapshotPageInput[]): SnapshotPageInput | null {
  if (pages.length === 0) return null;
  const explicitHome = pages.find((page) => page.isHome === true);
  if (explicitHome) return explicitHome;

  const slashHome = pages.find((page) => readString(page.slug).trim() === '/');
  if (slashHome) return slashHome;

  const emptySlugHome = pages.find((page) => readString(page.slug).trim() === '');
  if (emptySlugHome) return emptySlugHome;

  return pages[0];
}

function stableClone(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stableClone(item));
  }

  if (value && typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      output[key] = stableClone(input[key]);
    }
    return output;
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableClone(value));
}

export function buildPublishDraftSnapshot(params: {
  project: SnapshotProjectInput;
  pages: SnapshotPageInput[];
  navigationItems: SnapshotNavigationInput[];
}): PublishDraftSnapshot {
  const homePage = resolveHomePage(params.pages);
  const homePageId = homePage?._id ? String(homePage._id) : '';

  const pagesNormalized = params.pages
    .map((page) => {
      const pageId = page._id ? String(page._id) : 'unknown';
      const isHome = homePageId ? pageId === homePageId : false;
      return {
        pageId,
        slug: toPageSlug({ slug: page.slug, isHome, fallbackPageId: pageId }),
        title: readString(page.title).trim(),
        editorJson: stableClone(page.editorJson ?? {}),
        seoJson: stableClone(page.seoJson ?? {}),
      };
    })
    .sort((a, b) => {
      if (a.slug !== b.slug) return a.slug.localeCompare(b.slug);
      if (a.title !== b.title) return a.title.localeCompare(b.title);
      return a.pageId.localeCompare(b.pageId);
    });

  const pageMetaById = Object.fromEntries(
    pagesNormalized.map((page) => [
      page.pageId,
      {
        slug: page.slug,
        title: page.title,
      },
    ]),
  );

  const navigation = params.navigationItems
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const pageId = readString(record.pageId).trim();
      const pageMeta = pageMetaById[pageId];
      if (!pageMeta) return null;

      const label = readString(record.label).trim() || pageMeta.title || pageId;
      return {
        label,
        targetSlug: pageMeta.slug,
      };
    })
    .filter((item): item is { label: string; targetSlug: string } => item !== null);

  return {
    pages: pagesNormalized.map((page) => ({
      slug: page.slug,
      title: page.title,
      editorJson: page.editorJson,
      seoJson: page.seoJson,
    })),
    navigation,
    settings: {
      siteName: normalizeOptionalString(params.project.siteName),
      faviconAssetId: normalizeOptionalString(params.project.faviconAssetId),
      locale: normalizeOptionalString(params.project.locale) ?? normalizeOptionalString(params.project.defaultLocale) ?? 'en',
      defaultOgImageAssetId: normalizeOptionalString(params.project.defaultOgImageAssetId),
    },
  };
}

export function snapshotSignature(snapshot: PublishDraftSnapshot | null | undefined): string {
  if (!snapshot) return '';
  return stableStringify(snapshot);
}
