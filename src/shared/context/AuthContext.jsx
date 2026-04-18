import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'freetime_user';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers – decide which storage to read/write based on "remember" flag.
// • remember = true  → localStorage  (survives browser close)
// • remember = false → sessionStorage (cleared when tab/window closes)
// ─────────────────────────────────────────────────────────────────────────────
function saveSession(user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  // Always clear the other one to avoid stale data
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  storage.setItem(STORAGE_KEY, JSON.stringify({ user, remember }));
}

function loadSession() {
  // Check localStorage first (persisted), then sessionStorage (temporary)
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // corrupt data – ignore
    }
  }
  return null;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(true); // hydrating from storage

  // Hydrate on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.user) {
      setUser(session.user);
      setRemember(session.remember ?? false);
    }
    setLoading(false);
  }, []);

  /**
   * login(user, rememberMe?)
   *   rememberMe defaults to true for Google sign-in and register flows
   *   (user never explicitly opted out), false for manual login default.
   */
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

  /**
   * updateUser – patch stored user data (e.g. after profile edit)
   */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      saveSession(updated, remember);
      return updated;
    });
  }, [remember]);

  return (
    <AuthContext.Provider value={{ user, remember, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}