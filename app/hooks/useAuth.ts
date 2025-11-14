'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AuthenticatedUser = {
  _id: string;
  email: string;
  displayName?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

interface LoginSuccessResponse {
  user?: AuthenticatedUser;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export const TOKEN_STORAGE_KEY = 'procrastiPlanner.authToken';
const COOKIE_NAME = 'auth-session';
const DEFAULT_MAX_AGE = 60 * 60 * 24; // 24 ore

const isBrowser = () => typeof window !== 'undefined';

const extractMessage = (input: unknown): string | null => {
  if (input && typeof input === 'object') {
    const maybeRecord = input as Record<string, unknown>;
    if (typeof maybeRecord.message === 'string') {
      return maybeRecord.message;
    }
  }

  return null;
};

const persistToken = (token: string | null, maxAgeSeconds: number = DEFAULT_MAX_AGE) => {
  if (!isBrowser()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const secureSegment = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      token,
    )}; path=/; max-age=${maxAgeSeconds}; samesite=strict${secureSegment}`;
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=strict`;
  }
};

export const readToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export function useAuth(): {
  user: AuthenticatedUser | null;
  login: (email: string, password: string) => Promise<AuthenticatedUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthenticatedUser | null>;
  loading: boolean;
} {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeUser = useCallback((nextUser: AuthenticatedUser | null) => {
    if (isMountedRef.current) {
      setUser(nextUser);
    }
  }, []);

  const setSafeLoading = useCallback((nextLoading: boolean) => {
    if (isMountedRef.current) {
      setLoading(nextLoading);
    }
  }, []);

  const fetchSession = useCallback(async (): Promise<AuthenticatedUser | null> => {
    try {
      const token = readToken();
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          persistToken(null);
        }

        setSafeUser(null);
        return null;
      }

      const data = (await response.json()) as AuthenticatedUser | { user: AuthenticatedUser };
      const resolvedUser = 'user' in data ? data.user : data;

      setSafeUser(resolvedUser);
      return resolvedUser;
    } catch (error) {
      console.error('Errore durante la verifica della sessione', error);
      setSafeUser(null);
      return null;
    }
  }, [setSafeUser]);

  useEffect(() => {
    setSafeLoading(true);

    void fetchSession().finally(() => {
      setSafeLoading(false);
    });
  }, [fetchSession, setSafeLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setSafeLoading(true);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        let data: unknown = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const message = extractMessage(data) ?? 'Credenziali non valide. Riprova.';
          throw new Error(message);
        }

        const payload = (data ?? {}) as LoginSuccessResponse;
        const tokenToPersist = payload.accessToken ?? payload.token ?? null;

        if (tokenToPersist) {
          persistToken(tokenToPersist, payload.expiresIn ?? DEFAULT_MAX_AGE);
        }

        if (payload.user) {
          setSafeUser(payload.user);
          return payload.user;
        }

        return await fetchSession();
      } catch (error) {
        throw error instanceof Error ? error : new Error('Errore durante il login.');
      } finally {
        setSafeLoading(false);
      }
    },
    [fetchSession, setSafeLoading, setSafeUser],
  );

  const refreshUser = useCallback(async () => {
    return fetchSession();
  }, [fetchSession]);

  const logout = useCallback(async () => {
    setSafeLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        let data: unknown = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        const message = extractMessage(data) ?? 'Impossibile completare il logout.';
        throw new Error(message);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Errore di rete durante il logout.');
    } finally {
      persistToken(null);
      setSafeUser(null);
      setSafeLoading(false);
    }
  }, [setSafeLoading, setSafeUser]);

  return {
    user,
    login,
    logout,
    refreshUser,
    loading,
  };
}
