import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Componente auxiliar que expõe o contexto na tela
function AuthDisplay() {
  const { isAuthenticated, user, loading, error, login, logout, refreshToken } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.email ?? "none"}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <button onClick={() => login("user@plus.com", "Valid@123")}>login</button>
      <button onClick={() => login("bad@plus.com", "wrong").catch(() => {})}>login-fail</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => refreshToken()}>refresh</button>
    </div>
  );
}

const renderCtx = () =>
  render(
    <AuthProvider>
      <AuthDisplay />
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

describe("AuthContext", () => {
  it("inicia com isAuthenticated=false e loading=false sem token salvo", async () => {
    renderCtx();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
    });
  });

  it("login com credenciais válidas seta isAuthenticated=true e user", async () => {
    const user = userEvent.setup();
    renderCtx();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await user.click(screen.getByText("login"));
    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("user@plus.com");
    });
    expect(localStorage.getItem("plus_token")).toBe("mock.jwt.token");
  });

  it("login com credenciais erradas seta error e mantém isAuthenticated=false", async () => {
    const user = userEvent.setup();
    renderCtx();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await user.click(screen.getByText("login-fail"));
    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).not.toHaveTextContent("none");
    });
  });

  it("logout limpa isAuthenticated, user e localStorage", async () => {
    const user = userEvent.setup();
    renderCtx();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("true"));
    await user.click(screen.getByText("logout"));
    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });
    expect(localStorage.getItem("plus_token")).toBeNull();
  });

  it("refreshToken renova o token e mantém sessão ativa", async () => {
    // AuthProvider chama refreshToken() no mount quando plus_token existe
    localStorage.setItem("plus_token", "old.token");
    localStorage.setItem("plus_refresh", "mock.refresh.token");
    renderCtx();
    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("true");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(localStorage.getItem("plus_token")).toBe("mock.jwt.refreshed");
  });

  it("refreshToken com refresh inválido faz logout", async () => {
    server.use(
      http.post("http://localhost:3001/auth/refresh", () =>
        HttpResponse.json({ error: "invalid" }, { status: 401 })
      )
    );
    localStorage.setItem("plus_refresh", "bad.token");
    renderCtx();
    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("useAuth lança erro fora do AuthProvider", () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() => render(<AuthDisplay />)).toThrow();
    console.error = consoleError;
  });
});
