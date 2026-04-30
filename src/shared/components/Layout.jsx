// source/shared/components/Layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence }          from 'motion/react';
import {
  MessageSquare, Crown, ArrowLeft, Home, List,
  CreditCard, User, Bell, X, Check, Zap, Shield,
  Star, TrendingUp,
} from 'lucide-react';
import { cn }      from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const PRIMARY     = '#7D27BE';
const AUTH_PAGES  = ['/', '/login', '/register', '/verification', '/verify-email'];

// Páginas raíz donde se oculta la flecha de atrás
const NO_BACK_PAGES = [
  '/freetimer/home', '/freetimer/tasks', '/freetimer/payment', '/freetimer/profile',
  '/fulltimer/home', '/fulltimer/payment', '/fulltimer/profile',
];

const WHITE_GLOW  = '0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.25)';

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: 'Jose Pelaez ha aplicado a su tarea',        time: 'Hace 2 min',  read: false },
  { id: 2, text: 'María González completó su tarea',          time: 'Hace 1 hora', read: false },
  { id: 3, text: 'Tu tarea "Limpieza" tiene 3 postulantes',   time: 'Hace 3 horas', read: true },
  { id: 4, text: 'Pago liberado: Reparación de Grifo',        time: 'Ayer',         read: true },
];

const PREMIUM_PERKS = [
  { icon: <Zap className="w-5 h-5" />,        title: 'Prioridad en resultados',  desc: 'Tus tareas aparecen primero para los FreeTimers.'         },
  { icon: <Shield className="w-5 h-5" />,     title: 'Verificación prioritaria', desc: 'Proceso de verificación acelerado y soporte dedicado.'    },
  { icon: <Star className="w-5 h-5" />,       title: 'Sin comisiones extra',      desc: 'Paga solo el valor de la tarea, sin cargos adicionales.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Estadísticas avanzadas',   desc: 'Accede a reportes detallados de tus tareas y gastos.'    },
  { icon: <Crown className="w-5 h-5" />,      title: 'Badge Premium',             desc: 'Insignia exclusiva visible en tu perfil.'                },
];

/**
 * Registro global de callbacks de retroceso.
 * Las páginas con navegación interna (ej: detalle de tarea abierto)
 * registran aquí su handler para que la flecha del Layout lo ejecute
 * en lugar de llamar a navigate(-1).
 */
