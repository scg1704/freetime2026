// source/shared/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion }                          from 'motion/react';
import { MessageSquare, Crown, ArrowLeft, Home, List, CreditCard, User } from 'lucide-react';
import { cn }      from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const AUTH_PAGES = ['/', '/login', '/register', '/verification', '/verify-email'];

const MAIN_PAGES = [
  '/freetimer/home', '/freetimer/tasks', '/freetimer/payment', '/freetimer/profile',
  '/fulltimer/home', '/fulltimer/my-tasks', '/fulltimer/payment', '/fulltimer/profile',
];

// Halo de texto blanco — igual al de "FREETIME"
const WHITE_GLOW = '0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.25)';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const isAuthPage = AUTH_PAGES.includes(location.pathname);
  if (isAuthPage) return <>{children}</>;

  const isMainPage = MAIN_PAGES.includes(location.pathname);
  const prefix     = user?.role === 'FREETIMER' ? '/freetimer' : '/fulltimer';
  const homeRoute  = `${prefix}/home`;

  const navLinks = [
    { to: `${prefix}/home`,
      icon: <Home />, label: 'Inicio' },
    { to: user?.role === 'FREETIMER' ? '/freetimer/tasks' : '/fulltimer/my-tasks',
      icon: <List />, label: 'Tareas' },
    { to: `${prefix}/payment`,
      icon: <CreditCard />, label: 'Pagos' },
    { to: `${prefix}/profile`,
      icon: <User />, label: 'Perfil' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Top Navbar ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center px-4 z-50">

        {/* Botón volver — solo en páginas secundarias */}
        <div className="w-10">
          {!isMainPage && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="p-2 transition-transform hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* FREETIME — centro, clickeable, con halo blanco */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <Link
            to={homeRoute}
            className="select-none pointer-events-auto"
            style={{
              fontWeight:    800,
              fontSize:      '2rem',
              letterSpacing: '-0.02em',
              color:         '#fff',
              textShadow:    WHITE_GLOW,
              lineHeight:    1,
            }}
          >
            FREETIME
          </Link>
        </div>

        {/* Botones derecha — hover: escala + halo blanco en el texto/ícono */}
        <div className="ml-auto flex items-center gap-3 z-10">

          {/* Premium */}
          <TopBarButton>
            <Crown className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Premium</span>
          </TopBarButton>

          {/* Chat — sin halo circular, solo escala + glow igual que Premium */}
          <TopBarButton>
            <MessageSquare className="w-6 h-6" />
          </TopBarButton>

        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 pt-16 pb-20">
        {children}
      </main>

      {/* ── Bottom Navbar ───────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-primary flex items-center justify-around px-2 z-50">
        {navLinks.map((link) => (
          <NavItem
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={location.pathname === link.to}
          />
        ))}
      </nav>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TopBarButton
// Hover: escala 1.15 + halo blanco (text-shadow) sobre el contenido.
// Sin ningún fondo ni círculo.
// ─────────────────────────────────────────────────────────────────────────────
function TopBarButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={hovered ? { scale: 1.15 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex items-center gap-1 text-white p-1"
      style={{ filter: hovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : 'none',
               transition: 'filter 0.18s' }}
    >
      {children}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NavItem
// Activo: círculo blanco sólido + ícono y letra morados (comportamiento original).
// Hover (inactivo): escala 1.12 + glow blanco tipo text-shadow. Sin halo circular.
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, active }) {
  const [hovered, setHovered] = useState(false);
  const showGlow = hovered && !active;

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-1 w-16"
    >
      {/* Contenedor del ícono */}
      <motion.div
        animate={
          active
            ? { scale: 1.15, y: -2 }                  // activo: escala suave
            : hovered
              ? { scale: 1.12, y: 0 }                 // hover inactivo: escala + glow
              : { scale: 1,    y: 0 }
        }
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200',
          active ? 'bg-white' : 'bg-transparent'       // ← círculo blanco solo si activo
        )}
        style={{
          filter: showGlow ? 'drop-shadow(0 0 7px rgba(255,255,255,0.75))' : 'none',
          transition: 'filter 0.18s',
        }}
      >
        {React.cloneElement(icon, {
          className: cn(
            'w-5 h-5 transition-colors duration-200',
            active ? 'text-primary' : 'text-white'     // ← morado dentro del círculo
          ),
          strokeWidth: active ? 2.5 : 1.8,
        })}
      </motion.div>

      {/* Label */}
      <motion.span
        animate={active ? { opacity: 1 } : { opacity: hovered ? 1 : 0.65 }}
        transition={{ duration: 0.18 }}
        style={{
          filter: showGlow ? 'drop-shadow(0 0 5px rgba(255,255,255,0.7))' : 'none',
          transition: 'filter 0.18s',
        }}
        className={cn(
          'text-[10px] uppercase tracking-wider',
          active ? 'text-white font-bold' : 'text-white font-medium'
        )}
      >
        {label}
      </motion.span>
    </Link>
  );
}