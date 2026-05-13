import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_auth",
      filename: "remoteEntry.js",
      exposes: {
        "./LoginPage":    "./src/pages/LoginPage",
        "./SignupPage":   "./src/pages/SignupPage",
        "./AuthContext":  "./src/context/AuthContext",
        "./theme":        "./src/theme",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "react-hook-form",
        "zod",
      ],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server:  { port: 4001, host: true },
  preview: { port: 4001, host: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/tests/**", "src/mocks/**", "src/main.jsx"],
      thresholds: {
        lines:      70,
        branches:   70,
        functions:  70,
        statements: 70,
      },
    },
  },
});
