import { createTheme, alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export const C = {
  canvas:    "#F5F6FA",   // fundo neutro frio
  navy:      "#0F2554",   // azul institucional
  navyLight: "#1E40AF",   // azul médio
  navyMid:   "#1E3A8A",   // azul intermediário
  green:     "#16A34A",   // verde operacional
  greenLight:"#22C55E",   // verde destaque
  ink:       "#111827",   // texto principal
  muted:     "#6B7280",   // texto secundário
  border:    "#E5E7EB",   // borda
  fieldBg:   "#FFFFFF",   // fundo input
  error:     "#DC2626",   // vermelho erro
  surface:   "#F9FAFB",   // superfície leve
  badge:     "#EFF6FF",   // fundo badge azul
} as const;

export const theme: Theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: C.navy, contrastText: "#fff" },
    secondary:  { main: C.green, light: C.greenLight, contrastText: "#fff" },
    error:      { main: C.error },
    success:    { main: C.green },
    background: { default: C.canvas, paper: C.fieldBg },
    text:       { primary: C.ink, secondary: C.muted },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    h1: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.25 },
    body1: { fontSize: "0.875rem", lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: C.fieldBg,
            borderRadius: 8,
            fontSize: 14,
            "& fieldset":              { borderColor: C.border, borderWidth: 1 },
            "&:hover fieldset":        { borderColor: "#9CA3AF" },
            "&.Mui-focused fieldset":  { borderColor: C.navy, borderWidth: 2 },
            "&.Mui-error fieldset":    { borderColor: C.error },
          },
          "& .MuiInputLabel-root":             { fontSize: 13, color: C.muted },
          "& .MuiInputLabel-root.Mui-focused": { color: C.navy },
          "& .MuiFormHelperText-root":         { fontSize: 11, marginLeft: 0, marginTop: "4px" },
        },
      },
    },
    MuiSelect: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          backgroundColor: C.fieldBg,
          fontSize: 14,
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.02em",
          borderRadius: 8,
          height: 48,
          fontSize: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: 12 },
      },
    },
  },
});

export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');";

export function gradientBtn(sx: SxProps<Theme> = {}): SxProps<Theme> {
  return {
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
    color: "#fff",
    boxShadow: `0 2px 8px ${alpha(C.navy, 0.3)}`,
    "&:hover": { filter: "brightness(1.08)", boxShadow: `0 4px 16px ${alpha(C.navy, 0.4)}` },
    "&.Mui-disabled": { background: C.border, color: C.muted, boxShadow: "none" },
    ...sx,
  };
}
