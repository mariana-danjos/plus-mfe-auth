import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Checkbox, FormControlLabel,
  InputAdornment, IconButton, Alert, CircularProgress,
  Link, Fade, Grow, Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import Visibility       from "@mui/icons-material/Visibility";
import VisibilityOff    from "@mui/icons-material/VisibilityOff";
import CheckCircle      from "@mui/icons-material/CheckCircle";
import InfoOutlined     from "@mui/icons-material/InfoOutlined";
import TaskAltOutlined  from "@mui/icons-material/TaskAltOutlined";

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  canvas:    "#F4F3EF",
  navy:      "#0E2354",
  navyLight: "#1A3EDB",
  green:     "#22C55E",
  greenDeep: "#15803D",
  ink:       "#1A1A2E",
  muted:     "#7A7D8A",
  border:    "#DDDBD4",
  fieldBg:   "#FAFAF7",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: C.navy, contrastText: "#fff" },
    error:   { main: "#D94F3D" },
    success: { main: C.green },
    background: { default: C.canvas },
    text: { primary: C.ink, secondary: C.muted },
  },
  typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  shape: { borderRadius: 6 },
  components: {
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: C.fieldBg,
            borderRadius: 6,
            fontSize: 14,
            "& fieldset":            { borderColor: C.border, borderWidth: 1 },
            "&:hover fieldset":      { borderColor: "#BCBAB2" },
            "&.Mui-focused fieldset":{ borderColor: C.navy, borderWidth: 1.5 },
            "&.Mui-error fieldset":  { borderColor: "#D94F3D" },
          },
          "& .MuiInputLabel-root":            { fontSize: 13, color: C.muted },
          "& .MuiInputLabel-root.Mui-focused":{ color: C.navy },
          "& .MuiFormHelperText-root":        { fontSize: 11, marginLeft: 0, mt: "4px" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.04em",
          borderRadius: 6,
          height: 48,
          fontSize: 14,
        },
      },
    },
  },
});

// ─── Lógica de Senha ──────────────────────────────────────────────────────────
function analyzePassword(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent", tips: [] };
  let score = 0; const tips = [];
  if (pwd.length >= 8)          score++; else tips.push("Mínimo 8 caracteres");
  if (/[A-Z]/.test(pwd))        score++; else tips.push("Uma letra maiúscula");
  if (/[0-9]/.test(pwd))        score++; else tips.push("Um número");
  if (/[^A-Za-z0-9]/.test(pwd)) score++; else tips.push("Um símbolo especial");
  const map = {
    1: { label: "Fraca",       color: "#D94F3D" },
    2: { label: "Razoável",    color: "#F59E0B" },
    3: { label: "Boa",         color: C.navyLight },
    4: { label: "Excelente",   color: C.green },
  };
  return { score, ...map[score], tips };
}

