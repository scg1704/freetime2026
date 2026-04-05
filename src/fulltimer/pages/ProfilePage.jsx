import { User as UserIcon, Shield, Settings, LogOut, Star, Award, ChevronRight, Edit3, ClipboardList } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { useAuth } from '../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FulltimerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="px-6 py-8 space-y-10">
      {/* Header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-[40px] bg-gray-200 overflow-hidden border-4 border-white shadow-xl">
            <img
              src={user.photoURL || `https://picsum.photos/seed/${user.id}/200`}
              alt="Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.name} {user.lastName}
          </h1>
          <p className="text-secondary font-medium">FullTimer • {user.city}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1 text-yellow-500 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-black">{(user.rating ?? 5).toFixed(1)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">Rating</span>
          </div>
          <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1 text-primary mb-1">
              <ClipboardList className="w-4 h-4" />
              <span className="font-bold text-black">{user.tasksCompleted ?? 0}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">Tareas</span>
          </div>
          <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1 text-primary mb-1">
              <Award className="w-4 h-4" />
              <span className="font-bold text-black">
                {(user.tasksCompleted ?? 0) > 20 ? 'Experto' : (user.tasksCompleted ?? 0) > 5 ? 'Intermedio' : 'Nuevo'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">Rango</span>
          </div>
        </div>
      </section>

      {/* Menú */}
      <section className="space-y-2">
        <MenuButton icon={<UserIcon className="text-blue-500" />} label="Datos Personales" />
        <MenuButton
          icon={<ClipboardList className="text-primary" />}
          label="Mis Tareas"
          onClick={() => navigate('/fulltimer/my-tasks')}
        />
        <MenuButton icon={<Shield className="text-green-500" />} label="Verificación" sublabel="Completada" />
        <MenuButton icon={<Settings className="text-gray-500" />} label="Opciones" />
        <MenuButton icon={<LogOut className="text-red-500" />} label="Cerrar Sesión" danger onClick={handleLogout} />
      </section>
    </div>
  );
}

function MenuButton({ icon, label, sublabel, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-5 rounded-3xl flex items-center justify-between group transition-all',
        danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">{icon}</div>
        <div className="text-left">
          <h4 className={cn('font-bold', danger && 'text-red-600')}>{label}</h4>
          {sublabel && <p className="text-xs text-green-600 font-bold">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight className={cn('w-5 h-5 transition-transform group-hover:translate-x-1', danger ? 'text-red-300' : 'text-gray-300')} />
    </button>
  );
}