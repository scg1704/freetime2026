import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Award, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TaskDetailsPage() {
  const { user } = useAuth();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        const data = await res.json();
        if (res.ok) setTask(data.task);
      } catch (err) {
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-secondary font-medium">
          Debes iniciar sesión para ver los detalles de la tarea.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary text-white px-6 py-2 rounded-full font-bold"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Tarea no encontrada
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8 bg-white min-h-screen">
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
          {task.category}
        </span>
        <h1 className="text-4xl font-bold tracking-tighter">{task.title}</h1>
        <div className="flex items-center gap-2 text-secondary text-sm font-medium">
          <MapPin className="w-4 h-4" />
          <span>{task.location}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={<DollarSign className="text-green-500" />}
          label="Presupuesto"
          value={`$${task.budget?.toLocaleString()}`}
        />
        <StatItem
          icon={<Clock className="text-blue-500" />}
          label="Duración"
          value={`${task.estimatedDuration} Horas`}
        />
        <StatItem
          icon={<Calendar className="text-orange-500" />}
          label="Fecha"
          value={new Date(task.date).toLocaleDateString()}
        />
        <StatItem
          icon={<Award className="text-purple-500" />}
          label="Nivel"
          value={task.specializationLevel}
        />
      </div>

      {/* Description */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Descripción
        </h2>
        <p className="text-secondary leading-relaxed">{task.description}</p>
      </section>

      {/* FullTimer Profile */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Publicado por
        </h2>
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-4xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${task.fulltimerId}/100`}
                alt={task.fulltimerName}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="font-bold text-lg">{task.fulltimerName}</h4>
              <div className="flex items-center gap-1 text-yellow-500">
                <ShieldCheck className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-black">Verificado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="fixed bottom-24 left-6 right-6 flex gap-4">
        <button className="flex-1 bg-gray-100 text-black py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <MessageSquare className="w-5 h-5" /> Chat
        </button>
        <button
          onClick={() => navigate(`/execution/${task.id}`)}
          className="flex-2 bg-primary text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          Postularse Ahora <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col gap-1">
      <div className="p-2 bg-white rounded-xl w-fit shadow-sm mb-1">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
        {label}
      </span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}