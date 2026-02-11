import { getAuthToken } from './auth';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string; details?: string[] } };
type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

type JsonRecord = Record<string, unknown>;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function isObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return isObject(value) && value.ok === true && 'data' in value;
}

function isApiFailure(value: unknown): value is ApiFailure {
  return (
    isObject(value) &&
    value.ok === false &&
    isObject(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string'
  );
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: string[];

  constructor(params: { status: number; code: string; message: string; details?: string[] }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
    });
  }

  const body = (await parseJson(response)) as ApiEnvelope<T> | null;

  if (body && isApiFailure(body)) {
    const details =
      Array.isArray(body.error.details) && body.error.details.every((item) => typeof item === 'string')
        ? body.error.details
        : undefined;
    throw new ApiError({
      status: response.status,
      code: body.error.code,
      message: body.error.message,
      details,
    });
  }

  if (body && isApiSuccess<T>(body)) {
    return body.data;
  }

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed',
    });
  }

  throw new ApiError({
    status: response.status,
    code: 'INVALID_RESPONSE_SHAPE',
    message: 'Invalid API response shape',
  });
}

export type AuthUser = {
  id?: string;
  _id?: string;
  email: string;
  name?: string | null;
  tenantId?: string;
  status?: 'active' | 'disabled';
  createdAt?: string;
  updatedAt?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  name?: string;
};

export type SignupResult = {
  user: AuthUser;
  accessToken: string;
};

export type LoginResult = {
  user: AuthUser;
  accessToken: string;
};

export type MeResult = {
  user: AuthUser;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ForgotPasswordResult = {
  debugResetToken?: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type ResetPasswordResult = Record<string, never>;

export type ProjectStatus = 'draft' | 'published' | 'archived';

export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  defaultLocale: string;
  siteName?: string | null;
  logoAssetId?: string | null;
  faviconAssetId?: string | null;
  defaultOgImageAssetId?: string | null;
  locale?: string | null;
  homePageId?: string | null;
  latestPublishId?: string | null;
  publishedAt?: string | null;
  hasUnpublishedChanges?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProjectInput = {
  name: string;
  defaultLocale?: string;
};

export type CreateProjectResult = {
  project_id: string;
};

export type ListProjectsResult = {
  projects: ProjectSummary[];
};

export type GetProjectResult = {
  project: ProjectSummary;
};

export type SetProjectHomeInput = {
  pageId: string;
};

export type SetProjectHomeResult = {
  homePageId: string;
  slug: '/';
};

export type ProjectSettings = {
  siteName: string | null;
  logoAssetId: string | null;
  faviconAssetId: string | null;
  defaultOgImageAssetId: string | null;
  locale: string;
};

export type GetProjectSettingsResult = {
  settings: ProjectSettings;
};

export type UpdateProjectSettingsInput = {
  siteName?: string | null;
  logoAssetId?: string | null;
  faviconAssetId?: string | null;
  defaultOgImageAssetId?: string | null;
  locale?: string | null;
};

export type UpdateProjectSettingsResult = {
  settings: ProjectSettings;
};

export type CreatePageInput = {
  title: string;
  slug: string;
  isHome?: boolean;
};

export type CreatePageResult = {
  page_id: string;
};

export type PageRecord = {
  _id?: string;
  id?: string;
  title?: string;
  slug?: string;
  isHome?: boolean;
  editorJson?: Record<string, unknown>;
  seoJson?: Record<string, unknown>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
};

export type GetPageResult = {
  page: PageRecord;
};

export type ListPagesResult = {
  pages: PageMetaSummary[];
};

export type UpdatePageInput = {
  page: Record<string, unknown>;
  version: number;
  seoJson?: Record<string, unknown>;
};

export type UpdatePageResult = {
  page_id: string;
  version: number;
};

export type PageMetaSummary = {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  updatedAt?: string;
  version: number;
};

export type UpdatePageMetaInput = {
  title?: string;
  slug?: string;
  seoJson?: Record<string, unknown>;
};

export type UpdatePageMetaResult = {
  page: PageMetaSummary;
};

export type DuplicatePageResult = {
  page?: PageMetaSummary;
  page_id?: string;
};

export type DuplicatePageInput = {
  title?: string;
  slug?: string;
};

export type DeletePageResult = {
  deleted: boolean;
};

export type PagePreviewResult = {
  html: string;
  css: string;
  hash: string;
  headTags?: string;
  lang?: string;
};

export type UploadAssetResult = {
  assetId: string;
  publicUrl: string;
};

export type ProjectAsset = {
  id: string;
  fileName: string;
  mimeType?: string | null;
  size: number;
  publicUrl: string;
  createdAt?: string;
};

export type ListAssetsResult = {
  assets: ProjectAsset[];
};

export type ResolveAssetsItem = {
  assetId: string;
  publicUrl: string;
};

export type ResolveAssetsResult = {
  items: ResolveAssetsItem[];
};

export type NavigationItem = {
  label: string;
  pageId: string;
};

export type NavigationCta = {
  label: string;
  href: string;
};

export type NavigationResult = {
  items: NavigationItem[];
  cta?: NavigationCta;
};

export type UpdateNavigationInput = {
  items: NavigationItem[];
  cta?: NavigationCta;
};

export type PublishStatus = 'publishing' | 'live' | 'failed';

export type PublishResult = {
  publishId: string;
  status: PublishStatus;
  url: string;
  slug?: string | null;
  publishedUrl?: string | null;
  publishedSlug?: string | null;
  baseUrl?: string;
  errorMessage?: string;
};

export type LatestPublishResult = {
  publishId: string;
  status: PublishStatus;
  url: string;
  slug?: string | null;
  publishedUrl?: string | null;
  publishedSlug?: string | null;
  baseUrl?: string;
  timestamp?: string | null;
  errorMessage?: string;
};

export type PublishHistoryItem = {
  publishId: string;
  status: PublishStatus;
  createdAt?: string | null;
  baseUrl: string;
};

export type ListPublishesResult = {
  publishes: PublishHistoryItem[];
};

export type SetLatestPublishInput = {
  publishId: string;
};

export type SetLatestPublishResult = {
  project: ProjectSummary;
};

export const authApi = {
  signup(input: SignupInput) {
    return apiRequest<SignupResult>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  login(input: LoginInput) {
    return apiRequest<LoginResult>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  me() {
    return apiRequest<MeResult>('/api/v1/auth/me', {
      method: 'GET',
    });
  },
  forgotPassword(input: ForgotPasswordInput) {
    return apiRequest<ForgotPasswordResult>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  resetPassword(input: ResetPasswordInput) {
    return apiRequest<ResetPasswordResult>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export const projectsApi = {
  list() {
    return apiRequest<ListProjectsResult>('/api/v1/projects', {
      method: 'GET',
    });
  },
  create(input: CreateProjectInput) {
    return apiRequest<CreateProjectResult>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  get(projectId: string) {
    return apiRequest<GetProjectResult>(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
      method: 'GET',
    });
  },
  setHome(projectId: string, input: SetProjectHomeInput) {
    return apiRequest<SetProjectHomeResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/home`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  getSettings(projectId: string) {
    return apiRequest<GetProjectSettingsResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/settings`, {
      method: 'GET',
    });
  },
  updateSettings(projectId: string, input: UpdateProjectSettingsInput) {
    return apiRequest<UpdateProjectSettingsResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/settings`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
};

export const pagesApi = {
  create(projectId: string, input: CreatePageInput) {
    return apiRequest<CreatePageResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/pages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  list(projectId: string) {
    return apiRequest<ListPagesResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/pages`, {
      method: 'GET',
    });
  },
  get(projectId: string, pageId: string) {
    return apiRequest<GetPageResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
      {
        method: 'GET',
      },
    );
  },
  update(projectId: string, pageId: string, input: UpdatePageInput) {
    return apiRequest<UpdatePageResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    );
  },
  updateMeta(projectId: string, pageId: string, input: UpdatePageMetaInput) {
    return apiRequest<UpdatePageMetaResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}/meta`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );
  },
  duplicate(projectId: string, pageId: string, input?: DuplicatePageInput) {
    return apiRequest<DuplicatePageResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}/duplicate`,
      {
        method: 'POST',
        ...(input ? { body: JSON.stringify(input) } : {}),
      },
    );
  },
  remove(projectId: string, pageId: string, version?: number) {
    const query = typeof version === 'number' ? `?version=${encodeURIComponent(String(version))}` : '';
    return apiRequest<DeletePageResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}${query}`,
      {
        method: 'DELETE',
      },
    );
  },
  preview(projectId: string, pageId: string) {
    return apiRequest<PagePreviewResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/preview/${encodeURIComponent(pageId)}`,
      {
        method: 'GET',
      },
    );
  },
};

