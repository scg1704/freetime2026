// source/fulltimer/pages/FreetimeProfileViewPage.jsx
// Perfil de un FreeTimer visto por un FullTimer — solo lectura, sin botones de acción
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Award, ShieldCheck, ClipboardList } from 'lucide-react';
import { useState } from 'react';

const PRIMARY = '#7D27BE';

export default function FreetimeProfileViewPage() {
  const { state }  = useLocation();   // recibe { applicant } via navigate(path, { state })
  const navigate   = useNavigate();
  const applicant  = state?.applicant;

  if (!applicant) {
    navigate(-1);
    return null;
  }

  const rango =
    (applicant.tasksCompleted ?? 0) > 20 ? 'Experto' :
    (applicant.tasksCompleted ?? 0) > 5  ? 'Intermedio' : 'Nuevo';

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-8">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Perfil FreeTimer
              </h1>
            </div>

            {/* Avatar + nombre */}
            <section className="flex flex-col items-center text-center space-y-4">
              <div className="w-28 h-28 rounded-[36px] bg-gray-200 overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={`https://picsum.photos/seed/${applicant.id}/200`}
                  alt={applicant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                  {applicant.name} {applicant.lastName}
                </h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#6b7280' }}>
                  FreeTimer · {applicant.city}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <StatCard icon={<Star className="w-4 h-4" />}          value={(applicant.rating ?? 5).toFixed(1)} label="Rating" />
                <StatCard icon={<ClipboardList className="w-4 h-4" />} value={applicant.tasksCompleted ?? 0}      label="Tareas"  />
                <StatCard icon={<Award className="w-4 h-4" />}         value={rango}                              label="Rango"   />
              </div>
            </section>

            {/* Verificación */}
            {applicant.verified && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: '#16a34a' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#15803d' }}>Identidad verificada</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Este FreeTimer completó la verificación biométrica.</p>
                </div>
              </div>
            )}

            {/* Bio */}
            {applicant.bio && (
              <section className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                  Sobre mí
                </h3>
                <p className="text-sm leading-relaxed text-center" style={{ color: '#6b7280' }}>
                  {applicant.bio}
                </p>
              </section>
            )}

            {/* Habilidades */}
            {applicant.skills?.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                  Habilidades
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {applicant.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-2xl text-sm font-bold"
                      style={{ background: '#f3e8ff', color: PRIMARY }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Oferta */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                Oferta
              </h3>
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}
              >
                <p className="text-3xl font-black" style={{ color: PRIMARY }}>
                  ${applicant.offeredPrice?.toLocaleString('es-CO') || '—'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Precio ofrecido por esta tarea</p>
              </div>
            </section>

            <div className="pb-4" />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

function StatCard({ icon, value, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-5 py-3 rounded-2xl flex flex-col items-center gap-1 cursor-default transition-all duration-200"
      style={{ background: hovered ? '#fff' : PRIMARY, border: `2px solid ${PRIMARY}` }}
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