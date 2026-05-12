import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { AuthProvider } from "../context/AuthContext";
import SignupPage from "../pages/SignupPage";

const Wrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter initialEntries={["/signup"]}>{children}</MemoryRouter>
  </AuthProvider>
);

const renderSignup = () => render(<SignupPage />, { wrapper: Wrapper });

// Helpers de query
const getName       = () => screen.getByLabelText(/nome completo/i);
const getEmail      = () => screen.getByLabelText(/e-mail corporativo/i);
const getRoleSelect = () => screen.getByRole("combobox");
const getPassword   = () => screen.getByLabelText("Senha de acesso");
const getConfirm    = () => screen.getByLabelText("Confirmar senha");

const fillValidForm = async (user, overrides = {}) => {
  const vals = {
    name:            "Ana Gestora",
    email:           "ana@plus.com",
    roleLabel:       "Gestor",
    password:        "Senh@Forte1",
    passwordConfirm: "Senh@Forte1",
    ...overrides,
  };
  await user.type(getName(), vals.name);
  await user.type(getEmail(), vals.email);

  await user.click(getRoleSelect());
  await user.click(screen.getByRole("option", { name: new RegExp(vals.roleLabel, "i") }));

  await user.type(getPassword(), vals.password);
  await user.type(getConfirm(), vals.passwordConfirm);
};

describe("SignupPage — Criar Conta de Colaborador", () => {
  it("renderiza todos os campos do formulário de colaborador", () => {
    renderSignup();
    expect(getName()).toBeInTheDocument();
    expect(getEmail()).toBeInTheDocument();
    expect(getRoleSelect()).toBeInTheDocument();
    expect(getPassword()).toBeInTheDocument();
    expect(getConfirm()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
  });

  it("botão fica desabilitado com form vazio", () => {
    renderSignup();
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeDisabled();
  });

  it("exibe erro para nome menor que 2 caracteres", async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(getName(), "A");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it("exibe erro para e-mail inválido", async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(getEmail(), "invalido");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it("exibe opções de cargo: Vendedor, Gestor, Administrador", async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.click(getRoleSelect());
    expect(screen.getByRole("option", { name: /vendedor/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /gestor/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /administrador/i })).toBeInTheDocument();
  });

  it("botão fica desabilitado quando senhas não coincidem", async () => {
    const user = userEvent.setup();
    renderSignup();
    // Preenche o formulário com senhas iguais → fica habilitado
    await fillValidForm(user);
    const btn = screen.getByRole("button", { name: /criar conta/i });
    await waitFor(() => expect(btn).toBeEnabled());

    // Altera a confirmação para uma senha diferente → fica desabilitado novamente
    await user.clear(getConfirm());
    await user.type(getConfirm(), "SenhaErrada2!");
    await waitFor(() => expect(btn).toBeDisabled());
  });

  it("exibe indicador de força da senha", async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(getPassword(), "senha1");
    await waitFor(() => {
      expect(screen.getByText(/fraca/i)).toBeInTheDocument();
    });
    await user.clear(getPassword());
    await user.type(getPassword(), "Senh@Forte1");
    await waitFor(() => {
      expect(screen.getByText(/forte/i)).toBeInTheDocument();
    });
  });

  it("submit com form válido exibe tela de sucesso", async () => {
    const user = userEvent.setup();
    renderSignup();
    await fillValidForm(user);
    const btn = screen.getByRole("button", { name: /criar conta/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByText(/conta criada com sucesso/i)).toBeInTheDocument();
    });
    // A tela de sucesso mostra o cargo como Chip; usa getAllByText por conta do painel lateral
    expect(screen.getAllByText(/gestor/i).length).toBeGreaterThan(0);
  });

  it("envia name e password_confirm no body do signup", async () => {
    let receivedBody = null;
    server.use(
      http.post("http://localhost:3001/auth/signup", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({
          token: "t",
          refreshToken: "r",
          user: { id: "1", email: receivedBody.email, name: receivedBody.name },
        });
      }),
    );

    const user = userEvent.setup();
    renderSignup();
    await fillValidForm(user);
    const btn = screen.getByRole("button", { name: /criar conta/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);

    await waitFor(() => {
      expect(receivedBody).toEqual(expect.objectContaining({
        name: "Ana Gestora",
        email: "ana@plus.com",
        password: "Senh@Forte1",
        password_confirm: "Senh@Forte1",
      }));
    });
  });

  it("exibe erro 'E-mail já cadastrado' quando API retorna 409", async () => {
    server.use(
      http.post("http://localhost:3001/auth/signup", () =>
        HttpResponse.json({ error: "E-mail já cadastrado." }, { status: 409 })
      )
    );
    const user = userEvent.setup();
    renderSignup();
    await fillValidForm(user, { email: "duplicate@plus.com" });
    const btn = screen.getByRole("button", { name: /criar conta/i });
    await waitFor(() => expect(btn).toBeEnabled());
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/e-mail já cadastrado/i);
    });
  });

  it("link de voltar para o login está presente", () => {
    renderSignup();
    expect(screen.getByText(/voltar para o login/i)).toBeInTheDocument();
  });
});
