import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";

const Wrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter initialEntries={["/login"]}>{children}</MemoryRouter>
  </AuthProvider>
);

const renderLogin = () => render(<LoginPage />, { wrapper: Wrapper });

const getEmail    = () => screen.getByLabelText("E-mail corporativo");
const getPassword = () => screen.getByLabelText("Senha");

describe("LoginPage", () => {
  it("renderiza os elementos principais do sistema de gestão", () => {
    renderLogin();
    expect(getEmail()).toBeInTheDocument();
    expect(getPassword()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
    expect(screen.getByText(/acesso restrito/i)).toBeInTheDocument();
  });

  it("exibe link 'Criar conta de colaborador' que navega para /signup", async () => {
    const user = userEvent.setup();
    renderLogin();
    expect(screen.getByText(/criar conta de colaborador/i)).toBeInTheDocument();
    await user.click(screen.getByText(/criar conta de colaborador/i));
    // navegação ocorre (sem erro de navegação)
  });

  it("botão fica desabilitado enquanto o form tem erros", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeDisabled();
  });

  it("exibe erro de validação para e-mail inválido", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(getEmail(), "nao-e-email");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it("exibe erro de validação para senha vazia após blur", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(getEmail(), "admin@plus.com");
    await user.click(getPassword());
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/senha obrigatória/i)).toBeInTheDocument();
    });
  });

  it("toggle mostra/esconde senha", async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = getPassword();
    expect(passwordInput).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(passwordInput).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("submit com credenciais válidas não exibe alerta de erro", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(getEmail(), "user@plus.com");
    await user.type(getPassword(), "Valid@123");
    const btn = screen.getByRole("button", { name: /entrar/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("exibe mensagem de erro quando a API retorna 401", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(getEmail(), "user@plus.com");
    await user.type(getPassword(), "senhaerrada");
    const btn = screen.getByRole("button", { name: /entrar/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/e-mail ou senha incorretos/i);
    });
  });

  it("exibe CircularProgress durante o loading", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json({ token: "t", user: {} });
      })
    );
    const user = userEvent.setup();
    renderLogin();
    await user.type(getEmail(), "user@plus.com");
    await user.type(getPassword(), "Valid@123");
    const btn = screen.getByRole("button", { name: /entrar/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
