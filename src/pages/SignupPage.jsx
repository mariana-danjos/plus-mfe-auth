import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
  Link, Fade, Grow, Select, MenuItem, FormControl,
  InputLabel, FormHelperText, Tooltip, Chip, Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Visibility          from "@mui/icons-material/Visibility";
import VisibilityOff       from "@mui/icons-material/VisibilityOff";
import CheckCircle         from "@mui/icons-material/CheckCircle";
import InfoOutlined        from "@mui/icons-material/InfoOutlined";
import PersonAddOutlined   from "@mui/icons-material/PersonAddOutlined";
import InventoryOutlined   from "@mui/icons-material/InventoryOutlined";
import TaskAltOutlined     from "@mui/icons-material/TaskAltOutlined";
import BadgeOutlined       from "@mui/icons-material/BadgeOutlined";

import { C, gradientBtn } from "../theme";
import { useAuth } from "../context/AuthContext";

// ─── Opções de cargo ──────────────────────────────────────────────────────────
export const ROLE_OPTIONS = [
  { value: "vendedor",       label: "Vendedor",       desc: "Acesso a vendas e consulta de estoque" },
  { value: "gestor",         label: "Gestor",         desc: "Acesso a relatórios e gerenciamento" },
  { value: "admin",          label: "Administrador",  desc: "Acesso completo ao sistema" },
];

// ─── Schema Zod ──────────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    name:            z.string().min(2, "Mínimo 2 caracteres"),
    email:           z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
    role:            z.enum(["vendedor", "gestor", "admin"], {
                       required_error: "Selecione um cargo",
                       invalid_type_error: "Cargo inválido",
                     }),
    password:        z.string()
                       .min(8,            "Mínimo 8 caracteres")
                       .regex(/[A-Z]/,    "Precisa de uma letra maiúscula")
                       .regex(/[0-9]/,    "Precisa de um número")
                       .regex(/[^A-Za-z0-9]/, "Precisa de um símbolo especial"),
    passwordConfirm: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "As senhas não coincidem",
    path:    ["passwordConfirm"],
  });

// ─── Força da Senha ───────────────────────────────────────────────────────────
function analyzePassword(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent", tips: [] };
  let score = 0;
  const tips = [];
  if (pwd.length >= 8)           score++; else tips.push("Mínimo 8 caracteres");
  if (/[A-Z]/.test(pwd))         score++; else tips.push("Uma letra maiúscula");
  if (/[0-9]/.test(pwd))         score++; else tips.push("Um número");
  if (/[^A-Za-z0-9]/.test(pwd))  score++; else tips.push("Um símbolo especial");
  const map = {
    1: { label: "Fraca",     color: "#DC2626" },
    2: { label: "Razoável",  color: "#D97706" },
    3: { label: "Boa",       color: C.navyLight },
    4: { label: "Forte",     color: C.green },
  };
  return { score, ...(map[score] ?? {}), tips };
}

