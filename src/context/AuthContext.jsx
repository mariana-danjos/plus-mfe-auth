import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";
const TOKEN_KEY   = "plus_token";
const REFRESH_KEY = "plus_refresh";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    user:            null,
    token:           localStorage.getItem(TOKEN_KEY) || null,
    loading:         true,
    error:           null,
  });
  const timerRef = useRef(null);

  // Decode JWT payload without external lib
  function parseExp(token) {
    try { return JSON.parse(atob(token.split(".")[1])).exp * 1000; }
    catch { return null; }
  }

  const scheduleRefresh = useCallback((token, refreshFn) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const exp = parseExp(token);
    if (!exp) return;
    const delay = Math.max(exp - Date.now() - 60_000, 0);
    timerRef.current = setTimeout(refreshFn, delay);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      setState(s => ({ ...s, isAuthenticated: false, user: null, token: null, loading: false }));
      return;
    }
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) throw new Error("expired");
      const { token, refreshToken: newRefresh, user } = await res.json();
      localStorage.setItem(TOKEN_KEY, token);
      if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
      setState(s => ({ ...s, isAuthenticated: true, user, token, loading: false, error: null }));
      scheduleRefresh(token, refreshToken);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      setState(s => ({ ...s, isAuthenticated: false, user: null, token: null, loading: false }));
    }
  }, [scheduleRefresh]);

  // On mount: validate existing token
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      refreshToken();
    } else {
      setState(s => ({ ...s, loading: false }));
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [refreshToken]);

  const login = async (email, password) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const apiMsg = typeof body.error === "string" ? body.error : body.error?.message;
      const fallback = res.status === 401 ? "E-mail ou senha incorretos." : "Erro ao entrar.";
      const error = apiMsg || fallback;
      setState(s => ({ ...s, loading: false, error }));
      throw new Error(error);
    }
    const { token, refreshToken: refresh, user } = await res.json();
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    setState({ isAuthenticated: true, user, token, loading: false, error: null });
    scheduleRefresh(token, refreshToken);
  };

  const signup = async (data) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const apiMsg = typeof body.error === "string" ? body.error : body.error?.message;
      const fallback = res.status === 409 ? "E-mail já cadastrado." : "Erro ao criar conta.";
      const error = apiMsg || fallback;
      setState(s => ({ ...s, loading: false, error }));
      throw new Error(error);
    }
    const { token, refreshToken: refresh, user } = await res.json();
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
      setState({ isAuthenticated: true, user, token, loading: false, error: null });
      scheduleRefresh(token, refreshToken);
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const logout = async () => {
    const { token } = state;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ isAuthenticated: false, user: null, token: null, loading: false, error: null });
    // best-effort server-side invalidation
    fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
