import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Email o contraseña incorrectos.');
        return;
      }

      login(data.user);

      // Redirigir según rol
      const role = data.user.role;
      navigate(role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">
            FREETIME
          </h1>
          <p className="text-secondary">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <InputField
            label="Email"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            icon={<Lock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-bold text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button variant="secondary" size="lg" loading={loading} type="submit">
            Entrar <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <p className="text-center mt-8 text-secondary">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}