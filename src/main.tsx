import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { FONT_IMPORT, theme } from "./theme";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{FONT_IMPORT}</style>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
