// source/fulltimer/pages/MyTasksPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Calendar, Clock, Tag, Users, Star,
  ShieldCheck, Check, X, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import Tab from '../../shared/components/ui/Tab';
import { MOCK_TASKS, MOCK_APPLICANTS } from '../../shared/lib/mockTasks';
import { backHandlers } from '../../shared/components/Layout';

const PRIMARY = '#7D27BE';

const TABS = [
  { key: 'OPEN',     label: 'Sin postulante'           },
  { key: 'PENDING',  label: 'Con postulantes'          },
  { key: 'SELECTED', label: 'Postulante seleccionado'  },
];

export default function MyTasksPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [activeTab, setActiveTab] = useState('PENDING');
  const [tasks,     setTasks]     = useState(MOCK_TASKS);
  const [selected,  setSelected]  = useState(null);

  // Abrir tarea si venimos desde el perfil del freetimer
  useEffect(() => {
    if (location.state?.openTask) {
      setSelected(location.state.openTask);
      // Limpiar el state de la URL para que futuros renders no lo reprocesen
      window.history.replaceState({}, document.title);
    }
  }, []); // Solo al montar — el state viene en el primer render

  // Registrar/limpiar el handler de retroceso según si hay tarea abierta
  useEffect(() => {
    if (selected) {
      // Hay detalle abierto: la flecha del Layout debe cerrarlo
      backHandlers.current = () => setSelected(null);
    } else {
      // No hay detalle: la flecha del Layout debe navegar normalmente (navigate(-1))
      backHandlers.current = null;
    }
    // Limpieza al desmontar la página completa
    return () => { backHandlers.current = null; };
  }, [selected]);

  const getCount = (key) => {
    if (key === 'OPEN')     return tasks.filter(t => !t.selectedApplicantId && t.applicants === 0).length;
    if (key === 'PENDING')  return tasks.filter(t => !t.selectedApplicantId && t.applicants > 0).length;
    if (key === 'SELECTED') return tasks.filter(t => t.selectedApplicantId).length;
    return 0;
  };

  const filtered = tasks.filter(t => {
    if (activeTab === 'OPEN')     return !t.selectedApplicantId && t.applicants === 0;
    if (activeTab === 'PENDING')  return !t.selectedApplicantId && t.applicants > 0;
    if (activeTab === 'SELECTED') return t.selectedApplicantId;
    return false;
  });

  // Vista de detalle de tarea
  if (selected) {
    return (
      <TaskDetailPage
        task={selected}
        onBack={() => setSelected(null)}
        onAccept={(taskId, applicantId) => {
          setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, selectedApplicantId: applicantId } : t
          ));
          setSelected(null);
          setActiveTab('SELECTED');
        }}
        onRejectApplicant={(taskId, applicantId) => {
          setTasks(prev => prev.map(t =>
            t.id === taskId
              ? { ...t, applicantsList: t.applicantsList.filter(a => a.id !== applicantId), applicants: t.applicants - 1 }
              : t
          ));
          setSelected(prev => ({
            ...prev,
            applicantsList: prev.applicantsList.filter(a => a.id !== applicantId),
            applicants: prev.applicants - 1,
          }));
        }}
      />
    );
  }

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>Mis Tareas</h1>
          </div>
          <div className="mt-3 max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
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

        {/* Lista */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="font-medium" style={{ color: '#6b7280' }}>
                  {activeTab === 'OPEN'     && 'No tienes tareas sin postulantes.'}
                  {activeTab === 'PENDING'  && 'No tienes tareas con postulantes pendientes.'}
                  {activeTab === 'SELECTED' && 'Aún no has seleccionado a ningún postulante.'}
                </p>
                <button onClick={() => navigate('/fulltimer/post-task')} className="text-primary font-bold text-sm hover:underline">
                  Publicar una tarea →
                </button>
              </div>
            ) : (
              filtered.map((task, i) => (
                <TaskCard key={task.id} task={task} index={i} onClick={() => setSelected(task)} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Tarjeta de tarea ─────────────────────────────────────────────────────────
function TaskCard({ task, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isSelected = !!task.selectedApplicantId;

  const cardStyle = hovered
    ? { borderColor: `${PRIMARY}40`, background: `${PRIMARY}08` }
    : { borderColor: isSelected ? '#bbf7d0' : '#f3f4f6', background: isSelected ? '#f0fdf4' : '#fff' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="rounded-3xl border-2 overflow-hidden cursor-pointer transition-all duration-200"
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#f3e8ff' }}>
            <Tag className="w-5 h-5" style={{ color: PRIMARY }} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate" style={{ color: '#111827' }}>{task.title}</h4>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {task.location} · {new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </p>
            {task.applicants > 0 && (
              <p className="text-xs font-bold mt-0.5" style={{ color: PRIMARY }}>
                {task.applicants} postulante{task.applicants !== 1 ? 's' : ''} esperando
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right">
            <div className="font-bold text-sm" style={{ color: PRIMARY }}>${task.budget?.toLocaleString('es-CO')}</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: '#9ca3af' }}>Presupuesto</div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: hovered ? PRIMARY : '#d1d5db' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Página de detalle de tarea ───────────────────────────────────────────────
function TaskDetailPage({ task, onBack, onAccept, onRejectApplicant }) {
  const navigate = useNavigate();
  const [applicants,    setApplicants]    = useState(task.applicantsList || MOCK_APPLICANTS);
  const [actionLoading, setActionLoading] = useState(null);
  const [accepted,      setAccepted]      = useState(false);

  const handleAccept = async (applicantId) => {
    setActionLoading(applicantId);
    await new Promise(r => setTimeout(r, 800));
    setAccepted(applicantId);
    setActionLoading(null);
    setTimeout(() => onAccept(task.id, applicantId), 600);
  };

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-6">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>{task.title}</h1>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{task.category}</p>
            </div>

            {/* Info */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>Detalles</h2>
              <div className="grid grid-cols-2 gap-3">
                <InfoChip icon={<MapPin   className="w-3.5 h-3.5" />} label="Ubicación" value={task.location} />
                <InfoChip icon={<Calendar className="w-3.5 h-3.5" />} label="Fecha"     value={new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoChip icon={<Tag      className="w-3.5 h-3.5" />} label="Categoría" value={task.category} />
                <InfoChip icon={<Clock    className="w-3.5 h-3.5" />} label="Nivel"     value={task.specializationLevel} />
              </div>
              <div className="rounded-2xl p-4" style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PRIMARY }}>Presupuesto</p>
                <p className="text-2xl font-black" style={{ color: '#111827' }}>${task.budget?.toLocaleString('es-CO')}</p>
              </div>
            </section>

            {/* Descripción */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>Descripción</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{task.description}</p>
            </section>

            {/* Mapa */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>Dirección</h2>
              <div className="rounded-3xl overflow-hidden border-2 border-gray-100" style={{ height: 180 }}>
                <iframe
                  title="Ubicación de la tarea"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${task.lng - 0.005},${task.lat - 0.005},${task.lng + 0.005},${task.lat + 0.005}&layer=mapnik&marker=${task.lat},${task.lng}`}
                />
              </div>
              <p className="text-xs text-center font-medium" style={{ color: '#6b7280' }}>📍 {task.address}</p>
            </section>

            {/* Postulantes */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                {task.selectedApplicantId ? 'Freetimer Seleccionado' : `Postulantes (${applicants.length})`}
              </h2>

              {task.selectedApplicantId ? (
                applicants
                  .filter(a => a.id === task.selectedApplicantId)
                  .map(applicant => (
                    <ApplicantCard
                      key={applicant.id}
                      applicant={applicant}
                      accepted={true}
                      onViewProfile={() => navigate('/fulltimer/freetimer-profile', {
                        state: { applicant, fromTask: task },
                      })}
                    />
                  ))
              ) : (
                applicants.map((applicant, i) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    index={i}
                    loading={actionLoading === applicant.id}
                    accepted={accepted === applicant.id}
                    onAccept={() => handleAccept(applicant.id)}
                    onReject={() => {
                      setApplicants(prev => prev.filter(a => a.id !== applicant.id));
                      onRejectApplicant(task.id, applicant.id);
                    }}
                    onViewProfile={() => navigate('/fulltimer/freetimer-profile', {
                      state: { applicant, fromTask: task },
                    })}
                  />
                ))
              )}
            </section>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Tarjeta de postulante ────────────────────────────────────────────────────
function ApplicantCard({ applicant, index, loading, accepted, onAccept, onReject, onViewProfile }) {
  const [confirmReject, setConfirmReject] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: (index ?? 0) * 0.05 }}
      className="rounded-3xl border-2 p-5 space-y-4"
      style={{ borderColor: accepted ? '#bbf7d0' : '#f3f4f6', background: accepted ? '#f0fdf4' : '#fff' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
          <img src={`https://picsum.photos/seed/${applicant.id}/100`} alt={applicant.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={onViewProfile}
            className="text-sm font-bold text-left cursor-pointer hover:underline block truncate"
            style={{ color: PRIMARY }}
          >
            {applicant.name} {applicant.lastName}
          </button>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold" style={{ color: '#111827' }}>{applicant.rating?.toFixed(1)}</span>
            </div>
            {applicant.verified && (
              <div className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                <ShieldCheck className="w-3 h-3" />
                <span className="text-xs font-bold">Verificado</span>
              </div>
            )}
            <span className="text-xs" style={{ color: '#9ca3af' }}>{applicant.tasksCompleted} tareas</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-black text-lg" style={{ color: PRIMARY }}>${applicant.offeredPrice?.toLocaleString('es-CO')}</div>
          <div className="text-[10px] font-bold uppercase" style={{ color: '#9ca3af' }}>Oferta</div>
        </div>
      </div>

      {applicant.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {applicant.skills.map((s, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#f3e8ff', color: PRIMARY }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmReject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-3 space-y-2 overflow-hidden"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <p className="text-xs font-bold text-center" style={{ color: '#dc2626' }}>¿Rechazar a {applicant.name}?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReject(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border-2 border-gray-200 cursor-pointer" style={{ color: '#6b7280' }}>
                Cancelar
              </button>
              <button onClick={onReject} className="flex-1 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: '#ef4444' }}>
                Sí, rechazar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!accepted && !confirmReject && (
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmReject(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-colors"
            style={{ background: '#fef2f2', color: '#ef4444' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
          >
            <X className="w-4 h-4" /> Rechazar
          </button>
          <button
            onClick={onAccept}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold text-white cursor-pointer transition-colors"
            style={{ background: PRIMARY, cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6a1fa3'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PRIMARY; }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check className="w-4 h-4" /> Aceptar</>
            }
          </button>
        </div>
      )}

      {accepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl"
          style={{ background: '#f0fdf4' }}
        >
          <Check className="w-4 h-4" style={{ color: '#16a34a' }} />
          <span className="text-sm font-bold" style={{ color: '#16a34a' }}>¡Postulante aceptado!</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function InfoChip({ icon, label, value }) {
  return (
    <div className="rounded-2xl p-3 space-y-1" style={{ background: '#fafafa', border: '1px solid #f3f4f6' }}>
      <div className="flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-semibold" style={{ color: '#4b5563' }}>{value}</p>
    </div>
  );
}