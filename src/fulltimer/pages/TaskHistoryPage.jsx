// source/fulltimer/pages/TaskHistoryPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, CheckCircle2, XCircle, PlayCircle,
  Clock, MapPin, Calendar, ChevronRight, User, Star,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { cn } from '../../shared/lib/utils';

const TABS = [
  { key: 'ALL',       label: 'Todas' },
  { key: 'COMPLETED', label: 'Aceptadas' },
  { key: 'ACTIVE',    label: 'Activas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completada',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  },
  ACTIVE: {
    label: 'Activa',
    color: 'bg-primary/10 text-primary',
    icon: <PlayCircle className="w-4 h-4 text-primary" />,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-600',
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
  OPEN: {
    label: 'Abierta',
    color: 'bg-blue-100 text-blue-600',
    icon: <Clock className="w-4 h-4 text-blue-500" />,
  },
};

export default function TaskHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        // Historial: todo excepto OPEN sin freetimer asignado
        const history = data.tasks || [];
        setTasks(history);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const filtered = activeTab === 'ALL'
    ? tasks
    : activeTab === 'ACTIVE'
      ? tasks.filter((t) => t.status === 'ACTIVE' || t.status === 'OPEN')
      : tasks.filter((t) => t.status === activeTab);

  if (selectedTask) {
    return (
      <TaskDetailView
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight">Historial de Tareas</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5 max-w-xl mx-auto no-scrollbar">
          {TABS.map((tab) => {
            const count = tab.key === 'ALL'
              ? tasks.length
              : tab.key === 'ACTIVE'
                ? tasks.filter((t) => t.status === 'ACTIVE' || t.status === 'OPEN').length
                : tasks.filter((t) => t.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-[10px] font-black px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="px-5 py-5 max-w-xl mx-auto space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-5 h-24 animate-pulse" />
          ))
        ) : apiError ? (
          <div className="text-center py-16 text-secondary">
            <p className="font-medium">No se pudo conectar con el servidor.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-secondary font-medium">No hay tareas en esta categoría.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                onClick={() => setSelectedTask(task)}
                className="bg-white border-2 border-gray-100 hover:border-primary/25 hover:shadow-md p-5 rounded-3xl cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      {STATUS_CONFIG[task.status]?.icon}
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                        STATUS_CONFIG[task.status]?.color
                      )}>
                        {STATUS_CONFIG[task.status]?.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-base truncate">{task.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-secondary font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {task.location}
                      </span>
                      {task.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Freetimer asignado */}
                    {task.freetimerId && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <User className="w-3 h-3 text-primary" />
                        <span>Freetimer asignado</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-base font-bold text-primary">
                      ${task.budget?.toLocaleString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Vista de detalle de tarea del historial ────────────────────────────────
function TaskDetailView({ task, onBack }) {
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.OPEN;

  // Mock freetimer data — se reemplazará con fetch real
  const freetimer = task.freetimerId
    ? {
        id: task.freetimerId,
        name: task.freetimерName || 'FreeTimer Asignado',
        rating: 4.8,
        tasksCompleted: 24,
        verified: true,
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold tracking-tight truncate">{task.title}</h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-xl mx-auto space-y-6">
        {/* Status */}
        <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl w-fit', cfg.color)}>
          {cfg.icon}
          <span className="text-sm font-bold">{cfg.label}</span>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Presupuesto', value: `$${task.budget?.toLocaleString()}` },
            { label: 'Categoría',   value: task.category },
            { label: 'Ubicación',   value: task.location },
            { label: 'Fecha',       value: task.date ? new Date(task.date).toLocaleDateString('es-CO') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">{label}</p>
              <p className="font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Descripción */}
        {task.description && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Descripción</h2>
            <p className="text-secondary text-sm leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Freetimer asignado */}
        {freetimer ? (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              FreeTimer {task.status === 'COMPLETED' ? 'que realizó la tarea' : 'asignado'}
            </h2>
            <FreetimeCard freetimer={freetimer} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-secondary text-sm">No hay FreeTimer asignado a esta tarea.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FreetimeCard({ freetimer }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
          <img
            src={`https://picsum.photos/seed/${freetimer.id}/100`}
            alt={freetimer.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base">{freetimer.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-gray-700">{freetimer.rating?.toFixed(1)}</span>
            </div>
            <span className="text-xs text-secondary">{freetimer.tasksCompleted} tareas</span>
            {freetimer.verified && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Verificado ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}