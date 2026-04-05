import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { cn } from '../../shared/lib/utils';

const STATUS_LABELS = {
  OPEN: { label: 'Abierta', color: 'bg-blue-100 text-blue-600' },
  PENDING: { label: 'Con postulantes', color: 'bg-yellow-100 text-yellow-600' },
  ACTIVE: { label: 'Activa', color: 'bg-green-100 text-green-600' },
  COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const filters = ['ALL', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tighter">Mis Tareas</h1>
        <button
          onClick={() => navigate('/fulltimer/post-task')}
          className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors',
              filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'
            )}
          >
            {f === 'ALL' ? 'Todas' : STATUS_LABELS[f]?.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-12 text-secondary animate-pulse">Cargando tareas...</p>
        ) : apiError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-secondary font-medium">No se pudo conectar con el servidor.</p>
            <p className="text-xs text-gray-400">El backend se configurará en el siguiente paso.</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/fulltimer/task/${task.id}/applicants`)}
              className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={cn('text-[10px] font-bold uppercase px-3 py-1 rounded-full', STATUS_LABELS[task.status]?.color)}>
                    {STATUS_LABELS[task.status]?.label}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight mt-2">{task.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">${task.budget?.toLocaleString()}</div>
                  <div className="text-xs text-secondary">{task.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-secondary font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {task.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.date ? new Date(task.date).toLocaleDateString() : 'Sin fecha'}
                </div>
                {(task.applicants ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <Users className="w-3 h-3" /> {task.applicants} postulantes
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-secondary">No tienes tareas en esta categoría.</p>
            <button
              onClick={() => navigate('/fulltimer/post-task')}
              className="text-primary font-bold hover:underline"
            >
              Publicar una tarea
            </button>
          </div>
        )}
      </div>
    </div>
  );
}