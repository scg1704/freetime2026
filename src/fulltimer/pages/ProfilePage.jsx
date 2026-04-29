// source/fulltimer/pages/ProfilePage.jsx
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon, Shield, Settings, LogOut,
  Star, Award, Edit3, ClipboardList, History
} from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { useAuth } from '../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#7D27BE';

export default function FulltimerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  const rango =
    (user.tasksCompleted ?? 0) > 20 ? 'Experto' :
    (user.tasksCompleted ?? 0) > 5  ? 'Intermedio' : 'Nuevo';

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>

      {/* Columna izquierda */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      {/* Contenido central */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden lg:justify-center">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column' }}>
          <div className="px-5 py-6 max-w-4xl mx-auto space-y-8 my-auto w-full">

            {/* ── Header: Responsive ── */}
            <section className="flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-10">

              {/* Foto */}
              <div className="relative shrink-0 mb-6 md:mb-0">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-gray-200 overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={user.photoURL || `https://picsum.photos/seed/${user.id}/200`}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* ← Botón Edit3 conectado a /fulltimer/profile/edit */}
                <button
                  onClick={() => navigate('/fulltimer/profile/edit')}
                  className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>

              {/* Info y Stats */}
              <div className="flex flex-col items-center text-center space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#111827' }}>
                    {user.name} {user.lastName}
                  </h1>
                  <p className="text-base font-medium opacity-60" style={{ color: '#6b7280' }}>
                    FullTimer · {user.city}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-3">
                  <div className="flex gap-3">
                    <StatCard icon={<Star className="w-4 h-4" />}         value={(user.rating ?? 5).toFixed(1)} label="Rating" />
                    <StatCard icon={<ClipboardList className="w-4 h-4" />} value={user.tasksCompleted ?? 0}      label="Tareas"  />
                  </div>
                  <div className="flex md:w-full md:justify-center">
                    <StatCard icon={<Award className="w-4 h-4" />} value={rango} label="Rango" />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Subtítulo menú ── */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-center -mt-2" style={{ color: '#4b5563' }}>
              Mi cuenta
            </h2>

            {/* ── Botones ── */}
            <section className="space-y-3 -mt-4">

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                <DashboardBtn color="primary" icon={<UserIcon className="w-6 h-6" />}     label="Datos Personales" onClick={() => navigate('/fulltimer/profile/personal-data')} />
                <DashboardBtn color="primary" icon={<History className="w-6 h-6" />}      label="Historial de Tareas"       onClick={() => navigate('/fulltimer/task-history')} />
                <DashboardBtn color="gold"    icon={<Star className="w-6 h-6" />}         label="Calificaciones"   onClick={() => navigate('/fulltimer/profile/ratings')} />
                <DashboardBtn color="green"   icon={<Shield className="w-6 h-6" />}       label="Verificación"     onClick={() => navigate('/verification')} />
                <DashboardBtn color="gray"    icon={<Settings className="w-6 h-6" />}     label="Opciones"         onClick={() => navigate('/fulltimer/profile/settings')} />
                <DashboardBtn color="danger"  icon={<LogOut className="w-6 h-6" />}       label="Cerrar Sesión"    onClick={handleLogout} />
              </div>

              {/* Desktop */}
              <div className="hidden md:grid grid-cols-3 gap-4 items-stretch">
                <DashboardBtnDesktop color="primary" icon={<UserIcon className="w-9 h-9" />}       label="Datos Personales" onClick={() => navigate('/fulltimer/profile/personal-data')} />
                <DashboardBtnDesktop color="primary" icon={<History className="w-9 h-9" />}        label="Historial de Tareas"       onClick={() => navigate('/fulltimer/task-history')} />
                <DashboardBtnDesktop color="gold"    icon={<Star className="w-9 h-9" />}           label="Calificaciones"   onClick={() => navigate('/fulltimer/profile/ratings')} />
                <DashboardBtnDesktop color="green"   icon={<Shield className="w-9 h-9" />}         label="Verificación"     onClick={() => navigate('/verification')} />
                <DashboardBtnDesktop color="gray"    icon={<Settings className="w-9 h-9" />}       label="Opciones"         onClick={() => navigate('/fulltimer/profile/settings')} />
                <DashboardBtnDesktop color="danger"  icon={<LogOut className="w-9 h-9" />}         label="Cerrar Sesión"    onClick={handleLogout} />
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon, value, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-5 py-3 rounded-2xl flex flex-col items-center gap-1 cursor-default transition-all duration-200"
      style={{ background: hovered ? '#fff' : PRIMARY, border: `2px solid ${PRIMARY}`, color: hovered ? PRIMARY : '#fff' }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ color: hovered ? PRIMARY : '#fff' }}>{icon}</span>
        <span className="font-black text-base" style={{ color: hovered ? PRIMARY : '#fff' }}>{value}</span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: hovered ? `${PRIMARY}99` : 'rgba(255,255,255,0.7)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Color map ───────────────────────────────────────────────────────────────
const COLOR_MAP = {
  primary: { bg: 'bg-primary hover:bg-[#5c178e]',    iconBg: 'bg-white/20' },
  dark:    { bg: 'bg-gray-900 hover:bg-black',        iconBg: 'bg-white/10' },
  blue:    { bg: 'bg-blue-600 hover:bg-blue-700',     iconBg: 'bg-white/20' },
  green:   { bg: 'bg-green-600 hover:bg-green-700',   iconBg: 'bg-white/20' },
  gray:    { bg: 'bg-gray-600 hover:bg-gray-700',     iconBg: 'bg-white/20' },
  danger:  { bg: 'bg-red-500 hover:bg-red-600',       iconBg: 'bg-white/20' },
  gold:    { bg: 'bg-yellow-500 hover:bg-yellow-600', iconBg: 'bg-white/20' },
};

// ─── Botón mobile ─────────────────────────────────────────────────────────────
function DashboardBtn({ icon, label, sublabel, color = 'primary', onClick }) {
  const { bg, iconBg } = COLOR_MAP[color] || COLOR_MAP.primary;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-5 ${bg} text-white rounded-[22px] transition-all group cursor-pointer`}
    >
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0`}>
        {icon}
      </div>
      <div className="text-left">
        <span className="font-bold text-base block">{label}</span>
        {sublabel && <span className="text-xs font-semibold text-white/70">{sublabel}</span>}
      </div>
    </motion.button>
  );
}

// ─── Botón desktop ────────────────────────────────────────────────────────────
function DashboardBtnDesktop({ icon, label, sublabel, color = 'primary', onClick, fullWidth }) {
  const { bg, iconBg } = COLOR_MAP[color] || COLOR_MAP.primary;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        `flex flex-col items-center justify-center gap-3 py-4 px-8 ${bg} text-white rounded-[26px] transition-all group cursor-pointer`,
        fullWidth && 'col-span-3'
      )}
      style={{ minHeight: 110 }}
    >
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-center">
        <span className="font-bold text-base block group-hover:scale-105 transition-transform duration-300 inline-block leading-tight">
          {label}
        </span>
        {sublabel && <span className="text-[10px] font-semibold text-white/70 block mt-0.5">{sublabel}</span>}
      </div>
    </motion.button>
  );
}