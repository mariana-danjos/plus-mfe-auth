import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
  type ReactNode,
} from "react";

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";
const TOKEN_KEY   = "plus_token";
const REFRESH_KEY = "plus_refresh";

export type Role = "vendedor" | "gestor" | "admin";

export type User = {
  name: string;
  email: string;
  roles?: Role[];
};

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  role: Role;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
};

type AuthResponse = {
  token: string;
  refreshToken?: string;
  user: User;
};

type ApiError = { error?: string | { message?: string } };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user:            null,
    token:           localStorage.getItem(TOKEN_KEY) || null,
    loading:         true,
    error:           null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function parseExp(token: string): number | null {
    try { return JSON.parse(atob(token.split(".")[1])).exp * 1000; }
    catch { return null; }
  }

  const scheduleRefresh = useCallback((token: string, refreshFn: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const exp = parseExp(token);
    if (!exp) return;
    const delay = Math.max(exp - Date.now() - 60_000, 0);
    timerRef.current = setTimeout(refreshFn, delay);
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
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
      const { token, refreshToken: newRefresh, user } = (await res.json()) as AuthResponse;
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

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      refreshToken();
    } else {
      setState(s => ({ ...s, loading: false }));
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [refreshToken]);

  const login = async (email: string, password: string): Promise<void> => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as ApiError;
      const apiMsg = typeof body.error === "string" ? body.error : body.error?.message;
      const fallback = res.status === 401 ? "E-mail ou senha incorretos." : "Erro ao entrar.";
      const error = apiMsg || fallback;
      setState(s => ({ ...s, loading: false, error }));
      throw new Error(error);
    }
    const { token, refreshToken: refresh, user } = (await res.json()) as AuthResponse;
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    setState({ isAuthenticated: true, user, token, loading: false, error: null });
    scheduleRefresh(token, refreshToken);
  };

  const signup = async (data: SignupPayload): Promise<void> => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as ApiError;
      const apiMsg = typeof body.error === "string" ? body.error : body.error?.message;
      const fallback = res.status === 409 ? "E-mail já cadastrado." : "Erro ao criar conta.";
      const error = apiMsg || fallback;
      setState(s => ({ ...s, loading: false, error }));
      throw new Error(error);
    }
    const { token, refreshToken: refresh, user } = (await res.json()) as AuthResponse;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
      setState({ isAuthenticated: true, user, token, loading: false, error: null });
      scheduleRefresh(token, refreshToken);
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    const { token } = state;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ isAuthenticated: false, user: null, token: null, loading: false, error: null });
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
