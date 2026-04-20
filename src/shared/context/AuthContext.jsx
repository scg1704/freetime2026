// src/shared/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'freetime_user';

// ─────────────────────────────────────────────
// Storage helpers
// remember = true  → localStorage  (survives browser close)
// remember = false → sessionStorage (cleared when tab closes)
// ─────────────────────────────────────────────
function saveSession(user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  storage.setItem(STORAGE_KEY, JSON.stringify({ user, remember }));
}

function loadSession() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // corrupt – ignore
    }
  }
  return null;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(true);

  // Hydrate on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.user) {
      setUser(session.user);
      setRemember(session.remember ?? false);
    }
    setLoading(false);
  }, []);

  // login(userData, rememberMe?)
  const login = useCallback((userData, rememberMe = true) => {
    setUser(userData);
    setRemember(rememberMe);
    saveSession(userData, rememberMe);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRemember(false);
    clearSession();
  }, []);

  // updateUser — patch stored user data (e.g. after profile edit)
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      saveSession(updated, remember);
      return updated;
    });
  }, [remember]);

  // markVerified — llamado por VerificationPage al completar la verificación biométrica.
  // Marca verified=true en el estado y en storage para que las rutas protegidas
  // dejen pasar al usuario sin necesidad de recargar.
  const markVerified = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, verified: true };
      saveSession(updated, remember);
      return updated;
    });
  }, [remember]);

  return (
    <AuthContext.Provider value={{ user, remember, loading, login, logout, updateUser, markVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}