// src/auth/pages/EmailVerificationPage.jsx
/* import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence }      from 'motion/react';
import { useNavigate }                  from 'react-router-dom';
import { useAuth }                      from '../../shared/context/AuthContext';
import { Mail, AlertCircle, RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';

const CODE_LENGTH     = 6;
const RESEND_COOLDOWN = 60;

export default function EmailVerificationPage() {
  const navigate               = useNavigate();
  const { user, markVerified } = useAuth();

  const [digits,       setDigits]      = useState(Array(CODE_LENGTH).fill(''));
  const [status,       setStatus]      = useState('idle');  // idle | loading | transitioning | success | error
  const [errorMsg,     setErrorMsg]    = useState('');
  const [sending,      setSending]     = useState(false);
  const [cooldown,     setCooldown]    = useState(0);
  const [sent,         setSent]        = useState(false);
  // Guardamos el usuario verificado del servidor pero NO actualizamos el contexto
  // hasta que el usuario toque "Continuar", para que la animación pueda mostrarse
  // sin que EmailVerifyRoute desmonte el componente prematuramente.
  const [verifiedUser, setVerifiedUser]= useState(null);

  const inputRefs  = useRef([]);
  const hasSentRef = useRef(false);

  // ── Enviar código al montar (una sola vez) ────────────────────────────────
  useEffect(() => {
    if (user && !hasSentRef.current) {
      hasSentRef.current = true;
      sendCode();
    }
  }, [user]);

  // ── Cooldown countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Enviar / reenviar código ──────────────────────────────────────────────
  const sendCode = async () => {
    if (!user?.token) return;
    setSending(true);
    setErrorMsg('');
    try {
      const res  = await fetch('/api/auth/send-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'No se pudo enviar el código.');
      } else {
        setSent(true);
        setCooldown(RESEND_COOLDOWN);
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 120);
      }
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrorMsg('');
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === CODE_LENGTH - 1) {
      const full = next.join('');
      if (full.length === CODE_LENGTH) verifyCode(full);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0)               inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1)  inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    if (pasted.length === CODE_LENGTH) verifyCode(pasted);
  };

  // ── Verificar código ──────────────────────────────────────────────────────
  const verifyCode = async (code) => {
    if (!user?.token || code.length < CODE_LENGTH) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res  = await fetch('/api/auth/confirm-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        // IMPORTANTE: guardamos el usuario pero NO llamamos markVerified() aquí.
        // Si lo hiciéramos, AuthContext actualizaría user.verified=true y EmailVerifyRoute
        // desmontaría este componente antes de que la animación pueda renderizarse.
        // markVerified() se llama únicamente en handleContinue().
        setVerifiedUser(data.user || null);
        setStatus('transitioning');
        setTimeout(() => setStatus('success'), 1200);
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Código incorrecto. Intenta de nuevo.');
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => { setStatus('idle'); inputRefs.current[0]?.focus(); }, 600);
      }
    } catch {
      setStatus('error');
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setTimeout(() => setStatus('idle'), 600);
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length === CODE_LENGTH) verifyCode(code);
  };

  // handleContinue: aquí sí actualizamos el contexto y navegamos
  const handleContinue = () => {
    if (verifiedUser) markVerified(verifiedUser);
    else              markVerified();
    navigate(
      user?.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home',
      { replace: true }
    );
  };

  const codeComplete = digits.every((d) => d !== '');
  const maskedEmail  = (user?.email || '').replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.max(2, b.length)) + c);
  const isTransition = status === 'transitioning';
  const isSuccess    = status === 'success'; */

  // ─────────────────────────────────────────────────────────────────────────
  // Pantalla de carga → éxito
  // ─────────────────────────────────────────────────────────────────────────
  /* if (isTransition || isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-10">

        {/* Círculo: spinner morado → check morado }
        <div className="relative w-28 h-28 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isTransition && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-28 h-28 rounded-full border-[6px] border-primary/20 border-t-primary animate-spin" />
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                  <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Texto y botón — solo aparecen en success }
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center gap-6 text-center w-full max-w-xs"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Verificación exitosa</h2>
                <p className="text-sm text-secondary">Puedes acceder a tu cuenta.</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-[#5c178e] active:scale-95 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Pantalla de ingreso de código
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-lg">
            <Mail className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Verifica tu correo</h1>
          <p className="text-secondary text-sm">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-semibold text-gray-700">{maskedEmail}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Inputs }
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={status === 'loading' || !sent}
                className={[
                  'w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  digit            ? 'border-primary/60 bg-purple-50'  : 'border-gray-200 bg-gray-50',
                  status === 'error' ? 'border-red-300 bg-red-50'       : '',
                  !sent            ? 'opacity-40 cursor-not-allowed'   : '',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Error }
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 px-3 py-2 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spinner envío inicial }
          {!sent && sending && (
            <div className="flex items-center justify-center gap-2 text-sm text-secondary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Enviando código…
            </div>
          )}

          {/* Botón verificar }
          <button
            type="button"
            disabled={!codeComplete || status === 'loading' || !sent}
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            {status === 'loading'
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verificando…</>
              : <>Verificar código <ArrowRight className="w-5 h-5" /></>
            }
          </button>

          {/* Reenviar }
          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-secondary">
                Reenviar en <span className="font-bold text-gray-600">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="text-xs text-primary font-bold hover:underline disabled:opacity-40 flex items-center gap-1 mx-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
                {sending ? 'Enviando…' : 'Reenviar código'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            Revisa también tu carpeta de spam si no ves el correo.
          </p>
        </div>
      </div>
    </div>
  );
} */