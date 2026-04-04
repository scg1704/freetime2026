import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, DollarSign, Calendar, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/src/lib/utils';

export default function PostTaskPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hogar',
    budget: '',
    location: '',
    date: '',
    specializationLevel: 'PRINCIPIANTE',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) { setError('El título es requerido.'); return; }
    if (!formData.description.trim()) { setError('La descripción es requerida.'); return; }
    if (!formData.budget || Number(formData.budget) <= 0) { setError('El presupuesto debe ser mayor a 0.'); return; }
    if (!formData.location.trim()) { setError('La ubicación es requerida.'); return; }
    if (!formData.date) { setError('La fecha es requerida.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al publicar la tarea.');
        return;
      }

      navigate('/home');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'FULLTIMER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
        <p className="text-secondary font-medium">
          Solo los FullTimers pueden publicar tareas.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="bg-primary text-white px-6 py-2 rounded-full font-bold"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Publicar Nueva Tarea</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {/* Título */}
        <Field label="Título de la Tarea">
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              placeholder="Ej: Limpieza de jardín, Paseo de perros..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>
        </Field>

        {/* Descripción */}
        <Field label="Descripción Detallada">
          <textarea
            required
            rows={4}
            placeholder="Describe lo que necesitas que se haga..."
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            value={formData.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>

        {/* Presupuesto y Categoría */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Presupuesto (COP)">
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="number"
                min="1000"
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.budget}
                onChange={(e) => update('budget', e.target.value)}
              />
            </div>
          </Field>
          <Field label="Categoría">
            <select
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              value={formData.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {['Hogar', 'Mascotas', 'Tecnología', 'Educación', 'Mandados', 'Eventos', 'Profesionales', 'Otros'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Fecha y Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha y Hora">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="datetime-local"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.date}
                onChange={(e) => update('date', e.target.value)}
              />
            </div>
          </Field>
          <Field label="Ubicación">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="Ciudad, Barrio..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* Nivel */}
        <Field label="Nivel de Especialización">
          <div className="flex gap-2">
            {['PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => update('specializationLevel', level)}
                className={cn(
                  'flex-1 py-3 rounded-2xl font-bold text-xs transition-all',
                  formData.specializationLevel === level
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </Field>

        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          type="submit"
          className="w-full bg-black text-white py-5 rounded-4xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : (<>Publicar Tarea <Send className="w-5 h-5" /></>)}
        </motion.button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}