// source/fulltimer/pages/TaskHistoryPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  User,
  Star,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { cn } from '../../shared/lib/utils';
import Tab from '../../shared/components/ui/Tab';

const TABS = [
  { key: 'ALL',       label: 'Todas'      },
  { key: 'COMPLETED', label: 'Aceptadas'  },
  { key: 'ACTIVE',    label: 'Activas'    },
  { key: 'CANCELLED', label: 'Canceladas' },
  { key: 'FINISHED',  label: 'Terminadas' },
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
  FINISHED: {
    label: 'Terminada',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <Trophy className="w-4 h-4 text-emerald-500" />,
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
        setTasks(data.tasks || []);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const getCount = (key) => {
    if (key === 'ALL') return tasks.length;
    if (key === 'ACTIVE') return tasks.filter((t) => t.status === 'ACTIVE' || t.status === 'OPEN').length;
    return tasks.filter((t) => t.status === key).length;
  };

  const filtered =
    activeTab === 'ALL'
      ? tasks
      : activeTab === 'ACTIVE'
      ? tasks.filter((t) => t.status === 'ACTIVE' || t.status === 'OPEN')
      : tasks.filter((t) => t.status === activeTab);

  if (selectedTask) {
    return <TaskDetailView task={selectedTask} onBack={() => setSelectedTask(null)} />;
  }

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      {/* Columna izquierda (publicidad) */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      {/* Contenido central */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Header sticky */}
        <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
              Historial de Tareas
            </h1>
          </div>

          {/* Tabs — 5 tabs: 3 arriba + 2 centrados abajo en móvil, flex wrap centrado en desktop */}
          <div className="mt-3 max-w-2xl mx-auto">
            {/* Mobile: grid de 3 columnas, última fila centrada */}
            <div className="flex flex-wrap justify-center gap-2 md:hidden">
              {TABS.map((tab) => (
                <Tab
                  key={tab.key}
                  label={tab.label}
                  count={getCount(tab.key)}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>
            {/* Desktop: flex wrap centrado */}
            <div className="hidden md:flex flex-wrap gap-2 justify-center max-w-[500px] mx-auto">
              {TABS.map((tab) => (
                <Tab
                  key={tab.key}
                  label={tab.label}
                  count={getCount(tab.key)}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-hide">
          <div className="px-5 py-8 pb-6 max-w-2xl mx-auto space-y-3">
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
                        <div className="flex items-center gap-2">
                          {STATUS_CONFIG[task.status]?.icon}
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                              STATUS_CONFIG[task.status]?.color
                            )}
                          >
                            {STATUS_CONFIG[task.status]?.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-base truncate">{task.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-secondary font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.location}
                          </span>
                          {task.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.date).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha (publicidad) */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}