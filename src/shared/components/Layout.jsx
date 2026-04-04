import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Crown, ArrowLeft, Home, List, CreditCard, User } from 'lucide-react';
import { cn } from '@/src/lib/utils.js';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = ['/', '/login', '/register', '/verification'].includes(
    location.pathname
  );

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-50">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex-1 flex justify-center">
          <span className="font-bold text-xl tracking-tighter text-primary">
            FREETIME
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-primary font-medium text-sm">
            <Crown className="w-5 h-5" />
            <span className="hidden sm:inline">Premium</span>
          </button>
          <button className="p-2">
            <MessageSquare className="w-6 h-6 text-black" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20">{children}</main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t flex items-center justify-around px-2 z-50">
        <NavLink
          to="/home"
          icon={<Home />}
          label="Home"
          active={location.pathname === '/home'}
        />
        <NavLink
          to="/tasks"
          icon={<List />}
          label="Tasks"
          active={location.pathname === '/tasks'}
        />
        <NavLink
          to="/payment"
          icon={<CreditCard />}
          label="Payment"
          active={location.pathname === '/payment'}
        />
        <NavLink
          to="/profile"
          icon={<User />}
          label="Profile"
          active={location.pathname === '/profile'}
        />
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
        active ? 'text-primary' : 'text-secondary'
      )}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="text-[10px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}