// source/fulltimer/pages/FulltimerDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, History, ClipboardList, PlayCircle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FulltimerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        const active = data.tasks?.find((t) => t.status === 'ACTIVE');
        setNextTask(active || null);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-9rem)] space-y-4">
        <p className="text-secondary font-medium">Debes iniciar sesión.</p>
        <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-full font-bold">
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // ─── MOBILE layout (< md) ────────────────────────────────────────────────
  const MobileLayout = () => (
    <div className="flex flex-col items-center px-4 pt-5 pb-8 gap-4 overflow-y-auto">

      {/* Saludo centrado */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-center w-full"
      >
        <h1 className="text-2xl font-bold tracking-tight">Hola, {user.name}</h1>
        <p className="text-secondary text-xs font-medium mt-0.5">
          {apiError ? 'Conectando...' : 'Gestiona tus tareas'}
        </p>
      </motion.div>

      {/* Tarea activa — ancho completo, más alta, contenido centrado */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.07 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          nextTask
            ? navigate(`/fulltimer/task/${nextTask.id}/applicants`)
            : navigate('/fulltimer/post-task')
        }
        className="w-full flex flex-col items-center justify-center p-7 rounded-[26px] border-2 relative overflow-hidden transition-all cursor-pointer"
        style={{
          minHeight: 240,
          background: nextTask ? 'linear-gradient(140deg, #7D27BE 0%, #6d1f9e 100%)' : undefined,
          backgroundColor: nextTask ? undefined : '#f3f4f6',
          borderColor: nextTask ? 'transparent' : '#e5e7eb',
        }}
      >
        {nextTask ? (
          <>
            <div className="relative z-10 flex flex-col items-center text-center gap-3 w-full">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                Tarea activa
              </span>
              <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">
                {nextTask.title}
              </h3>
              <div className="space-y-1 w-full flex flex-col items-center">
                {nextTask.location && (
                  <p className="text-white/70 text-xs flex items-center gap-1 font-medium justify-center">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{nextTask.location}</span>
                  </p>
                )}
                {nextTask.date && (
                  <p className="text-white/70 text-xs flex items-center gap-1 font-medium justify-center">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {new Date(nextTask.date).toLocaleDateString('es-CO', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                )}
                <p className="text-white font-bold text-2xl mt-1">
                  ${nextTask.budget?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <PlayCircle className="absolute top-5 right-5 w-5 h-5 text-white/30 pointer-events-none" />
          </>
        ) : loading ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Tarea activa
            </span>
            <p className="text-secondary text-sm font-medium">Sin tareas activas</p>
            {/* Link "+Publicar" con subrayado en hover y cursor pointer */}
            <span
              onClick={(e) => { e.stopPropagation(); navigate('/fulltimer/post-task'); }}
              className="text-primary text-xs font-bold mt-0.5 cursor-pointer hover:underline underline-offset-2 transition-all"
            >
              + Publicar →
            </span>
          </div>
        )}
      </motion.button>

      {/* Añadir tarea */}
      <MobileActionBtn
        delay={0.14}
        color="primary"
        icon={<Plus className="w-6 h-6" strokeWidth={2.5} />}
        label="Añadir tarea"
        onClick={() => navigate('/fulltimer/post-task')}
      />

      {/* Mis tareas */}
      <MobileActionBtn
        delay={0.18}
        color="primary"
        icon={<ClipboardList className="w-6 h-6" />}
        label="Mis tareas"
        onClick={() => navigate('/fulltimer/my-tasks')}
      />

      {/* Historial de tareas */}
      <MobileActionBtn
        delay={0.22}
        color="dark"
        icon={<History className="w-6 h-6" />}
        label="Historial de tareas"
        onClick={() => navigate('/fulltimer/task-history')}
      />
    </div>
  );

  // ─── DESKTOP layout (≥ md) ───────────────────────────────────────────────
  const DesktopLayout = () => (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden">
      {/* Columna lateral izquierda — solo xl+, reservada para anuncios */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex flex-col flex-1 px-5 pt-5 pb-5 gap-5 min-w-0 overflow-hidden">

        {/* ── FILA SUPERIOR: saludo + botones ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="flex gap-5 min-h-0"
          style={{ flex: '5.5 1 0' }}
        >
          {/* Columna izquierda: saludo encima + botón Añadir abajo — 30% */}
          <div
            className="flex flex-col gap-4 min-w-0"
            style={{ flex: '3 1 0' }}
          >
            {/* Saludo — ocupa la parte alta de la columna izquierda */}
            <div className="shrink-0 flex flex-col items-center text-center">
              <h1 className="text-xl font-bold tracking-tight leading-tight">
                Hola, {user.name}
              </h1>
              <p className="text-secondary text-xs font-medium mt-0.5">
                {apiError ? 'Conectando...' : 'Gestiona tus tareas'}
              </p>
            </div>

            {/* Añadir tarea — rellena el resto de la columna */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05}}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/fulltimer/post-task')}
              className="flex-1 flex flex-col items-center justify-center gap-4 bg-primary hover:bg-[#5c178e] text-white rounded-[26px] transition-all group p-4 cursor-pointer"
            >
              <div className="w-15 h-15 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-120 transition-transform duration-500">
                <Plus className="w-9 h-9" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-center leading-tight px-1 transition-transform duration-500 group-hover:scale-110 inline-block">
                Añadir<br />tarea
              </span>
            </motion.button>
          </div>

          {/* Tarea activa — 70% */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.025}}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              nextTask
                ? navigate(`/fulltimer/task/${nextTask.id}/applicants`)
                : navigate('/fulltimer/post-task')
            }
            className="flex flex-col justify-between p-6 rounded-[26px] border-2 text-left relative overflow-hidden group transition-all"
            style={{
              flex: '7 1 0',
              minWidth: 0,
              background: nextTask ? 'linear-gradient(140deg, #7D27BE 0%, #6d1f9e 100%)' : undefined,
              backgroundColor: nextTask ? undefined : '#f3f4f6',
              borderColor: nextTask ? 'transparent' : '#e5e7eb',
            }}
          >
            {nextTask ? (
              <>
                <div className="relative z-10">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 ">Tarea activa</span>
                  <h3 className="text-white font-bold text-lg leading-tight mt-1 line-clamp-2">{nextTask.title}</h3>
                </div>
                <div className="relative z-10 space-y-1">
                  {nextTask.location && (
                    <p className="text-white/70 text-xs flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{nextTask.location}</span>
                    </p>
                  )}
                  {nextTask.date && (
                    <p className="text-white/70 text-xs flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {new Date(nextTask.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  )}
                  <p className="text-white font-bold text-2xl mt-1">${nextTask.budget?.toLocaleString()}</p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <PlayCircle className="absolute top-5 right-5 w-5 h-5 text-white/30 pointer-events-none" />
              </>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1 text-center">
                <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400 group-hover:scale-110 duration-500">Tarea activa</span>
                <p className="text-secondary text-md font-medium mt-1 group-hover:scale-110 duration-500">Sin tareas activas</p>
                <span className="text-primary text-sm font-bold mt-0.5 cursor-pointer hover:underline underline-offset-2 transition-all group-hover:scale-110 duration-500">+ Publicar →</span>
              </div>
            )}
          </motion.button>
        </motion.div>

        {/* ── FILA INFERIOR: Historial (50%) + Mis Tareas (50%) ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.14 }}
          className="flex gap-5 shrink-0"
          style={{ flex: '4.5 1 0' }}
        >
          {/* Historial de tareas — 50% */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/fulltimer/task-history')}
            className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white rounded-[26px] transition-all group p-4 cursor-pointer"
          >
            <div className="w-15 h-15 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-120 transition-transform duration-500">
              <History className="w-9 h-9" />
            </div>
            <span className="font-bold text-xl text-center leading-tight px-1 transition-transform duration-500 group-hover:scale-110 inline-block">
              Historial de<br />tareas
            </span>
          </motion.button>

          {/* Mis tareas — 50% */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/fulltimer/my-tasks')}
            className="flex-1 flex flex-col items-center justify-center gap-4 bg-primary hover:bg-[#5c178e] text-white rounded-[26px] transition-all group p-4 cursor-pointer"
          >
            <div className="w-15 h-15 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-120 transition-transform duration-500">
              <ClipboardList className="w-9 h-9" />
            </div>
            <span className="font-bold text-xl text-center leading-tight px-1 transition-transform duration-500 group-hover:scale-110 inline-block">
              Mis<br />tareas
            </span>
          </motion.button>
        </motion.div>

      </div>

      {/* Columna lateral derecha — solo xl+ */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );

  return (
    <>
      {/* Mobile: visible solo en < md */}
      <div className="md:hidden">
        <MobileLayout />
      </div>
      {/* Desktop: visible solo en ≥ md */}
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </>
  );
}

// Botón de acción para mobile — sin sombra en hover, cursor pointer, padding generoso
function MobileActionBtn({ onClick, icon, label, color, delay }) {
  const bg = color === 'dark' ? 'bg-gray-900 hover:bg-black' : 'bg-primary hover:bg-[#5c178e]';
  const iconBg = color === 'dark' ? 'bg-white/10' : 'bg-white/20';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-6 ${bg} text-white rounded-[22px] transition-all group cursor-pointer`}
    >
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0`}>
        {icon}
      </div>
      <span className="font-bold text-base">{label}</span>
    </motion.button>
  );
}