function PasswordStrength({ password }) {
  const { score, label, color, tips } = useMemo(() => analyzePassword(password), [password]);
  if (!password) return null;
  return (
    <Fade in>
      <Box sx={{ mt: 0.5, mb: 1 }}>
        <Box sx={{ display: "flex", gap: 0.75, mb: 0.75 }}>
          {[1, 2, 3, 4].map((s) => (
            <Box key={s} sx={{
              flex: 1, height: 3, borderRadius: 2,
              bgcolor: s <= score ? color : C.border,
              transition: "background-color 0.25s ease",
            }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </Typography>
          {tips.length > 0 && (
            <Tooltip arrow placement="right" title={
              <Box sx={{ p: 0.5 }}>
                {tips.map((t) => (
                  <Typography key={t} sx={{ fontSize: 11, color: "#fff" }}>· {t}</Typography>
                ))}
              </Box>
            }>
              <InfoOutlined sx={{ fontSize: 13, color: C.muted, cursor: "help" }} />
            </Tooltip>
          )}
        </Box>
      </Box>
    </Fade>
  );
}

// ─── Tela de Sucesso ──────────────────────────────────────────────────────────
function SuccessScreen({ _name, email, role, navigate }) {
  const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
  return (
    <Grow in timeout={400}>
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 3,
          bgcolor: alpha(C.green, 0.1),
          border: `2px solid ${C.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TaskAltOutlined sx={{ fontSize: 36, color: C.green }} />
        </Box>

        <Typography sx={{ fontSize: 22, fontWeight: 700, color: C.ink, mb: 1, letterSpacing: "-0.01em" }}>
          Conta criada com sucesso!
        </Typography>
        <Typography sx={{ fontSize: 13, color: C.muted, lineHeight: 1.7, mb: 2 }}>
          O usuário receberá as credenciais de acesso no e-mail:
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.navy, fontWeight: 600, mb: 1, wordBreak: "break-all" }}>
          {email}
        </Typography>
        <Chip
          label={roleLabel}
          size="small"
          icon={<BadgeOutlined />}
          sx={{ mb: 4, bgcolor: C.badge, color: C.navyLight, fontWeight: 600 }}
        />

        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/signup")}
          sx={{ borderColor: C.navy, color: C.navy, mb: 1.5, "&:hover": { bgcolor: alpha(C.navy, 0.04) } }}
        >
          Criar outro usuário
        </Button>
        <Button
          variant="contained"
          fullWidth
          disableElevation
          onClick={() => navigate("/login")}
          sx={gradientBtn()}
        >
          Ir para o login
        </Button>
      </Box>
    </Grow>
  );
}

// ─── Painel Lateral ───────────────────────────────────────────────────────────
function SystemPanel() {
  return (
    <Box sx={{
      display: { xs: "none", lg: "flex" },
      flex: "0 0 42%",
      bgcolor: C.navy,
      flexDirection: "column",
      justifyContent: "space-between",
      px: { lg: 7, xl: 9 },
      py: 8,
      position: "relative",
      overflow: "hidden",
    }}>
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
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            bgcolor: alpha("#fff", 0.1),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <InventoryOutlined sx={{ fontSize: 20, color: C.greenLight }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "-0.01em" }}>
            Plus Gestão
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.45), letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Sistema de Gerenciamento de Estoque
        </Typography>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: "12px",
          bgcolor: alpha("#fff", 0.08),
          display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
        }}>
          <PersonAddOutlined sx={{ fontSize: 24, color: C.greenLight }} />
        </Box>

        <Typography sx={{
          fontSize: { lg: 28, xl: 34 }, fontWeight: 700, color: "#fff",
          lineHeight: 1.25, letterSpacing: "-0.02em", mb: 2,
        }}>
          Crie sua conta de colaborador.
        </Typography>

        <Box sx={{ width: 40, height: 3, bgcolor: C.greenLight, borderRadius: 2, mb: 3 }} />

        <Typography sx={{ fontSize: 14, color: alpha("#fff", 0.65), lineHeight: 1.7, mb: 4 }}>
          Defina o cargo do usuário para que as permissões corretas sejam aplicadas automaticamente no sistema.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {ROLE_OPTIONS.map(({ value, label, desc }) => (
            <Box key={value} sx={{
              p: 1.5, borderRadius: 2,
              border: `1px solid ${alpha("#fff", 0.1)}`,
              bgcolor: alpha("#fff", 0.04),
            }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff", mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: 12, color: alpha("#fff", 0.5) }}>{desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.25), letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} Plus Store — Sistema Interno
        </Typography>
      </Box>
    </Box>
  );
}

// ─── SignupPage ───────────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate     = useNavigate();
  const { signup }   = useAuth();
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError]       = useState(null);
  const [success, setSuccess]         = useState(false);
  const [mounted, setMounted]         = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver:      zodResolver(signupSchema),
    mode:          "all",
    defaultValues: {
      name: "", email: "", role: "",
      password: "", passwordConfirm: "",
    },
  });

  const passwordValue        = watch("password");
  const passwordConfirmValue = watch("passwordConfirm");
  const emailValue           = watch("email");
  const roleValue            = watch("role");
  const confirmMatch         = passwordConfirmValue.length > 0 && passwordConfirmValue === passwordValue;
  const emailOk              = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async ({ name, email, role, password, passwordConfirm }) => {
    setApiError(null);
    try {
      await signup({
        name,
        email,
        password,
        password_confirm: passwordConfirm,
        role,  // backend ignora hoje — mantido até feature de atribuição-no-signup
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message);
    }
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    reset();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.canvas }}>

      <SystemPanel />

      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        px: { xs: 2, sm: 6 }, py: 6,
        overflowY: "auto",
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
              <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5, mb: 5 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: "9px", bgcolor: C.navy,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <InventoryOutlined sx={{ fontSize: 18, color: C.greenLight }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1 }}>Plus Gestão</Typography>
                  <Typography sx={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Gerenciamento de Estoque
                  </Typography>
                </Box>
              </Box>

              {success ? (
                <SuccessScreen
                  name={watch("name")}
                  email={watch("email")}
                  role={roleValue}
                  navigate={(path) => {
                    if (path === "/signup") handleCreateAnother();
                    else navigate(path);
                  }}
                />
              ) : (
                <>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: C.ink, mb: 0.5, letterSpacing: "-0.01em" }}>
                    Criar conta de colaborador
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: C.muted, mb: 4, lineHeight: 1.6 }}>
                    Preencha os dados do novo usuário do sistema.
                  </Typography>

                  {apiError && (
                    <Fade in>
                      <Alert severity="error" onClose={() => setApiError(null)} sx={{ mb: 3, borderRadius: 2, fontSize: 13 }}>
                        {apiError}
                      </Alert>
                    </Fade>
                  )}

                  <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nome completo"
                          autoComplete="name"
                          error={!!errors.name}
                          helperText={errors.name?.message || " "}
                          sx={{ mb: 1 }}
                        />
                      )}
                    />

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
                          slotProps={{
                            input: {
                              endAdornment: emailOk && !errors.email ? (
                                <InputAdornment position="end">
                                  <CheckCircle sx={{ fontSize: 18, color: C.green }} />
                                </InputAdornment>
                              ) : null,
                            },
                          }}
                          sx={{ mb: 1 }}
                        />
                      )}
                    />

                    {/* Cargo */}
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.role} sx={{ mb: 1 }}>
                          <InputLabel id="role-label" sx={{ fontSize: 13, color: C.muted }}>Cargo / Função</InputLabel>
                          <Select
                            {...field}
                            labelId="role-label"
                            inputProps={{ id: "role-select", "aria-labelledby": "role-label" }}
                            label="Cargo / Função"
                            sx={{
                              fontSize: 14, bgcolor: C.fieldBg, borderRadius: 2,
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.navy, borderWidth: 2 },
                            }}
                          >
                            {ROLE_OPTIONS.map(({ value, label }) => (
                              <MenuItem key={value} value={value} sx={{ fontSize: 14 }}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText sx={{ fontSize: 11, ml: 0, mt: "4px" }}>
                            {errors.role?.message || " "}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    {/* Senha */}
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Senha de acesso"
                          type={showPwd ? "text" : "password"}
                          autoComplete="new-password"
                          error={!!errors.password}
                          helperText={errors.password?.message || " "}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => setShowPwd(v => !v)}
                                    edge="end"
                                    aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                                  >
                                    {showPwd ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{ mb: 0.5 }}
                        />
                      )}
                    />

                    <PasswordStrength password={passwordValue} />

                    {/* Confirmar Senha */}
                    <Controller
                      name="passwordConfirm"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirmar senha"
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          error={!!errors.passwordConfirm}
                          helperText={errors.passwordConfirm?.message || " "}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  {confirmMatch ? (
                                    <Fade in>
                                      <CheckCircle sx={{ fontSize: 18, color: C.green, mr: 0.5 }} />
                                    </Fade>
                                  ) : (
                                    <IconButton
                                      size="small"
                                      onClick={() => setShowConfirm(v => !v)}
                                      edge="end"
                                      aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                    >
                                      {showConfirm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  )}
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{
                            mt: 0.5, mb: 3,
                            ...(confirmMatch && {
                              "& .MuiOutlinedInput-root fieldset": { borderColor: alpha(C.green, 0.6) },
                            }),
                          }}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disableElevation
                      disabled={isSubmitting || !isValid}
                      sx={gradientBtn({ mb: 3 })}
                    >
                      {isSubmitting
                        ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                        : "Criar conta"}
                    </Button>
                  </Box>

                  <Typography sx={{ textAlign: "center", fontSize: 13, color: C.muted }}>
                    <Link
                      href="#"
                      underline="none"
                      onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                      sx={{ color: C.navyLight, fontWeight: 600 }}
                    >
                      ← Voltar para o login
                    </Link>
                  </Typography>
                </>
              )}
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}