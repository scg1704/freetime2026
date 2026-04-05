import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Crown, ArrowLeft, Home, List, CreditCard, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const AUTH_PAGES = ['/', '/login', '/register', '/verification'];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthPage = AUTH_PAGES.includes(location.pathname);
  if (isAuthPage) return <>{children}</>;

  const prefix = user?.role === 'FREETIMER' ? '/freetimer' : '/fulltimer';

  const navLinks = [
    {
      to: `${prefix}/home`,
      icon: <Home />,
      label: 'Home',
    },
    {
      to: user?.role === 'FREETIMER' ? '/freetimer/tasks' : '/fulltimer/my-tasks',
      icon: <List />,
      label: 'Tasks',
    },
    {
      to: `${prefix}/payment`,
      icon: <CreditCard />,
      label: 'Pagos',
    },
    {
      to: `${prefix}/profile`,
      icon: <User />,
      label: 'Perfil',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center px-4 z-50">

        {/* Botón volver — izquierda */}
        <div className="w-10">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Logo — centro absoluto */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <span className="font-bold text-xl tracking-tighter text-white">
            FREETIME
          </span>
        </div>

        {/* Botones derecha */}
        <div className="ml-auto flex items-center gap-3 z-10">
          <button className="flex items-center gap-1 text-white font-medium text-sm">
            <Crown className="w-5 h-5" />
            <span className="hidden sm:inline">Premium</span>
          </button>
          <button className="p-2">
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* ── Main Content — scroll libre, barra oculta ── */}
      <main className="flex-1 pt-16 pb-20">
        {children}
      </main>

      {/* ── Bottom Navigation Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-primary flex items-center justify-around px-2 z-50">
        {navLinks.map((link) => (
          <NavLink
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

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 w-16 transition-all"
    >
      <div
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-full transition-all',
          active ? 'bg-white' : 'bg-transparent'
        )}
      >
        {React.cloneElement(icon, {
          className: cn('w-5 h-5', active ? 'text-primary' : 'text-white'),
        })}
      </div>
      <span
        className={cn(
          'text-[10px] font-medium uppercase tracking-wider',
          active ? 'text-white font-bold' : 'text-white/70'
        )}
      >
        {label}
      </span>
    </Link>
  );
}