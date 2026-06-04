import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  apiRequest,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession
} from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void apiRequest<User>('/users/me')
      .then((profile) => {
        setUser(profile);
        setStoredSession(token, profile);
      })
      .catch(() => {
        clearStoredSession();
        setToken(null);
        setUser(null);
      });
  }, [token]);

  async function login(email: string, password: string) {
    setLoading(true);
    setAuthError(null);

    try {
      const result = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      setStoredSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    setLoading(true);
    setAuthError(null);

    try {
      const result = await apiRequest<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: payload
      });
      setStoredSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>) {
    const profile = await apiRequest<User>('/users/me', {
      method: 'PATCH',
      body: payload
    });
    setUser(profile);
    if (token) {
      setStoredSession(token, profile);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await apiRequest('/users/me/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword }
    });
  }

  function logout() {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      authError,
      login,
      register,
      updateProfile,
      changePassword,
      logout
    }),
    [user, token, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
