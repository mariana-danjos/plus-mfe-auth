# plus-mfe-auth

[![CI](https://github.com/mariana-danjos/plus-mfe-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/mariana-danjos/plus-mfe-auth/actions/workflows/ci.yml)

Microfrontend de autenticação do projeto **Plus**.

Expõe páginas de login/cadastro, contexto de autenticação e tema via **Module Federation**, consumidos pelo `plus-shell`. Construído com React 18 + Vite 5. Pode rodar isoladamente (modo standalone) ou como remote dentro de um host.

---

## Sumário

- [Stack](#stack)
- [Setup local](#setup-local)
- [Scripts npm](#scripts-npm)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Módulos expostos](#módulos-expostos)
- [Integração com o Shell](#integração-com-o-shell-module-federation)
- [Estrutura do código](#estrutura-do-código)
- [Tema e design system](#tema-e-design-system)
- [Testes](#testes)
- [Lint](#lint)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Executando com a stack completa](#executando-com-a-stack-completa)

---

## Stack

| Pacote | Versão | Finalidade |
|---|---|---|
| React | 18 | UI |
| React Router DOM | 7 | Roteamento (modo standalone) |
| Vite | 5 | Bundler + dev server |
| `@originjs/vite-plugin-federation` | 1.3 | Module Federation (remote) |
| `@mui/material` + `@mui/icons-material` | 9 | Componentes Material UI |
| `@emotion/react` + `@emotion/styled` | 11 | CSS-in-JS (engine do MUI) |
| `react-hook-form` + `@hookform/resolvers` | 7 / 5 | Formulários |
| Zod | 4 | Validação de schemas |
| Vitest + Testing Library + MSW | 4 / 16 / 2 | Testes + mocks HTTP |
| `@vitest/coverage-v8` | 4 | Cobertura |
| ESLint 9 + plugins React | — | Lint (flat config) |

---

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. (Opcional) configurar URL do MS Auth
echo 'VITE_MS_AUTH_URL=http://localhost:3001' > .env

# 3. Subir em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:4001**

Em modo standalone, o app monta um router próprio (`/login`, `/signup`) usando o `AuthContext` interno e o `MSW` se rodando os testes.

---

## Scripts npm

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server Vite na porta 4001 com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve `dist/` na porta 4001 |
| `npm run test` | Vitest em modo watch |
| `npm run test:run` | Vitest single-run |
| `npm run coverage` | Vitest + cobertura (threshold ≥ 70%) |
| `npm run lint` | ESLint sobre `src/**/*.{js,jsx}` |

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_MS_AUTH_URL` | `http://localhost:3001` | URL base do `plus-ms-auth` (usada por `AuthContext` em chamadas `fetch`) |

---

## Módulos expostos

Este microfrontend atua como **remote** com nome `mfe_auth`. Em produção/preview, o entry point é:

```
http://localhost:4001/assets/remoteEntry.js
```

| Módulo MF | Arquivo | Export |
|---|---|---|
| `./LoginPage` | `src/pages/LoginPage.jsx` | `default` |
| `./SignupPage` | `src/pages/SignupPage.jsx` | `default` + `ROLE_OPTIONS` |
| `./AuthContext` | `src/context/AuthContext.jsx` | `AuthProvider` + `useAuth` |
| `./theme` | `src/theme.js` | `theme`, `C`, `FONT_IMPORT`, `gradientBtn` |

### `./LoginPage`

Página de login completa com painel de branding lateral.

```jsx
import LoginPage from "mfe_auth/LoginPage";
<LoginPage />
```

**Props:** nenhuma obrigatória.

**Comportamento:**

- Layout 2-coluna (painel navy com branding + formulário). Painel oculto em mobile.
- Validação Zod: e-mail válido, senha obrigatória.
- Toggle "mostrar/ocultar senha".
- Link "Criar conta de colaborador" → `/signup`.
- Submit chama `useAuth().login(email, password)` e mostra `<Alert>` se houver erro da API.
- Botão com `CircularProgress` durante loading e desabilitado enquanto o form é inválido.

### `./SignupPage`

Página de cadastro com seleção de perfil e indicador de força de senha.

```jsx
import SignupPage, { ROLE_OPTIONS } from "mfe_auth/SignupPage";
<SignupPage />
```

**Props:** nenhuma obrigatória.

**Campos:**

| Campo | Validação |
|---|---|
| Nome | mínimo 2 caracteres |
| E-mail | formato válido |
| Cargo | `vendedor` / `gestor` / `admin` |
| Senha | 8+ chars, letra maiúscula, número e símbolo |
| Confirmar senha | igual à senha |

**Comportamento:**

- Indicador de força da senha (4 barras: Fraca / Razoável / Boa / Forte) com tooltip de requisitos.
- Checkmark verde quando o e-mail é válido e quando as senhas batem.
- Após sucesso, exibe `SuccessScreen` com o e-mail criado, o cargo como chip azul e links para criar outro usuário ou ir para o login. **Não há auto-redirect.**

**Export adicional:**

```js
import { ROLE_OPTIONS } from "mfe_auth/SignupPage";
// [
//   { value: "vendedor", label: "Vendedor", desc: "Acesso a vendas e consulta de estoque" },
//   { value: "gestor",   label: "Gestor",   desc: "Acesso a relatórios e gerenciamento" },
//   { value: "admin",    label: "Administrador", desc: "Acesso completo ao sistema" },
// ]
```

### `./AuthContext`

Contexto React com estado de autenticação e funções de controle de sessão.

**Provider** — envolva o shell (ou a área autenticada) com ele:

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

**Hook:**

```jsx
import { useAuth } from "mfe_auth/AuthContext";

function MeuComponente() {
  const { isAuthenticated, user, login, logout } = useAuth();
  // ...
}
```

> `useAuth()` lança erro se for usado fora de `<AuthProvider>`.

**API do contexto:**

| Propriedade | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `true` quando há sessão ativa |
| `user` | `object \| null` | Payload do JWT decodificado (`id`, `email`, `name`, `roles`) |
| `token` | `string \| null` | Access token JWT bruto |
| `loading` | `boolean` | `true` durante chamadas assíncronas |
| `error` | `string \| null` | Última mensagem de erro de autenticação |
| `login(email, password)` | `async fn` | Autentica e persiste a sessão |
| `signup(data)` | `async fn` | Cria conta (autentica se a API retornar `token`) |
| `logout()` | `fn` | Encerra a sessão (best-effort `POST /auth/logout`) |
| `refreshToken()` | `async fn` | Renova o JWT (agendado automaticamente 60 s antes de expirar) |

**Persistência:** `localStorage` (chaves `plus_token` e `plus_refresh`).

**Decodificação do JWT:** manual via `atob(payload)`. Extrai `exp` para agendar o refresh.

### `./theme`

```js
import { theme, C, FONT_IMPORT, gradientBtn } from "mfe_auth/theme";
```

| Export | Tipo | Descrição |
|---|---|---|
| `theme` | MUI Theme | Tema completo para `ThemeProvider` |
| `C` | objeto | Paleta (`navy`, `navyLight`, `green`, `error`, `canvas`, etc.) |
| `FONT_IMPORT` | string | CSS `@import` da Google Fonts (Inter 300–700) |
| `gradientBtn(sx?)` | função | Retorna objeto de estilo com gradiente navy → navyLight para botões |

---

## Integração com o Shell (Module Federation)

No `vite.config.js` do **plus-shell**, registre `mfe_auth` como remote:

```js
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        mfe_auth: "http://localhost:4001/assets/remoteEntry.js",
      },
      shared: [
        "react", "react-dom", "react-router-dom",
        "@mui/material", "@mui/icons-material",
        "@emotion/react", "@emotion/styled",
      ],
    }),
  ],
  build: { target: "esnext" },
});
```

> As dependências em `shared` devem coincidir entre host e remote para evitar instâncias duplicadas de React / MUI.

### Exemplo de roteamento no shell

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
          <Route path="/*"      element={<PrivateRoute><PainelPrincipal /></PrivateRoute>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
```

---

## Estrutura do código

```
src/
├── main.jsx                  # Entry standalone (ThemeProvider + App)
├── App.jsx                   # Router standalone (/login, /signup)
├── theme.js                  # exposto como ./theme
├── pages/
│   ├── LoginPage.jsx         # exposto como ./LoginPage
│   └── SignupPage.jsx        # exposto como ./SignupPage
├── context/
│   └── AuthContext.jsx       # exposto como ./AuthContext
├── mocks/
│   ├── handlers.js           # MSW handlers (/auth/login, /auth/signup, /auth/refresh, /auth/logout)
│   └── server.js             # setupServer(...handlers)
└── tests/
    ├── setup.js              # Boot MSW + mock localStorage
    ├── LoginPage.test.jsx
    ├── SignupPage.test.jsx
    ├── AuthContext.test.jsx
    └── theme.test.jsx
```

---

## Tema e design system

Paleta principal exportada em `theme.js`:

| Token | Cor | Uso |
|---|---|---|
| `C.canvas` | `#F5F6FA` | Fundo cinza claro |
| `C.navy` | `#0F2554` | Azul principal (botões, painéis) |
| `C.navyLight` | `#1E40AF` | Azul secundário |
| `C.green` | `#16A34A` | Sucesso, role "gestor" |
| `C.greenLight` | `#22C55E` | Variante para gradientes |
| `C.ink` | `#111827` | Texto principal |
| `C.muted` | `#6B7280` | Texto secundário |
| `C.error` | `#DC2626` | Erros, validações |

**Tipografia:** Inter (Google Fonts), weights 300–700. `FONT_IMPORT` traz o `@import` para usar em CSS global.

**Componentes customizados:** `MuiTextField`, `MuiButton` (altura 48 px, opção de gradiente via `gradientBtn()`), `MuiChip`.

---

## Testes

Configurados no `vite.config.js`:

```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/tests/setup.js"],
  css: true,
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov", "html"],
    include: ["src/**/*.{js,jsx}"],
    exclude: ["src/tests/**", "src/mocks/**", "src/main.jsx"],
    thresholds: { lines: 70, branches: 70, functions: 70, statements: 70 },
  },
}
```

**Setup (`src/tests/setup.js`):**

- `@testing-library/jest-dom` para matchers.
- Boot do MSW (`beforeAll` / `afterEach` / `afterAll`) com `onUnhandledRequest: "error"`.
- Polyfill de `localStorage` em memória.

**Cobertura atual:** 4 arquivos de teste, 28 casos.

| Arquivo | Casos | Cobre |
|---|---|---|
| `AuthContext.test.jsx` | 7 | Estado inicial, login, logout, refresh, expiração, erro fora do provider |
| `LoginPage.test.jsx` | 10 | Render, validações Zod, toggle senha, submit, erros da API, loading |
| `SignupPage.test.jsx` | 8 | Render, validação por campo, indicador de força, sucesso, duplicado, payload |
| `theme.test.jsx` | 1 | Paleta e tipografia |

```bash
npm run coverage
```

---

## Lint

ESLint 9.x com **flat config** (`eslint.config.mjs`).

Presets:

- `@eslint/js:recommended`
- `eslint-plugin-react/recommended`
- `eslint-plugin-react-hooks/recommended`

Regras desabilitadas / customizadas:

- `react/react-in-jsx-scope: off` — React 17+ JSX transform não precisa de `import React`.
- `react/prop-types: off` — não usamos PropTypes.
- `no-unused-vars`: error, ignora identificadores prefixados com `_`.

Ignorados: `dist/`, `coverage/`, `node_modules/`, `src/mocks/`.

```bash
npm run lint                       # output detalhado
npm run lint -- --max-warnings 0   # comando que roda no CI
```

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`). Trigger em **pull request** e **push em `main`**.

Pipeline:

```
lint  ─┐
test  ─┼─→ build ──→ docker
       │
```

| Job | Faz | Timeout |
|---|---|---|
| `lint` | `npm ci` → `npm run lint -- --max-warnings 0` | 10 min |
| `test` | `npm ci` → `npm run coverage` → artifact `mfe-auth-coverage` (7 d) | 15 min |
| `build` | `npm ci` → `npm run build` → artifact `mfe-auth-dist` (1 d) | 10 min |
| `docker` | Baixa `mfe-auth-dist` para `dist/`, roda `docker/build-push-action@v7` com `push: false, load: true` | 10 min |

O job `docker` usa artifact passing porque o `Dockerfile` espera o `dist/` já buildado (não faz build interno).

Configurações:

- `concurrency: cancel-in-progress` por ref.
- `permissions: contents: read, actions: read`.
- Node 20 com cache `npm`.

### Rodando o pipeline localmente

```bash
npm ci
npm run lint -- --max-warnings 0
npm run coverage
npm run build
docker build -t plus-mfe-auth:ci .
```

Ou com [`act`](https://github.com/nektos/act):

```bash
act pull_request
```

---

## Docker

O `Dockerfile` espera o `dist/` já gerado (build feito fora do container):

```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY dist ./dist
EXPOSE 4001
CMD ["vite", "preview", "--port", "4001", "--host"]
```

Build local:

```bash
npm run build
docker build -t plus-mfe-auth:dev .
docker run -p 4001:4001 plus-mfe-auth:dev
```

---

## Executando com a stack completa

Este serviço é orquestrado pelo `plus-infra`. Consulte o [README do plus-infra](https://github.com/mariana-danjos/plus-infra) para subir o ambiente completo (postgres + ministack + ms-auth + mfe-auth + shell).
