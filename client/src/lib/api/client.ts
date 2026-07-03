import type { ApiEnvelope, ApiErrorBody, ApiResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: { field: string; message: string }[],
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  // Server Components forward the incoming cookie header (next/headers cookies()).
  cookie?: string;
  // Internal guard so the 401→refresh→retry path runs at most once.
  _retry?: boolean;
};

// Best-effort silent refresh. The refresh_token cookie is scoped to this exact
// path (server/src/utils/cookies.ts), so credentials:'include' sends it here.
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function requestEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { body, cookie, _retry, headers: extraHeaders, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(cookie ? { cookie } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}/api/v1${path}`, {
    credentials: 'include',
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });

  // Browser-side: an expired 15-min access token returns 401. Refresh once and retry.
  // Never loop on the auth endpoints themselves.
  const isAuthFlow =
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/logout');
  if (
    response.status === 401 &&
    !_retry &&
    typeof window !== 'undefined' &&
    !isAuthFlow
  ) {
    const refreshed = await tryRefresh();
    if (refreshed) return requestEnvelope<T>(path, { ...options, _retry: true });
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    const err = json as ApiErrorBody;
    throw new ApiRequestError(
      err.error.code,
      err.error.message,
      err.error.details,
      response.status,
    );
  }

  return json as ApiEnvelope<T>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await requestEnvelope<T>(path, options);
  return envelope.data;
}

export type PaginatedResult<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number };
};

// For the server's `paginated()` envelope — keeps `meta` instead of discarding it.
async function requestList<T>(
  path: string,
  options: RequestOptions = {},
): Promise<PaginatedResult<T>> {
  const envelope = (await requestEnvelope<T[]>(path, options)) as ApiEnvelope<T[]> & {
    meta: { page: number; limit: number; total: number };
  };
  return { data: envelope.data, meta: envelope.meta };
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>(path, { method: 'GET', ...options }),

  getList: <T>(path: string, options?: RequestOptions): Promise<PaginatedResult<T>> =>
    requestList<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(path, { method: 'POST', body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(path, { method: 'PATCH', body, ...options }),

  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>(path, { method: 'DELETE', ...options }),
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string | null {
  return error instanceof ApiRequestError ? error.code : null;
}
