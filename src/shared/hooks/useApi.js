import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook reutilizable para llamadas a la API.
 * Maneja loading, error y autenticación automáticamente.
 *
 * Uso:
 *   const { data, loading, error, request } = useApi();
 *   await request('/api/tasks', { method: 'GET' });
 */
export function useApi() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(
    async (url, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          ...options.headers,
        };

        const res = await fetch(url, { ...options, headers });
        const json = await res.json();

        if (!res.ok) {
          const errMsg = json.message || 'Error en la solicitud';
          setError(errMsg);
          return { ok: false, data: null, error: errMsg };
        }

        setData(json);
        return { ok: true, data: json, error: null };
      } catch (err) {
        const errMsg = 'Error de conexión. Intenta de nuevo.';
        setError(errMsg);
        console.error(err);
        return { ok: false, data: null, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { data, loading, error, request };
}