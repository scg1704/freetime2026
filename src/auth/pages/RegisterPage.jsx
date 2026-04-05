import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { useAuth } from '../../shared/context/AuthContext';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import RoleCard from '../components/RoleCard';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateStep2 = () => {
    if (!email.trim()) return 'El email es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no es válido.';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  };

  const validateStep3 = () => {
    if (!name.trim()) return 'El nombre es requerido.';
    if (!lastName.trim()) return 'El apellido es requerido.';
    if (!phone.trim()) return 'El teléfono es requerido.';
    if (!city.trim()) return 'La ciudad es requerida.';
    return null;
  };

  const handleStep2 = () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validateStep3();
    if (err) { setError(err); return; }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, lastName, phone, city, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al crear la cuenta.');
        return;
      }

      login(data.user);
      navigate('/verification');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">
            FREETIME
          </h1>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1 w-8 rounded-full transition-all',
                  step >= s ? 'bg-primary' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1 — Rol */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              ¿Cómo quieres usar FreeTime?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <RoleCard
                selected={role === 'FULLTIMER'}
                onClick={() => setRole('FULLTIMER')}
                title="FullTimer"
                description="Necesito ayuda con tareas y quiero contratar expertos."
              />
              <RoleCard
                selected={role === 'FREETIMER'}
                onClick={() => setRole('FREETIMER')}
                title="FreeTimer"
                description="Tengo tiempo y habilidades para ayudar a otros."
              />
            </div>
            <Button
              variant="secondary"
              size="lg"
              disabled={!role}
              onClick={() => setStep(2)}
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2 — Cuenta */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Datos de la cuenta</h2>
            <InputField
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              icon={<Lock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-primary" id="terms" required />
              <label htmlFor="terms" className="text-sm text-secondary">
                Acepto los{' '}
                <button type="button" className="text-primary font-bold">
                  Términos y Condiciones
                </button>{' '}
                y la Política de Privacidad.
              </label>
            </div>
            <Button variant="secondary" size="lg" onClick={handleStep2}>
              Siguiente <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 3 — Info personal */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Información Personal</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Nombre"
                placeholder="Juan"
                icon={<User />}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                label="Apellido"
                placeholder="Pérez"
                icon={<User />}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <InputField
              label="Teléfono"
              placeholder="+57 300 000 0000"
              icon={<Phone />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <InputField
              label="Ciudad"
              placeholder="Bogotá, Colombia"
              icon={<MapPin />}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Button variant="primary" size="lg" loading={loading} type="submit">
              Finalizar Registro <CheckCircle2 className="w-5 h-5" />
            </Button>
          </form>
        )}

        <p className="text-center mt-8 text-secondary">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}