export const navigationApi = {
  get(projectId: string) {
    return apiRequest<NavigationResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/navigation`, {
      method: 'GET',
    });
  },
  update(projectId: string, input: UpdateNavigationInput) {
    return apiRequest<NavigationResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/navigation`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
};

export const assetsApi = {
  list(projectId: string) {
    return apiRequest<ListAssetsResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/assets`, {
      method: 'GET',
    });
  },
  upload(projectId: string, file: File) {
    const body = new FormData();
    body.append('file', file);

    return apiRequest<UploadAssetResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/assets/upload`, {
      method: 'POST',
      body,
    });
  },
  resolve(projectId: string, assetIds: string[]) {
    return apiRequest<ResolveAssetsResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/assets/resolve`, {
      method: 'POST',
      body: JSON.stringify({ assetIds }),
    });
  },
};

export const publishApi = {
  create(projectId: string) {
    return apiRequest<PublishResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/publish`, {
      method: 'POST',
    });
  },
  list(projectId: string, limit = 10) {
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    return apiRequest<ListPublishesResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/publishes?limit=${encodeURIComponent(String(normalizedLimit))}`,
      {
        method: 'GET',
      },
    );
  },
  setLatest(projectId: string, input: SetLatestPublishInput) {
    return apiRequest<SetLatestPublishResult>(`/api/v1/projects/${encodeURIComponent(projectId)}/publish/latest`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  getLatest(projectId: string) {
    return apiRequest<LatestPublishResult | null>(`/api/v1/projects/${encodeURIComponent(projectId)}/publish/latest`, {
      method: 'GET',
    });
  },
  getStatus(projectId: string, publishId: string) {
    return apiRequest<PublishResult>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/publish/${encodeURIComponent(publishId)}`,
      {
        method: 'GET',
      },
    );
  },
};
