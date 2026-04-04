import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

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
        const active = data.tasks?.find(
          (t) => t.status === 'ACTIVE' || t.status === 'PENDING'
        );
        setNextTask(active || null);
      } catch {
        // API aún no disponible — muestra UI vacía sin romper la app
        setApiError(true);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-secondary font-medium">
          Debes iniciar sesión para ver tu tablero.
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

  return (
    <div className="px-6 py-8 space-y-10">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Hola, {user.name} 👋
        </h1>
        <p className="text-secondary font-medium">
          {apiError
            ? 'Conectando con el servidor...'
            : `Tienes ${tasks.filter((t) => t.status === 'PENDING').length} tareas pendientes`}
        </p>
      </div>

      {/* Next Task */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Próxima Tarea
        </h2>
        {loading ? (
          <div className="bg-gray-50 p-12 rounded-[40px] text-center animate-pulse">
            <p className="text-secondary">Cargando...</p>
          </div>
        ) : nextTask ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/execution/${nextTask.id}`)}
            className="bg-primary p-8 rounded-[40px] text-white shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  {new Date(nextTask.date).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </span>
                <span className="text-2xl font-bold">
                  ${nextTask.budget?.toLocaleString()}
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2 tracking-tight">
                {nextTask.title}
              </h3>
              <p className="text-white/80 mb-8">{nextTask.location}</p>
              <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                Ver Detalles <PlayCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        ) : (
          <div className="bg-gray-50 p-12 rounded-[40px] border-2 border-dashed border-gray-200 text-center space-y-4">
            <p className="text-secondary font-medium">No tienes tareas próximas</p>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary font-bold hover:underline"
            >
              Explorar tareas disponibles
            </button>
          </div>
        )}
      </section>

      {/* Resumen */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Resumen
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatusCard
            icon={<CheckCircle2 className="text-green-500" />}
            label="Completadas"
            count={tasks.filter((t) => t.status === 'COMPLETED').length}
          />
          <StatusCard
            icon={<XCircle className="text-red-500" />}
            label="Canceladas"
            count={tasks.filter((t) => t.status === 'CANCELLED').length}
          />
          <StatusCard
            icon={<Clock className="text-yellow-500" />}
            label="Pendientes"
            count={tasks.filter((t) => t.status === 'PENDING').length}
          />
          <StatusCard
            icon={<AlertCircle className="text-primary" />}
            label="Activas"
            count={tasks.filter((t) => t.status === 'ACTIVE').length}
          />
        </div>
      </section>

      {/* FAB */}
      <section className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => navigate(user.role === 'FREETIMER' ? '/tasks' : '/post-task')}
          className="bg-black text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          {user.role === 'FREETIMER' ? (
            <Search className="w-8 h-8" />
          ) : (
            <Plus className="w-8 h-8" />
          )}
        </button>
      </section>

      {/* Actividad reciente */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Actividad Reciente
        </h2>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <ActivityItem
                key={task.id}
                title={task.title}
                userName={
                  user.role === 'FREETIMER'
                    ? task.fulltimerName
                    : task.freetimerId
                    ? 'FreeTimer asignado'
                    : 'Sin asignar'
                }
                status={task.status}
                price={`$${task.budget?.toLocaleString()}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary py-8">
            {apiError ? 'No se pudo cargar la actividad.' : 'No hay actividad reciente.'}
          </p>
        )}
      </section>
    </div>
  );
}

function StatusCard({ icon, label, count }) {
  return (
    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center gap-2">
      <div className="p-2 bg-white rounded-full shadow-sm">{icon}</div>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
        {label}
      </span>
    </div>
  );
}

function ActivityItem({ title, userName, status, price }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between hover:border-primary/20 transition-colors">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${userName}/100`}
            alt={userName}
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h4 className="font-bold text-lg">{title}</h4>
          <p className="text-secondary text-sm">
            {userName} • {status}
          </p>
        </div>
      </div>
      <div className="font-bold text-primary">{price}</div>
    </div>
  );
}