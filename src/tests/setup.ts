import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../mocks/server";

const storage = (() => {
  let data: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => (key in data ? data[key] : null),
    setItem: (key: string, value: unknown): void => {
      data[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    clear: (): void => {
      data = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});

Object.defineProperty(window, "localStorage", {
  value: storage,
  configurable: true,
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
