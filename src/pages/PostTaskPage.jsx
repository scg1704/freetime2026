import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, DollarSign, Calendar, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '@/src/lib/utils.js';

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
    if (!user) return;
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
        setError(data.message || 'Error al publicar la tarea');
        return;
      }

      navigate('/home');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
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

  return (
    <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 rounded-full"
        >
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
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Título de la Tarea
          </label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              placeholder="Ej: Limpieza de jardín, Paseo de perros..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        {/* Descripción */}
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Presupuesto y Categoría */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Presupuesto (COP)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="number"
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Categoría
            </label>
            <select
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Hogar">Hogar</option>
              <option value="Mascotas">Mascotas</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Educación">Educación</option>
              <option value="Mandados">Mandados</option>
              <option value="Eventos">Eventos</option>
              <option value="Profesionales">Profesionales</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        {/* Fecha y Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Fecha y Hora
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="datetime-local"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="Ciudad, Barrio..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Nivel de Especialización */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Nivel de Especialización
          </label>
          <div className="flex gap-2">
            {['PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, specializationLevel: level })}
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
          {loading ? (
            'Publicando...'
          ) : (
            <>
              Publicar Tarea <Send className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}