function PasswordStrength({ password }) {
  const { score, label, color, tips } = useMemo(() => analyzePassword(password), [password]);
  if (!password) return null;
  return (
    <Fade in>
      <Box sx={{ mt: 1, mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {[1,2,3,4].map((s) => (
            <Box key={s} sx={{
              flex: 1, height: "4px", borderRadius: 2,
              bgcolor: s <= score ? color : C.border,
              transition: "background-color 0.3s ease",
            }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {label}
          </Typography>
          {tips.length > 0 && (
            <Tooltip arrow placement="right" title={
              <Box sx={{ p: 1 }}>
                {tips.map((t) => <Typography key={t} sx={{ fontSize: 11, color: "#fff" }}>· {t}</Typography>)}
              </Box>
            }>
              <InfoOutlined sx={{ fontSize: 14, color: C.muted, cursor: "help" }} />
            </Tooltip>
          )}
        </Box>
      </Box>
    </Fade>
  );
}

// ─── Tela de Sucesso ──────────────────────────────────────────────────────────
function SuccessScreen({ email, navigate }) {
  return (
    <Grow in timeout={500}>
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: "50%", mx: "auto", mb: 4,
          border: `2px solid ${C.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          "&::before": {
            content: '""', position: "absolute", inset: 6,
            borderRadius: "50%", background: alpha(C.green, 0.1),
          },
        }}>
          <TaskAltOutlined sx={{ fontSize: 40, color: C.green }} />
        </Box>

        <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.ink, mb: 1.5, fontWeight: 400 }}>
          Conta criada!
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.7, mb: 1 }}>
          Enviamos um link de confirmação para:
        </Typography>
        <Typography sx={{ fontSize: 15, color: C.navy, fontWeight: 600, mb: 5, wordBreak: "break-all" }}>
          {email}
        </Typography>

        <Button
          variant="outlined" fullWidth
          onClick={() => navigate("/login")}
          sx={{
            borderColor: C.navy, color: C.navy, fontWeight: 600,
            "&:hover": { bgcolor: alpha(C.navy, 0.04), borderColor: C.navy },
          }}
        >
          Ir para o login
        </Button>
      </Box>
    </Grow>
  );
}

// ─── Painel Lateral Compartilhado (Propaganda Unissex) ────────────────────────
function BrandSidePanel({ isLogin }) {
  return (
    <Box sx={{
      display: { xs: "none", lg: "flex" },
      flex: "0 0 45%",
      bgcolor: C.navy,
      flexDirection: "column",
      justifyContent: "space-between",
      px: { lg: 6, xl: 8 }, pt: { lg: 6, xl: 8 }, pb: 6,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Geometria abstrata inclusiva (representando pluralidade/sem rótulos) */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Box sx={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(C.green, 0.12)} 0%, transparent 60%)`,
          top: "-20%", right: "-20%",
        }} />
        <Box sx={{
          position: "absolute", width: 400, height: 400, borderRadius: "40px",
          border: `1px solid ${alpha("#fff", 0.08)}`,
          transform: "rotate(25deg)", bottom: "-10%", left: "-15%",
        }} />
      </Box>

      {/* Header do Logo */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: "#fff", letterSpacing: "-0.01em" }}>
          Plus.
        </Typography>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.5), letterSpacing: "0.2em", textTransform: "uppercase", mt: 0.3 }}>
          Moda sem rótulos
        </Typography>
      </Box>

      {/* Texto de Impacto */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: { lg: 40, xl: 48 },
          color: "#fff",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          mb: 3,
        }}>
          {isLogin ? "Bem-vindo de volta ao seu estilo." : "O caimento perfeito para cada corpo."}
        </Typography>

        <Box sx={{ width: 48, height: 3, bgcolor: C.green, borderRadius: 2, mb: 3 }} />

        <Typography sx={{ fontSize: 15, color: alpha("#fff", 0.7), lineHeight: 1.6, maxWidth: 360 }}>
          {isLogin 
            ? "Acesse sua conta para conferir os lançamentos unissex e descobrir modelagens pensadas para o seu conforto."
            : "Criamos roupas unissex que unem atitude e modelagens reais. Porque acreditamos que o estilo não tem tamanho."}
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.3), letterSpacing: "0.1em" }}>
          © {new Date().getFullYear()} PLUS STORE
        </Typography>
      </Box>
    </Box>
  );
}

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ─── SignupPage Component ─────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName]                 = useState("");
  const [email, setEmail]                       = useState("");
  const [phone, setPhone]                       = useState("");
  const [birthDate, setBirthDate]               = useState("");
  const [password, setPassword]                 = useState("");
  const [passwordConfirm, setPasswordConfirm]   = useState("");
  const [agreeTerms, setAgreeTerms]             = useState(false);
  const [showPwd, setShowPwd]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [touched, setTouched]                   = useState({});
  const [error, setError]                       = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [success, setSuccess]                   = useState(false);
  const [mounted, setMounted]                   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pwdAnalysis   = useMemo(() => analyzePassword(password), [password]);
  
  const handleTouch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const fullNameError = touched.fullName && (!fullName ? "Obrigatório" : fullName.length < 3 ? "Mínimo 3 caracteres" : "");
  const emailError    = touched.email    && (!email ? "Obrigatório" : !isValidEmail(email) ? "E-mail inválido" : "");
  const phoneError    = touched.phone    && phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, "")) ? "Telefone inválido" : "";
  const birthDateError= touched.birthDate && !birthDate ? "Obrigatório" : "";
  const passwordError = touched.password && (!password ? "Obrigatório" : pwdAnalysis.score < 2 ? "Senha muito fraca" : "");
  const confirmError  = touched.confirm  && (!passwordConfirm ? "Obrigatório" : passwordConfirm !== password ? "As senhas não coincidem" : "");
  const termsError    = touched.terms    && !agreeTerms ? "Aceite os termos para continuar" : "";
  
  const confirmMatch  = passwordConfirm.length > 0 && passwordConfirm === password;
  const formValid     = fullName.length >= 3 && isValidEmail(email) && (!phone || /^\d{10,15}$/.test(phone.replace(/\D/g, ""))) && birthDate && pwdAnalysis.score >= 2 && confirmMatch && agreeTerms;

  const handleSubmit = async () => {
    setTouched({ fullName: true, email: true, phone: true, birthDate: true, password: true, confirm: true, terms: true });
    if (!formValid) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone || null, birthDate, password }),
      });
      if (!res.ok) { const { error: msg } = await res.json().catch(()=>({})); throw new Error(msg || "Erro ao criar conta"); }
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: C.canvas }}>

        <BrandSidePanel isLogin={false} />

        <Box sx={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          px: { xs: 3, sm: 6 }, py: 8,
        }}>
          <Fade in={mounted} timeout={600}>
            <Box sx={{ width: "100%", maxWidth: 380 }}>

              <Box sx={{ display: { xs: "block", lg: "none" }, mb: 5 }}>
                <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.navy }}>Plus.</Typography>
                <Typography sx={{ fontSize: 11, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Moda sem rótulos</Typography>
              </Box>

              {success ? (
                <SuccessScreen email={email} navigate={navigate} />
              ) : (
                <>
                  <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: C.ink, lineHeight: 1.2, mb: 1 }}>
                    Criar sua conta.
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: C.muted, mb: 4, lineHeight: 1.6 }}>
                    Rápido, gratuito e sem complicação.
                  </Typography>

                  {error && (
                    <Fade in>
                      <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2, fontSize: 13 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  <TextField
                    label="Nome Completo" value={fullName}
                    onChange={(e) => setFullName(e.target.value)} onBlur={() => handleTouch("fullName")}
                    error={!!fullNameError} helperText={fullNameError}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    label="E-mail" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} onBlur={() => handleTouch("email")}
                    error={!!emailError} helperText={emailError}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    InputProps={{
                      endAdornment: isValidEmail(email) ? (
                        <InputAdornment position="end">
                          <CheckCircle sx={{ fontSize: 18, color: C.green, mr: 0.5 }} />
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{ mb: 2.5 }}
                  />

                  <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
                    <TextField
                      label="Telefone (opcional)" type="tel" value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                      onBlur={() => handleTouch("phone")}
                      error={!!phoneError} helperText={phoneError}
                      placeholder="11912345678"
                    />
                    <TextField
                      label="Data de Nascimento" type="date" value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)} onBlur={() => handleTouch("birthDate")}
                      error={!!birthDateError} helperText={birthDateError}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 
                        min: "1900-01-01", 
                        max: new Date().toISOString().split('T')[0]
                      }}
                      sx={{ 
                        "& .MuiOutlinedInput-input": { 
                          paddingTop: "20px",
                          paddingBottom: "12px",
                          fontSize: "14px"
                        },
                        "& .MuiInputLabel-root": {
                          transform: "translate(14px, -9px) scale(0.75)",
                          backgroundColor: C.fieldBg,
                          paddingLeft: "4px",
                          paddingRight: "4px"
                        }
                      }}
                    />
                  </Box>

                  <TextField
                    label="Senha" type={showPwd ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} onBlur={() => handleTouch("password")}
                    error={!!passwordError} helperText={passwordError}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPwd(v => !v)} edge="end" sx={{ color: C.muted, mr: 0.5 }}>
                            {showPwd ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 0.5 }}
                  />

                  <PasswordStrength password={password} />

                  <TextField
                    label="Confirmar senha" type={showConfirm ? "text" : "password"} value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)} onBlur={() => handleTouch("confirm")}
                    error={!!confirmError} helperText={confirmError || " "}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {confirmMatch ? (
                            <Fade in><CheckCircle sx={{ fontSize: 18, color: C.green, mr: 0.5 }} /></Fade>
                          ) : (
                            <IconButton size="small" onClick={() => setShowConfirm(v => !v)} edge="end" sx={{ color: C.muted, mr: 0.5 }}>
                              {showConfirm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mt: 1, mb: 3,
                      ...(confirmMatch && { "& .MuiOutlinedInput-root fieldset": { borderColor: alpha(C.green, 0.6) } }),
                    }}
                  />

                  <Box sx={{ mb: 3.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agreeTerms}
                          onChange={(e) => { setAgreeTerms(e.target.checked); handleTouch("terms"); }}
                          sx={{ color: C.muted, "&.Mui-checked": { color: C.navy }, ml: -0.5 }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 13, color: C.muted, ml: 0.5 }}>
                          Concordo com os <Link href="#" underline="hover" sx={{ color: C.navy, fontWeight: 500 }}>Termos de uso</Link> e <Link href="#" underline="hover" sx={{ color: C.navy, fontWeight: 500 }}>Privacidade</Link>
                        </Typography>
                      }
                    />
                    {termsError && <Typography sx={{ fontSize: 12, color: "#D94F3D", ml: 4 }}>{termsError}</Typography>}
                  </Box>

                  <Button
                    variant="contained" fullWidth disableElevation
                    onClick={handleSubmit} disabled={loading}
                    sx={{
                      background: `linear-gradient(90deg, ${C.navy} 0%, #1A3EDB 100%)`,
                      color: "#fff",
                      boxShadow: `0 4px 14px ${alpha(C.navy, 0.25)}`,
                      "&:hover": { filter: "brightness(1.1)", boxShadow: `0 6px 20px ${alpha(C.navy, 0.35)}` },
                      "&.Mui-disabled": { background: C.border, color: "#fff" },
                      mb: 3.5,
                    }}
                  >
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Criar minha conta"}
                  </Button>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3.5 }}>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: C.border }} />
                    <Typography sx={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>OU</Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: C.border }} />
                  </Box>

                  <Typography sx={{ textAlign: "center", fontSize: 14, color: C.muted }}>
                    Já tem conta?{" "}
                    <Link href="#" underline="none" onClick={(e) => { e.preventDefault(); navigate("/login"); }} sx={{ color: C.navy, fontWeight: 600, "&:hover": { color: C.navyLight } }}>
                      Entrar
                    </Link>
                  </Typography>
                </>
              )}
            </Box>
          </Fade>
        </Box>

      </Box>
    </ThemeProvider>
  );
}