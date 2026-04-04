import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Iniciar sesión — recibe el objeto user que devuelve la API
  const login = (userData) => {
    setUser(userData);
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
  };

  // Actualizar datos parciales del usuario (ej: foto, rating)
  const updateUser = (partialData) => {
    setUser((prev) => (prev ? { ...prev, ...partialData } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}