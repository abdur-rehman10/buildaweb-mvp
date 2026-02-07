import { getAuthToken } from './auth';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

type JsonRecord = Record<string, unknown>;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api/v1';

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

  constructor(params: { status: number; code: string; message: string }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const body = (await parseJson(response)) as ApiEnvelope<T> | null;

  if (body && isApiFailure(body)) {
    throw new ApiError({
      status: response.status,
      code: body.error.code,
      message: body.error.message,
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

export type LoginResult = {
  user: AuthUser;
  accessToken: string;
};

export type MeResult = {
  user: AuthUser;
};

export type ProjectStatus = 'draft' | 'published' | 'archived';

export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  defaultLocale: string;
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

export type UpdatePageInput = {
  page: Record<string, unknown>;
  version: number;
};

export type UpdatePageResult = {
  page_id: string;
  version: number;
};

export const authApi = {
  login(input: LoginInput) {
    return apiRequest<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  me() {
    return apiRequest<MeResult>('/auth/me', {
      method: 'GET',
    });
  },
};

export const projectsApi = {
  list() {
    return apiRequest<ListProjectsResult>('/projects', {
      method: 'GET',
    });
  },
  create(input: CreateProjectInput) {
    return apiRequest<CreateProjectResult>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  get(projectId: string) {
    return apiRequest<GetProjectResult>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'GET',
    });
  },
};

export const pagesApi = {
  create(projectId: string, input: CreatePageInput) {
    return apiRequest<CreatePageResult>(`/projects/${encodeURIComponent(projectId)}/pages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  get(projectId: string, pageId: string) {
    return apiRequest<GetPageResult>(
      `/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
      {
        method: 'GET',
      },
    );
  },
  update(projectId: string, pageId: string, input: UpdatePageInput) {
    return apiRequest<UpdatePageResult>(
      `/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    );
  },
};
