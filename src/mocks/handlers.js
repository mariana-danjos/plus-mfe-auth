import { http, HttpResponse } from "msw";

const API = "http://localhost:3001";

export const handlers = [
  // Login
  http.post(`${API}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === "user@plus.com" && password === "Valid@123") {
      return HttpResponse.json({
        token: "mock.jwt.token",
        refreshToken: "mock.refresh.token",
        user: { id: "1", email, name: "User Test" },
      });
    }
    return HttpResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }),

  // Signup
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const { email } = await request.json();
    if (email === "duplicate@plus.com") {
      return HttpResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }
    return HttpResponse.json({
      token: "mock.jwt.token",
      refreshToken: "mock.refresh.token",
      user: { id: "2", email, name: "New User" },
    });
  }),

  // Refresh
  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      token: "mock.jwt.refreshed",
      refreshToken: "mock.refresh.refreshed",
      user: { id: "1", email: "user@plus.com", name: "User Test" },
    });
  }),

  // Logout
  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ ok: true });
  }),
];
