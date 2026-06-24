import type { ApiEnvelope, ApiError, ApiResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  cookie?: string;
};

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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, cookie, headers: extraHeaders, ...rest } = options;

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

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    const err = json as ApiError;
    throw new ApiRequestError(
      err.error.code,
      err.error.message,
      err.error.details,
      response.status,
    );
  }

  return (json as ApiEnvelope<T>).data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>(path, { method: 'GET', ...options }),

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
