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
