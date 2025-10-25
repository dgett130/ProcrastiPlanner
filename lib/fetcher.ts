'use client';

import { TOKEN_STORAGE_KEY } from '@/app/hooks/useAuth';

const isBrowser = typeof window !== 'undefined';

const readToken = () => {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export async function fetcher<TResponse>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers ?? {});
  const token = readToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Ignore JSON parsing failure: keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}
