import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../mocks/server";

const storage = (() => {
  let data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    clear: () => {
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