export const backHandlers = { current: null };

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function Layout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [showNotif,   setShowNotif]   = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [notifs,      setNotifs]      = useState(SAMPLE_NOTIFICATIONS);

  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setShowNotif(false));

  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const isAuthPage = AUTH_PAGES.includes(location.pathname);
  if (isAuthPage) return <>{children}</>;

  const isNoBackPage  = NO_BACK_PAGES.includes(location.pathname);
  const prefix        = user?.role === 'FREETIMER' ? '/freetimer' : '/fulltimer';
  const homeRoute     = `${prefix}/home`;
  const messagesRoute = user?.role === 'FULLTIMER' ? '/fulltimer/messages' : null;

  const navLinks = user?.role === 'FREETIMER'
    ? [
        { to: '/freetimer/home',    icon: <Home />,       label: 'Inicio' },
        { to: '/freetimer/tasks',   icon: <List />,       label: 'Tareas' },
        { to: '/freetimer/payment', icon: <CreditCard />, label: 'Pagos'  },
        { to: '/freetimer/profile', icon: <User />,       label: 'Perfil' },
      ]
    : [
        { to: '/fulltimer/home',    icon: <Home />,       label: 'Inicio' },
        { to: '/fulltimer/payment', icon: <CreditCard />, label: 'Pagos'  },
        { to: '/fulltimer/profile', icon: <User />,       label: 'Perfil' },
      ];

  const handleBack = () => {
    // 1. La página registró un handler interno (ej: cerrar detalle de tarea)
    if (backHandlers.current) {
      backHandlers.current();
      return;
    }

    // 2. Volver desde perfil de freetimer → reabrir la tarea en MyTasks
    if (location.pathname.includes('freetimer-profile')) {
      navigate('/fulltimer/my-tasks', {
        state:   { openTask: location.state?.fromTask },
        replace: true,
      });
      return;
    }

    // 3. Páginas que pueden llegar con un historial contaminado por replace:true
    //    (ej: my-tasks tras volver del perfil). Navegamos al home explícitamente
    //    para evitar la entrada "fantasma" que deja el replace en el historial.
    const EXPLICIT_HOME_PAGES = ['/fulltimer/my-tasks', '/freetimer/my-tasks'];
    if (EXPLICIT_HOME_PAGES.includes(location.pathname)) {
      navigate(homeRoute, { replace: true });
      return;
    }

    // 4. Caso general
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center px-4 z-50">

        <div className="w-10">
          {!isNoBackPage && (
            <TopBarButton onClick={handleBack}>
              <ArrowLeft className="w-6 h-6 text-white cursor-pointer" />
            </TopBarButton>
          )}
        </div>

        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <Link
            to={homeRoute}
            className="select-none pointer-events-auto"
            style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', color: '#fff', textShadow: WHITE_GLOW, lineHeight: 1 }}
          >
            FREETIME
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 z-10">

          <TopBarButton onClick={() => setShowPremium(true)}>
            <Crown className="w-5 h-5 cursor-pointer" />
            <span className="hidden sm:inline text-sm font-medium cursor-pointer">Premium</span>
          </TopBarButton>

          <div ref={notifRef} className="relative">
            <TopBarButton onClick={() => { setShowNotif(v => !v); if (!showNotif) markAllRead(); }}>
              <div className="relative">
                <Bell className="w-6 h-6 cursor-pointer" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {unread}
                  </span>
                )}
              </div>
            </TopBarButton>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0,  scale: 1     }}
                  exit={{    opacity: 0, y: -8, scale: 0.96  }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl overflow-hidden z-50"
                  style={{ border: '1px solid #f3f4f6' }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <span className="font-bold text-sm" style={{ color: '#111827' }}>Notificaciones</span>
                    <button onClick={markAllRead} className="text-[10px] font-bold cursor-pointer hover:underline" style={{ color: PRIMARY }}>
                      Marcar todas como leídas
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {notifs.map((n, i) => (
                      <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderBottom: i < notifs.length - 1 ? '1px solid #f9fafb' : undefined }}>
                        <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: n.read ? 'transparent' : PRIMARY }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-snug" style={{ color: '#111827' }}>{n.text}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-50">
                    <button className="w-full text-xs font-bold text-center cursor-pointer hover:underline" style={{ color: PRIMARY }}>
                      Ver todas las notificaciones
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <TopBarButton onClick={messagesRoute ? () => navigate(messagesRoute) : undefined}>
            <MessageSquare className="w-6 h-6 cursor-pointer" />
          </TopBarButton>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pt-16 pb-20">
        {children}
      </main>

      {/* ── Bottom Navbar ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-primary flex items-center justify-around px-2 z-50">
        {navLinks.map((link) => (
          <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} active={location.pathname === link.to} />
        ))}
      </nav>

      {/* ── Modal Premium ── */}
      <AnimatePresence>
        {showPremium && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPremium(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm mx-4 bg-white rounded-[32px] overflow-hidden shadow-2xl"
              style={{ maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="relative px-6 pt-8 pb-6 text-center" style={{ background: `linear-gradient(140deg, ${PRIMARY} 0%, #5c178e 100%)` }}>
                <button onClick={() => setShowPremium(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-7 h-7 text-yellow-300" />
                </div>
                <h2 className="text-xl font-black text-white">FreeTime Premium</h2>
                <p className="text-white/70 text-xs mt-1 font-medium">Desbloquea todas las ventajas por</p>
                <div className="mt-2 flex items-end justify-center gap-1">
                  <span className="text-3xl font-black text-white">$19.900</span>
                  <span className="text-white/60 text-sm mb-1">/mes</span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3 overflow-y-auto" style={{ maxHeight: '40vh', scrollbarWidth: 'none' }}>
                {PREMIUM_PERKS.map((perk) => (
                  <div key={perk.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#f3e8ff', color: PRIMARY }}>
                      {perk.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#111827' }}>{perk.title}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{perk.desc}</p>
                    </div>
                    <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: '#16a34a' }} />
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6 pt-2 space-y-2">
                <button
                  className="w-full py-4 rounded-2xl font-black text-base text-white cursor-pointer transition-colors"
                  style={{ background: PRIMARY }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#6a1fa3')}
                  onMouseLeave={e => (e.currentTarget.style.background = PRIMARY)}
                >
                  Comprar Premium
                </button>
                <button onClick={() => setShowPremium(false)} className="w-full py-2 text-xs font-semibold cursor-pointer hover:underline" style={{ color: '#9ca3af' }}>
                  Quizás más tarde
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function TopBarButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      role="button" tabIndex={onClick ? 0 : undefined} onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      animate={hovered ? { scale: 1.15 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex items-center gap-1 text-white p-1"
      style={{ filter: hovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : 'none', transition: 'filter 0.18s', cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
}

function NavItem({ to, icon, label, active }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={to} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="flex flex-col items-center justify-center gap-1 w-16">
      <motion.div
        animate={active ? { scale: 1.15, y: -2 } : hovered ? { scale: 1.12, y: 0 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className={cn('w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200', active ? 'bg-white' : 'bg-transparent')}
        style={{ filter: hovered && !active ? 'drop-shadow(0 0 7px rgba(255,255,255,0.75))' : 'none', transition: 'filter 0.18s' }}
      >
        {React.cloneElement(icon, { className: cn('w-5 h-5 transition-colors duration-200', active ? 'text-primary' : 'text-white') })}
      </motion.div>
      <span className={cn('text-[10px] font-bold uppercase tracking-wider transition-colors duration-200', active ? 'text-white' : 'text-white/60')}>
        {label}
      </span>
    </Link>
  );
}