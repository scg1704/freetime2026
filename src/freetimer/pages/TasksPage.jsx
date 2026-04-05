import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';

export default function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks?status=OPEN');
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
  }, []);

  const filtered = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-secondary font-medium">Debes iniciar sesión para explorar tareas.</p>
        <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-full font-bold">
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8">
      <h1 className="text-4xl font-bold tracking-tighter">Explorar Tareas</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm">
          <Filter className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Ubicación', 'Fecha', 'Postulantes', 'Presupuesto', 'Categoría'].map((f) => (
          <button key={f} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-secondary whitespace-nowrap hover:bg-gray-200 transition-colors">
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Tareas Disponibles
        </h2>
        {loading ? (
          <p className="text-center py-12 text-secondary animate-pulse">Cargando tareas...</p>
        ) : apiError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-secondary font-medium">No se pudo conectar con el servidor.</p>
            <p className="text-xs text-gray-400">El backend se configurará en el siguiente paso.</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              category={task.category}
              price={`$${task.budget?.toLocaleString()}`}
              location={task.location}
              fulltimerName={task.fulltimerName}
              applicants={task.applicants || 0}
              time={task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Reciente'}
            />
          ))
        ) : (
          <p className="text-center py-12 text-secondary">No hay tareas disponibles.</p>
        )}
      </div>
    </div>
  );
}