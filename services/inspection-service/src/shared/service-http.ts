import { createHttpError } from '../utils/http-error';

interface RequestJsonOptions {
  method?: string;
  token?: string;
  body?: unknown;
}

export async function requestJson<T>(url: string, options: RequestJsonOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options.token) {
    headers.Authorization = options.token.startsWith('Bearer ')
      ? options.token
      : `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw createHttpError(payload?.message ?? 'Service request failed.', response.status);
  }

  return (payload?.data ?? payload) as T;
}

export function bearerFromHeaders(headers: { authorization?: string }) {
  return headers.authorization;
}
