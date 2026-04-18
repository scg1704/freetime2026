import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import GoogleButton from '../components/GoogleButton';

// ─────────────────────────────────────────────
// Divider "o"
// ─────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">o</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Remember me checkbox
// ─────────────────────────────────────────────
function RememberCheckbox({ checked, onChange }) {
  return (
    <label
      htmlFor="remember"
      className="flex items-center gap-2.5 cursor-pointer select-none group"
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary/50'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <input
        id="remember"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-secondary font-medium">Recordar inicio de sesión</span>
    </label>
  );
}

// ─────────────────────────────────────────────
// Main LoginPage
// ─────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectByRole = (role) =>
    navigate(role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home');

  // ── Manual login ─────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Por favor ingresa tu email y contraseña.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Email o contraseña incorrectos.');
        return;
      }

      login(data.user, remember);
      redirectByRole(data.user.role);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ─────────────────────────────
  // We only send googleId + email. The backend finds the account by email
  // and returns whatever role that account was registered with.
  // No role toggle needed — one email = one account = one role.
  const handleGoogleSuccess = async (googleUser) => {
    setError('');
    try {
      const res  = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email:    googleUser.email,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'No encontramos una cuenta asociada a este Google. ¿Ya te registraste?');
        return;
      }

      // Google logins always persist (user chose SSO = expects to stay logged in)
      login(data.user, true);
      redirectByRole(data.user.role);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">FREETIME</h1>
            <p className="text-secondary">Inicia sesión para continuar</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Manual login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <InputField
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between">
              <RememberCheckbox checked={remember} onChange={setRemember} />
              <button type="button" className="text-sm font-bold text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button className="bg-primary hover:bg-[#5c178e] text-white" variant="secondary" size="lg" loading={loading} type="submit">
              Entrar <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="my-6">
            <Divider />
          </div>

          {/* Google login — no role selector, backend auto-detects it */}
          <GoogleButton
            label="Continuar con Google"
            onSuccess={handleGoogleSuccess}
          />

          <p className="text-center mt-8 text-secondary text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}