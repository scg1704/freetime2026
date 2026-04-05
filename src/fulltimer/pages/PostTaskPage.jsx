import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, DollarSign, Calendar, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { cn } from '../../shared/lib/utils';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';

const CATEGORIES = ['Hogar', 'Mascotas', 'Tecnología', 'Educación', 'Mandados', 'Eventos', 'Profesionales', 'Otros'];
const LEVELS = ['PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO'];

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

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!formData.title.trim()) return 'El título es requerido.';
    if (!formData.description.trim()) return 'La descripción es requerida.';
    if (!formData.budget || Number(formData.budget) <= 0) return 'El presupuesto debe ser mayor a 0.';
    if (!formData.location.trim()) return 'La ubicación es requerida.';
    if (!formData.date) return 'La fecha es requerida.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...formData, budget: Number(formData.budget) }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Error al publicar la tarea.'); return; }
      navigate('/fulltimer/home');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'FULLTIMER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
        <p className="text-secondary font-medium">Solo los FullTimers pueden publicar tareas.</p>
        <Button variant="primary" onClick={() => navigate('/fulltimer/home')}>Volver al Inicio</Button>
      </div>
    );
  }

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
        <InputField
          label="Título de la Tarea"
          placeholder="Ej: Limpieza de jardín, Paseo de perros..."
          icon={<Briefcase />}
          value={formData.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Descripción Detallada
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe lo que necesitas que se haga..."
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            value={formData.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Presupuesto (COP)"
            type="number"
            min="1000"
            placeholder="0"
            icon={<DollarSign />}
            value={formData.budget}
            onChange={(e) => update('budget', e.target.value)}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Categoría</label>
            <select
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              value={formData.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Fecha y Hora"
            type="datetime-local"
            icon={<Calendar />}
            value={formData.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
          <InputField
            label="Ubicación"
            placeholder="Ciudad, Barrio..."
            icon={<MapPin />}
            value={formData.location}
            onChange={(e) => update('location', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Nivel de Especialización
          </label>
          <div className="flex gap-2">
            {LEVELS.map((level) => (
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
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          type="submit"
          className="w-full bg-black text-white py-5 rounded-[32px] font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : <><Send className="w-5 h-5" /> Publicar Tarea</>}
        </motion.button>
      </form>
    </div>
  );
}