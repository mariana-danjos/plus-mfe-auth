import { http, HttpResponse } from "msw";

type LoginBody = { email: string; password: string };
type SignupBody = { email: string; password: string; name: string; password_confirm?: string; role?: string };

const API = "http://localhost:3001";

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as LoginBody;
    if (email === "user@plus.com" && password === "Valid@123") {
      return HttpResponse.json({
        token: "mock.jwt.token",
        refreshToken: "mock.refresh.token",
        user: { id: "1", email, name: "User Test" },
      });
    }
    return HttpResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "E-mail ou senha incorretos." } },
      { status: 401 },
    );
  }),

  http.post(`${API}/auth/signup`, async ({ request }) => {
    const { email } = (await request.json()) as SignupBody;
    if (email === "duplicate@plus.com") {
      return HttpResponse.json(
        { error: { code: "EMAIL_TAKEN", message: "E-mail já cadastrado." } },
        { status: 409 },
      );
    }
    return HttpResponse.json({
      token: "mock.jwt.token",
      refreshToken: "mock.refresh.token",
      user: { id: "2", email, name: "New User" },
    });
  }),

  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      token: "mock.jwt.refreshed",
      refreshToken: "mock.refresh.refreshed",
      user: { id: "1", email: "user@plus.com", name: "User Test" },
    });
  }),

  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ ok: true });
  }),
];
