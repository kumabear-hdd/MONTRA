/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  error: string | null;
  clearError: () => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  quickStart: () => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; previewCode?: string; error?: string }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
    confirmPassword?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  setIsNewUser: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'montra_auth_token';
const STORAGE_TYPE_KEY = 'montra_storage_type';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper to get active token from either localStorage or sessionStorage
  const getStoredToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  };

  const saveToken = (newToken: string, rememberMe: boolean) => {
    setToken(newToken);
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(STORAGE_TYPE_KEY, 'local');
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(STORAGE_TYPE_KEY, 'session');
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const removeStoredToken = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  // Verify and restore authenticated session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            removeStoredToken();
          }
        } else {
          // Token expired or invalid
          removeStoredToken();
        }
      } catch (err) {
        console.error('Session validation error:', err);
        // Retain offline ability or remove invalid token
        removeStoredToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 1. User Registration
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Pendaftaran akun gagal. Silakan periksa formulir.');
        return false;
      }

      if (data.token && data.user) {
        saveToken(data.token, true); // default remember for register
        setUser(data.user);
        setIsNewUser(true);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Registration network error:', err);
      setError('Koneksi terputus. Pastikan server aktif dan coba lagi.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. User Login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Email atau kata sandi tidak sesuai.');
        return false;
      }

      if (data.token && data.user) {
        saveToken(data.token, !!credentials.rememberMe);
        setUser(data.user);
        setIsNewUser(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login network error:', err);
      setError('Koneksi terputus saat login. Silakan coba lagi beberapa saat.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 2b. Quick Start Clean Account
  const quickStart = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: AuthResponse = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Gagal memulai akun cepat.');
        return false;
      }

      if (data.token && data.user) {
        saveToken(data.token, true);
        setUser(data.user);
        setIsNewUser(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Quick start network error:', err);
      setError('Koneksi terputus saat membuat akun cepat.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const currentToken = getStoredToken();
      if (currentToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      removeStoredToken();
      setIsLoading(false);
    }
  };

  // 4. Forgot Password
  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; previewCode?: string; error?: string }> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Gagal mengirim kode pemulihan sandi.' };
      }
      return { success: true, message: data.message, previewCode: data.previewCode };
    } catch (err: any) {
      return { success: false, error: 'Terjadi gangguan jaringan.' };
    }
  };

  // 5. Reset Password
  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Gagal memperbarui kata sandi.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: 'Terjadi gangguan jaringan saat reset kata sandi.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isNewUser,
        error,
        clearError,
        login,
        register,
        quickStart,
        logout,
        forgotPassword,
        resetPassword,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
