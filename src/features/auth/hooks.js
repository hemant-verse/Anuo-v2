'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, logout as logoutRequest } from './api';
import ApiClient from '@/lib/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;
        setUser(currentUser);
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setChecked(true);
      }
    };

    const handleAuthChanged = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;
        setUser(currentUser);
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setChecked(true);
      }
    };

    void initializeAuth();
    window.addEventListener('auth-changed', handleAuthChanged);
    return () => {
      active = false;
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      ApiClient.clearToken();
      setUser(null);
      setChecked(true);
    }
  }, []);

  const value = useMemo(() => ({ user, checked, refreshUser, logout }), [user, checked, refreshUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
