export type PublishUrlBuilderInput = {
  minioBaseUrl: string;
  tenantId: string;
  projectId: string;
  publishId: string;
};

export type PublishPageUrlInput = PublishUrlBuilderInput & {
  slug?: string;
  isHome?: boolean;
};

function trimSlashes(value: string): string {
  return value.replace(/^\/+/, '').replace(/\/+$/, '');
}

function normalizeBase(base: string): string {
  return base.trim().replace(/\/+$/, '');
}

function normalizeSlug(slug: string): string {
  const trimmed = trimSlashes(slug.trim());
  if (!trimmed) return '';

  const segments = trimmed
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment));

  return segments.join('/');
}

function isHomeSlug(slug?: string): boolean {
  if (typeof slug !== 'string') return false;
  const value = slug.trim().toLowerCase();
  return value === '' || value === '/' || value === 'home';
}

export function buildPublishBaseUrl(params: PublishUrlBuilderInput): string {
  const base = normalizeBase(params.minioBaseUrl);
  const tenantId = encodeURIComponent(params.tenantId.trim());
  const projectId = encodeURIComponent(params.projectId.trim());
  const publishId = encodeURIComponent(params.publishId.trim());

  return `${base}/buildaweb-sites/tenants/${tenantId}/projects/${projectId}/publishes/${publishId}`;
}

export function buildPublishIndexUrl(params: PublishUrlBuilderInput): string {
  return `${buildPublishBaseUrl(params)}/index.html`;
}

export function buildPublishPageUrl(params: PublishPageUrlInput): string {
  if (params.isHome || isHomeSlug(params.slug)) {
    return buildPublishIndexUrl(params);
  }

  const normalizedSlug = normalizeSlug(params.slug ?? '');
  if (!normalizedSlug) {
    throw new Error('Slug cannot be empty for non-home page URL');
  }

  return `${buildPublishBaseUrl(params)}/${normalizedSlug}/index.html`;
}

export function parsePublishBaseUrl(baseUrl: string): PublishUrlBuilderInput | null {
  const raw = baseUrl.trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    const rootIndex = pathSegments.indexOf('buildaweb-sites');
    if (rootIndex < 0) return null;

    const markerTenant = pathSegments[rootIndex + 1];
    const tenantId = pathSegments[rootIndex + 2];
    const markerProject = pathSegments[rootIndex + 3];
    const projectId = pathSegments[rootIndex + 4];
    const markerPublish = pathSegments[rootIndex + 5];
    const publishId = pathSegments[rootIndex + 6];

    if (
      markerTenant !== 'tenants' ||
      markerProject !== 'projects' ||
      markerPublish !== 'publishes' ||
      !tenantId ||
      !projectId ||
      !publishId
    ) {
      return null;
    }

    const beforeRoot = pathSegments.slice(0, rootIndex);
    const minioBaseUrl = `${parsed.origin}${beforeRoot.length > 0 ? `/${beforeRoot.join('/')}` : ''}`;

    return {
      minioBaseUrl,
      tenantId: decodeURIComponent(tenantId),
      projectId: decodeURIComponent(projectId),
      publishId: decodeURIComponent(publishId),
    };
  } catch {
    return null;
  }
}
