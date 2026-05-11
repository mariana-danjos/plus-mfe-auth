import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
  Link, Fade, Chip, Divider, Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Visibility          from "@mui/icons-material/Visibility";
import VisibilityOff       from "@mui/icons-material/VisibilityOff";
import InventoryOutlined   from "@mui/icons-material/InventoryOutlined";
import LockOutlined        from "@mui/icons-material/LockOutlined";
import PeopleOutlined      from "@mui/icons-material/PeopleOutlined";
import AssessmentOutlined  from "@mui/icons-material/AssessmentOutlined";
import StorefrontOutlined  from "@mui/icons-material/StorefrontOutlined";

import { C, gradientBtn } from "../theme";
import { useAuth } from "../context/AuthContext";

// ─── Schema Zod ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

// ─── Roles com acesso ao sistema ─────────────────────────────────────────────
const ACCESS_ROLES = [
  { label: "Vendedores",      icon: StorefrontOutlined },
  { label: "Gestores",        icon: PeopleOutlined },
  { label: "Administradores", icon: AssessmentOutlined },
];

// ─── Painel Lateral ───────────────────────────────────────────────────────────
function SystemPanel() {
  return (
    <Box sx={{
      display: { xs: "none", lg: "flex" },
      flex: "0 0 42%",
      bgcolor: C.navy,
      color: "#fff",
      flexDirection: "column",
      justifyContent: "space-between",
      px: { lg: 7, xl: 9 },
      py: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Elementos geométricos de fundo */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Box sx={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(C.greenLight, 0.08)} 0%, transparent 65%)`,
          top: "-15%", right: "-15%",
        }} />
        <Box sx={{
          position: "absolute", width: 280, height: 280,
          border: `1px solid ${alpha("#fff", 0.06)}`,
          borderRadius: "16px", transform: "rotate(20deg)",
          bottom: "8%", left: "-8%",
        }} />
        <Box sx={{
          position: "absolute", width: 120, height: 120,
          border: `1px solid ${alpha("#fff", 0.04)}`,
          borderRadius: "50%", bottom: "22%", right: "10%",
        }} />
      </Box>

      {/* Logo e sistema */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            bgcolor: alpha("#fff", 0.1),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <InventoryOutlined sx={{ fontSize: 20, color: C.greenLight }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>
            Plus Gestão
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.45), letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Sistema de Gerenciamento de Estoque
        </Typography>
      </Box>

      {/* Conteúdo central */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{
          fontSize: { lg: 30, xl: 36 },
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          mb: 2,
        }}>
          Controle total do seu inventário.
        </Typography>

        <Box sx={{ width: 40, height: 3, bgcolor: C.greenLight, borderRadius: 2, mb: 3 }} />

        <Typography sx={{ fontSize: 14, color: alpha("#fff", 0.65), lineHeight: 1.7, mb: 4, maxWidth: 340 }}>
          Gerencie produtos, movimentações de estoque, pedidos e relatórios em um único painel seguro e eficiente.
        </Typography>

        {/* Acesso restrito */}
        <Box sx={{
          p: 2, borderRadius: 2,
          border: `1px solid ${alpha("#fff", 0.1)}`,
          bgcolor: alpha("#fff", 0.04),
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <LockOutlined sx={{ fontSize: 14, color: alpha("#fff", 0.5) }} />
            <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.5), letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Acesso autorizado para
            </Typography>
          </Box>
          {ACCESS_ROLES.map(({ label, icon: Icon }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Icon sx={{ fontSize: 16, color: C.greenLight }} />
              <Typography sx={{ fontSize: 13, color: alpha("#fff", 0.75) }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.25), letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} Plus Store — Sistema Interno
        </Typography>
      </Box>
    </Box>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [showPwd, setShowPwd]   = useState(false);
  const [apiError, setApiError] = useState(null);
  const [mounted, setMounted]   = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver:      zodResolver(loginSchema),
    mode:          "all",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async ({ email, password }) => {
    setApiError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.canvas }}>
      <SystemPanel />

      {/* Área do formulário */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, sm: 8 },
        py: { xs: 4, sm: 6 },
        bgcolor: C.canvas,
      }}>
        <Fade in={mounted} timeout={600}>
          <Paper elevation={0} sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: `1px solid ${C.border}`,
            boxShadow: `0 16px 40px ${alpha(C.navy, 0.08)}`,
          }}>

              {/* Logo mobile */}
              <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5, mb: 6 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: "10px", bgcolor: C.navy,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <InventoryOutlined sx={{ fontSize: 20, color: C.greenLight }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: C.ink, lineHeight: 1 }}>
                    Plus Gestão
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Gerenciamento de Estoque
                  </Typography>
                </Box>
              </Box>

              {/* Cabeçalho */}
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: C.ink, mb: 0.5, letterSpacing: "-0.02em" }}>
                Acessar o sistema
              </Typography>
              <Typography sx={{ color: C.muted, mb: 5, fontSize: 14 }}>
                Use suas credenciais corporativas para entrar.
              </Typography>

              {apiError && (
                <Fade in>
                  <Alert
                    severity="error"
                    onClose={() => setApiError(null)}
                    sx={{ mb: 3, borderRadius: 2, fontSize: 13 }}
                  >
                    {apiError}
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-mail corporativo"
                      type="email"
                      autoComplete="email"
                      error={!!errors.email}
                      helperText={errors.email?.message || " "}
                      sx={{ mb: 1 }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Senha"
                      type={showPwd ? "text" : "password"}
                      autoComplete="current-password"
                      error={!!errors.password}
                      helperText={errors.password?.message || " "}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPwd(v => !v)}
                                edge="end"
                                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPwd ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ mb: 1 }}
                    />
                  )}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                  <Link
                    href="#"
                    underline="none"
                    tabIndex={-1}
                    sx={{ fontSize: 13, color: C.navyLight, fontWeight: 500 }}
                  >
                    Esqueceu sua senha?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={isSubmitting || !isValid}
                  sx={gradientBtn()}
                >
                  {isSubmitting
                    ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                    : "Entrar"}
                </Button>
              </Box>

              <Divider sx={{ my: 4, borderColor: C.border }} />

              {/* Link criar conta + aviso de acesso restrito */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography sx={{ color: C.muted, fontSize: 13 }}>
                  Administrador?{" "}
                  <Link
                    href="#"
                    underline="none"
                    onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
                    sx={{ color: C.navyLight, fontWeight: 600, "&:hover": { color: C.navy } }}
                  >
                    Criar conta de colaborador
                  </Link>
                </Typography>
              </Box>

              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1.5,
                p: 2, borderRadius: 2,
                bgcolor: C.badge,
                border: `1px solid ${alpha(C.navyLight, 0.15)}`,
              }}>
                <LockOutlined sx={{ fontSize: 16, color: C.navyLight, mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: C.navyMid, lineHeight: 1.6 }}>
                  <strong>Acesso restrito.</strong> Exclusivo para colaboradores autorizados. Em caso de dúvidas, contate o administrador.
                </Typography>
              </Box>

          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}
