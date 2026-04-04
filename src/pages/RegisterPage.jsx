import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils.js';

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

  const handleRegister = async (e) => {
    e.preventDefault();
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
        setError(data.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
        return;
      }

      navigate('/verification');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">
            FREETIME
          </h1>
          <div className="flex justify-center gap-2 mb-4">
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

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
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
            <button
              disabled={!role}
              onClick={() => setStep(2)}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              Datos de la cuenta
            </h2>
            <InputField
              icon={<Mail />}
              label="Email"
              placeholder="tu@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              icon={<Lock />}
              label="Contraseña"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-primary"
                id="terms"
                required
              />
              <label htmlFor="terms" className="text-sm text-secondary">
                Acepto los{' '}
                <button type="button" className="text-primary font-bold">
                  Términos y Condiciones
                </button>{' '}
                y la Política de Privacidad.
              </label>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              Siguiente <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              Información Personal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={<User />}
                label="Nombre"
                placeholder="Juan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                icon={<User />}
                label="Apellido"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <InputField
              icon={<Phone />}
              label="Teléfono"
              placeholder="+57 300 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <InputField
              icon={<MapPin />}
              label="Ciudad"
              placeholder="Bogotá, Colombia"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
              <CheckCircle2 className="w-5 h-5" />
            </button>
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

function RoleCard({ selected, onClick, title, description }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-6 rounded-3xl border-2 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-100 bg-white hover:border-gray-200'
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <h3
          className={cn(
            'text-xl font-bold',
            selected ? 'text-primary' : 'text-black'
          )}
        >
          {title}
        </h3>
        {selected && <CheckCircle2 className="w-6 h-6 text-primary" />}
      </div>
      <p className="text-secondary text-sm leading-relaxed">{description}</p>
    </button>
  );
}

function InputField({ icon, label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
          {icon}
        </div>
        <input
          {...props}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all"
        />
      </div>
    </div>
  );
}