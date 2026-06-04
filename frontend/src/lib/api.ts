import type { ApiEnvelope } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export function getStoredToken() {
  return localStorage.getItem('tzw-auth-token');
}

export function setStoredSession(token: string, user: unknown) {
  localStorage.setItem('tzw-auth-token', token);
  localStorage.setItem('tzw-auth-user', JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem('tzw-auth-token');
  localStorage.removeItem('tzw-auth-user');
}

export function getStoredUser<T>() {
  const value = localStorage.getItem('tzw-auth-user');
  return value ? (JSON.parse(value) as T) : null;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiEnvelope<T> & {
    errors?: Array<{ message: string }>;
  };

  if (!response.ok) {
    const details = payload.errors?.map((error) => error.message).join(' ');
    throw new Error(details ? `${payload.message} ${details}` : payload.message);
  }

  return payload.data ?? (payload as T);
}

export async function downloadCsv(path: string, filename: string) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });

  if (!response.ok) {
    throw new Error('Report export failed.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
