// source/fulltimer/pages/TaskHistoryPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, PlayCircle, Clock,
  MapPin, Calendar, ChevronDown, ChevronUp,
  User, Star, Trophy, Tag,
} from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import Tab from '../../shared/components/ui/Tab';
import { MOCK_TASKS } from '../../shared/lib/mockTasks';

const PRIMARY = '#7D27BE';

const TABS = [
  { key: 'ALL',       label: 'Todas'      },
  { key: 'COMPLETED', label: 'Aceptadas'  },
  { key: 'ACTIVE',    label: 'Activas'    },
  { key: 'CANCELLED', label: 'Canceladas' },
  { key: 'FINISHED',  label: 'Terminadas' },
];

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completada', icon: <CheckCircle2 className="w-5 h-5" />, color: '#16a34a', bg: '#f0fdf4' },
  ACTIVE:    { label: 'Activa',     icon: <PlayCircle   className="w-5 h-5" />, color: PRIMARY,   bg: '#f3e8ff' },
  OPEN:      { label: 'Abierta',    icon: <Clock        className="w-5 h-5" />, color: '#2563eb', bg: '#eff6ff' },
  CANCELLED: { label: 'Cancelada',  icon: <XCircle      className="w-5 h-5" />, color: '#ef4444', bg: '#fef2f2' },
  FINISHED:  { label: 'Terminada',  icon: <Trophy       className="w-5 h-5" />, color: '#16a34a', bg: '#f0fdf4' },
  PENDING:   { label: 'Pendiente',  icon: <Clock        className="w-5 h-5" />, color: '#d97706', bg: '#fef9c3' },
};

// Tarea mock para historial (status FINISHED para que aparezca en "Terminadas" y "Todas")
const HISTORY_MOCK = {
  ...MOCK_TASKS[0],
  id: 'hist-1',
  status: 'FINISHED',
  freetimer: 'Carlos Ramírez',
  fretimerRating: 4.8,
  duration: '2 horas',
  dateLabel: 'May 10, 2026',
};

// Agrupar por mes
function groupByMonth(tasks) {
  const groups = {};
  tasks.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { label, items: [] };
    groups[key].items.push(t);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v);
}

export default function TaskHistoryPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab,  setActiveTab]  = useState('ALL');

  // En producción esto vendría de la API; por ahora usamos el mock
  const allTasks = [HISTORY_MOCK];

  const getCount = (key) => {
    if (key === 'ALL') return allTasks.length;
    if (key === 'ACTIVE') return allTasks.filter(t => t.status === 'ACTIVE' || t.status === 'OPEN').length;
    return allTasks.filter(t => t.status === key).length;
  };

  const filtered =
    activeTab === 'ALL'    ? allTasks :
    activeTab === 'ACTIVE' ? allTasks.filter(t => t.status === 'ACTIVE' || t.status === 'OPEN') :
                             allTasks.filter(t => t.status === activeTab);

  const groups = groupByMonth(filtered);

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Header sticky */}
        <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
              Historial de Tareas
            </h1>
          </div>
          <div className="mt-3 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2">
              {TABS.map(tab => (
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

        {/* Lista agrupada por mes */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-medium" style={{ color: '#6b7280' }}>No hay tareas en esta categoría.</p>
              </div>
            ) : (
              groups.map((group, gi) => (
                <div key={gi} className="space-y-3">
                  {/* Separador de mes */}
                  <div className="flex items-center gap-4 py-1">
                    <div className="h-px flex-1" style={{ background: '#e5e7eb' }} />
                    <span className="text-sm font-bold uppercase tracking-widest capitalize px-2" style={{ color: '#4b5563' }}>
                      {group.label}
                    </span>
                    <div className="h-px flex-1" style={{ background: '#e5e7eb' }} />
                  </div>

                  {group.items.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      expanded={expandedId === task.id}
                      onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Tarjeta de tarea expandible (estilo PaymentCard, sin info de pagos) ─────
function TaskCard({ task, expanded, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.OPEN;

  const cardStyle = expanded
    ? { borderColor: PRIMARY,          background: PRIMARY }
    : hovered
    ? { borderColor: `${PRIMARY}40`,   background: `${PRIMARY}08` }
    : { borderColor: '#f3f4f6',        background: '#fff' };

  const textColor    = expanded ? '#fff'                   : '#111827';
  const subColor     = expanded ? 'rgba(255,255,255,0.7)'  : '#6b7280';
  const iconBg       = expanded ? '#fff'                   : cfg.bg;
  const iconColor    = expanded ? PRIMARY                  : cfg.color;

  return (
    <motion.div
      layout
      className="rounded-3xl border-2 overflow-hidden cursor-pointer transition-all duration-200"
      style={cardStyle}
      onClick={onToggle}
      onMouseEnter={() => { if (!expanded) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fila principal */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Ícono de estado */}
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors" style={{ background: iconBg, color: iconColor }}>
            {cfg.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate" style={{ color: textColor }}>{task.title}</h4>
            {task.freetimer && (
              <p className="text-xs font-semibold" style={{ color: expanded ? '#fff' : PRIMARY }}>
                {task.freetimer}
              </p>
            )}
            <p className="text-xs" style={{ color: subColor }}>
              {task.dateLabel || new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })} · {cfg.label}
            </p>
          </div>
        </div>

        {/* Presupuesto + chevron */}
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right">
            <div className="font-bold text-sm" style={{ color: expanded ? '#fff' : PRIMARY }}>
              ${task.budget?.toLocaleString('es-CO')}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: expanded ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
              Presupuesto
            </div>
          </div>
          {expanded
            ? <ChevronUp   className="w-4 h-4 text-white" />
            : <ChevronDown className="w-4 h-4" style={{ color: '#9ca3af' }} />
          }
        </div>
      </div>

      {/* Detalle expandido */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {/* Descripción */}
              <p className="text-xs pt-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {task.description}
              </p>

              {/* Grid de detalles */}
              <div className="grid grid-cols-2 gap-3">
                <DetailChip icon={<MapPin    className="w-3.5 h-3.5" />} label="Ubicación"  value={task.location}           />
                <DetailChip icon={<Calendar  className="w-3.5 h-3.5" />} label="Fecha"      value={task.dateLabel || task.date} />
                <DetailChip icon={<Tag       className="w-3.5 h-3.5" />} label="Categoría"  value={task.category}           />
                {task.duration && (
                  <DetailChip icon={<Clock   className="w-3.5 h-3.5" />} label="Duración"   value={task.duration}           />
                )}
              </div>

              {/* FreeTimer asignado */}
              {task.freetimer && (
                <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: '#fff', border: '1px solid #fff' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
                      <User className="w-4 h-4" style={{ color: PRIMARY }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: PRIMARY }}>{task.freetimer}</p>
                      <p className="text-[10px]" style={{ color: '#6b7280' }}>FreeTimer asignado</p>
                    </div>
                  </div>
                  {task.fretimerRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold" style={{ color: '#111827' }}>{task.fretimerRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailChip({ icon, label, value }) {
  return (
    <div className="rounded-2xl p-3 space-y-1" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-semibold" style={{ color: '#fff' }}>{value}</p>
    </div>
  );
}