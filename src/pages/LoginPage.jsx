import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
  Link, Fade,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// ─── Configuração de Cores (Exatamente conforme solicitado) ───────────────────
const C = {
  canvas:    "#F4F3EF",   // off-white quente
  navy:      "#0E2354",   // azul profundo
  navyLight: "#1A3EDB",   // azul vivo
  green:     "#22C55E",   // verde folha
  ink:       "#1A1A2E",   // texto principal
  muted:     "#7A7D8A",   // texto secundário
  border:    "#DDDBD4",   // borda
  fieldBg:   "#FAFAF7",   // fundo input
};

const theme = createTheme({
  palette: {
    primary: { main: C.navy },
    background: { default: C.canvas },
    text: { primary: C.ink, secondary: C.muted },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: C.fieldBg,
            "& fieldset": { borderColor: C.border },
            "&:hover fieldset": { borderColor: "#BCBAB2" },
            "&.Mui-focused fieldset": { borderColor: C.navy },
          },
          "& .MuiInputLabel-root": { fontSize: 14, color: C.muted },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          height: 52,
          fontSize: 15,
        },
      },
    },
  },
});

// ─── Painel Lateral Unissex (Editorial Fashion) ──────────────────────────────
function BrandPanel() {
  return (
    <Box sx={{
      display: { xs: "none", lg: "flex" },
      flex: "0 0 45%",
      bgcolor: C.navy,
      color: "#fff",
      flexDirection: "column",
      justifyContent: "space-between",
      p: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Elementos Decorativos Abstratos */}
      <Box sx={{
        position: "absolute", top: "-10%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(C.green, 0.15)} 0%, transparent 70%)`,
      }} />
      <Box sx={{
        position: "absolute", bottom: "5%", left: "-5%",
        width: 250, height: 250, border: `1px solid ${alpha("#fff", 0.1)}`,
        borderRadius: "40px", transform: "rotate(15deg)",
      }} />

      {/* Logo */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 32 }}>
          Plus.
        </Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.6, letterSpacing: 3, textTransform: "uppercase" }}>
          Moda sem rótulos
        </Typography>
      </Box>

      {/* Conteúdo Central */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: { lg: 42, xl: 52 },
          lineHeight: 1.1,
          mb: 3
        }}>
          Vista sua <br /> 
          <span style={{ fontStyle: "italic", color: C.green }}>autenticidade.</span>
        </Typography>
        
        <Box sx={{ width: 60, height: 4, bgcolor: C.green, mb: 4, borderRadius: 2 }} />
        
        <Typography sx={{ fontSize: 16, opacity: 0.8, maxWidth: 380, lineHeight: 1.6 }}>
          Curadoria exclusiva plus size unissex. Modelagens pensadas para corpos reais, do conforto do dia a dia à atitude das ruas.
        </Typography>
      </Box>

      {/* Footer do Painel */}
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", gap: 3 }}>
        <Typography sx={{ fontSize: 12, opacity: 0.4 }}>INSTAGRAM</Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.4 }}>FACEBOOK</Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.4 }}>© {new Date().getFullYear()}</Typography>
      </Box>
    </Box>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);

    try {
      // Simulação de chamada API
      // const res = await fetch("/api/login", { ... });
      console.log("Login com:", email, password);
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Import das fontes direto no componente para garantir consistência */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&display=swap');`}</style>

      <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.canvas }}>
        
        <BrandPanel />

        <Box sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 3, sm: 8 },
        }}>
          <Fade in={mounted} timeout={800}>
            <Box sx={{ width: "100%", maxWidth: 400 }}>
              
              {/* Logo Mobile */}
              <Box sx={{ display: { xs: "block", lg: "none" }, mb: 4 }}>
                <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.navy }}>Plus.</Typography>
              </Box>

              <Typography sx={{ 
                fontFamily: "'DM Serif Display', serif", 
                fontSize: 32, 
                color: C.ink, 
                mb: 1 
              }}>
                Bem-vindo(a) de volta.
              </Typography>
              
              <Typography sx={{ color: C.muted, mb: 5, fontSize: 15 }}>
                Acesse sua conta para continuar suas compras.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
              )}

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <TextField
                  label="Senha"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                          {showPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                  <Link href="#" underline="none" sx={{ fontSize: 13, color: C.navyLight, fontWeight: 500 }}>
                    Esqueceu sua senha?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(90deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
                    color: "#fff",
                    boxShadow: `0 4px 12px ${alpha(C.navy, 0.2)}`,
                    "&:hover": {
                      filter: "brightness(1.1)",
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Entrar na conta"}
                </Button>
              </Box>

              <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                <Typography sx={{ color: C.muted, fontSize: 14 }}>
                  Ainda não tem uma conta?{" "}
                  <Link 
                    href="#" 
                    onClick={() => navigate("/signup")}
                    sx={{ color: C.navy, fontWeight: 700, underline: "none", cursor: "pointer", ml: 1 }}
                  >
                    Cadastre-se grátis
                  </Link>
                </Typography>
              </Box>

            </Box>
          </Fade>
        </Box>
      </Box>
    </ThemeProvider>
  );
}