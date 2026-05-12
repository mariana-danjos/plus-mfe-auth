# plus-mfe-auth

Microfrontend de autenticação do projeto **Plus**.

Expõe páginas de login/cadastro e contexto de autenticação via **Module Federation** para ser consumido pelo `plus-shell`. Construído com React 18 + Vite.

---

## Tecnologias

| Pacote | Finalidade |
|---|---|
| React 18 | UI |
| Vite 5 | Bundler |
| `@originjs/vite-plugin-federation` | Module Federation (remote) |
| `@mui/material` + Emotion | Componentes e tema visual |
| `react-hook-form` + Zod | Validação de formulários |
| `react-router-dom` | Roteamento interno |
| Vitest + MSW | Testes e mocks de API |

---

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env   # edite com a URL do plus-ms-auth

# 3. Subir em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:4001**

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_MS_AUTH_URL` | `http://localhost:3001` | URL base do `plus-ms-auth` |

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server na porta 4001 |
| `npm run build` | Gera bundle em `dist/` |
| `npm run preview` | Serve o build na porta 4001 |
| `npm run test` | Testes em modo watch |
| `npm run test:run` | Testes com saída única |
| `npm run coverage` | Relatório de cobertura (≥ 70%) |

---

## Módulos expostos

Este microfrontend atua como **remote** no nome `mfe_auth`. O entry point em produção/preview é:

```
http://localhost:4001/assets/remoteEntry.js
```

### `./LoginPage`

Página de login com validação de formulário e feedback de erros da API.

```jsx
import LoginPage from "mfe_auth/LoginPage";

// Sem props obrigatórias.
// Usa internamente o AuthContext e redireciona via react-router-dom.
<LoginPage />
```

**Comportamento:**
- Valida e-mail e senha com Zod antes de submeter.
- Exibe alertas de erro retornados pela API (`plus-ms-auth`).
- Ao autenticar com sucesso, persiste o token no `AuthContext`.

---

### `./SignupPage`

Página de cadastro com seleção de perfil e indicador de força de senha.

```jsx
import SignupPage from "mfe_auth/SignupPage";

// Sem props obrigatórias.
<SignupPage />
```

**Campos:** nome, e-mail, perfil (`Vendedor` / `Gestor` / `Admin`), senha e confirmação de senha.

**Exportação adicional:**

```js
import { ROLE_OPTIONS } from "mfe_auth/SignupPage";
// [{ value: "vendedor", label: "Vendedor" }, ...]
```

---

### `./AuthContext`

Contexto React com estado de autenticação e funções de controle de sessão.

**Provider — envolva o shell (ou a área autenticada) com ele:**

```jsx
import { AuthProvider } from "mfe_auth/AuthContext";

function Shell() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
```

**Hook — use em qualquer componente filho:**

```jsx
import { useAuth } from "mfe_auth/AuthContext";

function MeuComponente() {
  const { isAuthenticated, user, login, logout } = useAuth();
  // ...
}
```

**API do contexto:**

| Propriedade | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `true` quando há sessão ativa |
| `user` | `object \| null` | Payload decodificado do JWT (`id`, `email`, `role`, etc.) |
| `token` | `string \| null` | JWT bruto |
| `loading` | `boolean` | `true` durante chamadas assíncronas |
| `error` | `string \| null` | Último erro de autenticação |
| `login(email, password)` | `async fn` | Autentica e persiste a sessão |
| `signup(data)` | `async fn` | Cria conta e autentica |
| `logout()` | `fn` | Encerra a sessão e limpa o estado |
| `refreshToken()` | `async fn` | Renova o JWT (chamado automaticamente 60 s antes do vencimento) |

---

### `./theme`

Tema MUI e paleta de cores compartilhados com o shell.

```js
import { theme, C, FONT_IMPORT, gradientBtn } from "mfe_auth/theme";
```

| Export | Tipo | Descrição |
|---|---|---|
| `theme` | MUI Theme | Tema completo para `ThemeProvider` |
| `C` | objeto | Paleta: `navy`, `navyMid`, `navyLight`, `green`, `greenLight` |
| `FONT_IMPORT` | `string` | CSS `@import` da Google Fonts (Raleway + Poppins) |
| `gradientBtn(c1, c2)` | `fn` | Retorna objeto de estilo com gradiente para botões |

---

## Integração com o Shell (Module Federation)

No `vite.config.js` do **plus-shell**, adicione `mfe_auth` como remote:

```js
// vite.config.js (plus-shell)
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        mfe_auth: "http://localhost:4001/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom", "@mui/material",
               "@emotion/react", "@emotion/styled"],
    }),
  ],
  build: { target: "esnext" },
});
```

> **Importante:** as dependências em `shared` devem coincidir com as declaradas neste MFE para evitar instâncias duplicadas de React/MUI.

### Roteamento sugerido no Shell

```jsx
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "mfe_auth/AuthContext";

const LoginPage  = lazy(() => import("mfe_auth/LoginPage"));
const SignupPage = lazy(() => import("mfe_auth/SignupPage"));

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function Shell() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<PrivateRoute><PainelPrincipal /></PrivateRoute>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
```

---

## Estrutura de pastas

```
src/
├── pages/
│   ├── LoginPage.jsx      # exposto como ./LoginPage
│   └── SignupPage.jsx     # exposto como ./SignupPage
├── context/
│   └── AuthContext.jsx    # exposto como ./AuthContext
├── theme.js               # exposto como ./theme
├── App.jsx                # router interno (dev standalone)
├── main.jsx               # entry point standalone
├── mocks/
│   ├── handlers.js        # MSW — rotas mockadas (/auth/*)
│   └── server.js
└── tests/
    ├── LoginPage.test.jsx
    ├── SignupPage.test.jsx
    ├── AuthContext.test.jsx
    └── theme.test.jsx
```

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](https://github.com/pucrs-sweii-2026-1-30/plus-infra).
