// source/fulltimer/pages/MyTasksPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Users, Clock, MapPin, Calendar,
  ChevronRight, CheckCircle, XCircle, Star,
  ShieldCheck, Award, X,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { cn } from '../../shared/lib/utils';

const TABS = [
  { key: 'OPEN',    label: 'Sin postulante' },
  { key: 'PENDING', label: 'Con postulantes' },
];

export default function MyTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState('OPEN');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        // Solo tareas abiertas (sin freetimer aceptado todavía)
        const open = (data.tasks || []).filter(
          (t) => t.status === 'OPEN' || t.status === 'PENDING'
        );
        setTasks(open);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const filtered = tasks.filter((t) =>
    activeTab === 'OPEN'
      ? t.status === 'OPEN' && !(t.applicants > 0)
      : t.status === 'PENDING' || (t.status === 'OPEN' && t.applicants > 0)
  );

  if (selectedTask) {
    return (
      <TaskApplicantsView
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
        onAccepted={(taskId) => {
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
          setSelectedTask(null);
        }}
        userToken={user?.token}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Mis Tareas</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3 max-w-xl mx-auto">
          {TABS.map((tab) => {
            const count =
              tab.key === 'OPEN'
                ? tasks.filter((t) => t.status === 'OPEN' && !(t.applicants > 0)).length
                : tasks.filter((t) => t.status === 'PENDING' || (t.status === 'OPEN' && t.applicants > 0)).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all',
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-[10px] font-black px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="px-5 py-5 max-w-xl mx-auto space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-5 h-28 animate-pulse" />
          ))
        ) : apiError ? (
          <div className="text-center py-16 text-secondary">
            <p className="font-medium">No se pudo conectar con el servidor.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-secondary font-medium">
              {activeTab === 'OPEN'
                ? 'No tienes tareas abiertas sin postulantes.'
                : 'No tienes tareas con postulantes esperando.'}
            </p>
            <button
              onClick={() => navigate('/fulltimer/post-task')}
              className="text-primary font-bold text-sm hover:underline"
            >
              Publicar una tarea →
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                onClick={() => setSelectedTask(task)}
                className="bg-white border-2 border-gray-100 hover:border-primary/25 hover:shadow-md p-5 rounded-3xl cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-bold text-base truncate">{task.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-secondary font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {task.location}
                      </span>
                      {task.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Contador de postulantes */}
                    {(task.applicants ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <Users className="w-3.5 h-3.5" />
                        {task.applicants} postulante{task.applicants !== 1 ? 's' : ''} esperando
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-base font-bold text-primary">
                      ${task.budget?.toLocaleString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Vista de postulantes de una tarea ────────────────────────────────────────
function TaskApplicantsView({ task, onBack, onAccepted, userToken }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!task) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}/applicants`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const data = await res.json();
        if (res.ok) setApplicants(data.applicants || []);
      } catch {
        setError('No se pudo cargar los postulantes.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [task, userToken]);

  const handleAccept = async (applicantId) => {
    setActionLoading(applicantId);
    try {
      const res = await fetch(`/api/tasks/${task.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ applicantId }),
      });
      if (res.ok) onAccepted(task.id);
    } catch {
      setError('Error al aceptar el postulante.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (applicantId) => {
    setApplicants((prev) => prev.filter((a) => a.id !== applicantId));
  };

  if (selectedApplicant) {
    return (
      <ApplicantProfileView
        applicant={selectedApplicant}
        onBack={() => setSelectedApplicant(null)}
        onAccept={handleAccept}
        onReject={handleReject}
        actionLoading={actionLoading}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Postulantes</h1>
            <p className="text-secondary text-xs">{task.title}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-xl mx-auto space-y-4">
        {/* Info de tarea */}
        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 grid grid-cols-2 gap-2">
          {[
            { label: 'Presupuesto', value: `$${task.budget?.toLocaleString()}` },
            { label: 'Categoría',   value: task.category },
            { label: 'Ubicación',   value: task.location },
            { label: 'Nivel',       value: task.specializationLevel },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{label}</p>
              <p className="font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-6 h-32 animate-pulse" />
          ))
        ) : applicants.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Aún no hay postulantes.</p>
            <p className="text-xs mt-1 text-gray-400">Los FreeTimers comenzarán a postularse pronto.</p>
          </div>
        ) : (
          applicants.map((applicant, i) => (
            <motion.div
              key={applicant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border-2 border-gray-100 rounded-3xl p-5 space-y-4"
            >
              {/* Cabecera del postulante */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedApplicant(applicant)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
                    <img
                      src={`https://picsum.photos/seed/${applicant.id}/100`}
                      alt={applicant.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{applicant.name} {applicant.lastName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold text-gray-700">{applicant.rating?.toFixed(1)}</span>
                      </div>
                      {applicant.verified && (
                        <div className="flex items-center gap-1 text-green-500">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-xs font-bold">Verificado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    ${applicant.offeredPrice?.toLocaleString() || task.budget?.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-secondary uppercase font-bold">Oferta</p>
                </div>
              </div>

              {/* Skills */}
              {applicant.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.slice(0, 4).map((skill, j) => (
                    <span key={j} className="px-3 py-1 bg-gray-100 text-secondary rounded-full text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <p className="text-xs text-secondary">
                {applicant.tasksCompleted ?? 0} tareas completadas · {applicant.city}
              </p>

              {/* Acciones */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleReject(applicant.id)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
                <button
                  onClick={() => handleAccept(applicant.id)}
                  disabled={actionLoading === applicant.id}
                  className="flex-[2] py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {actionLoading === applicant.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Aceptar</>
                  )}
                </button>
              </div>

              {/* Ver perfil */}
              <button
                onClick={() => setSelectedApplicant(applicant)}
                className="w-full text-xs text-primary font-bold hover:underline flex items-center justify-center gap-1"
              >
                Ver perfil completo <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Perfil completo del postulante ───────────────────────────────────────────
function ApplicantProfileView({ applicant, onBack, onAccept, onReject, actionLoading }) {
  const [confirmReject, setConfirmReject] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Perfil del postulante</h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-xl mx-auto space-y-6">
        {/* Avatar y datos */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-24 h-24 rounded-[28px] bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
            <img
              src={`https://picsum.photos/seed/${applicant.id}/200`}
              alt={applicant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{applicant.name} {applicant.lastName}</h2>
            <p className="text-secondary text-sm">FreeTimer · {applicant.city}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <StatPill icon={<Star className="w-4 h-4 fill-current text-yellow-500" />} value={(applicant.rating ?? 5).toFixed(1)} label="Rating" />
            <StatPill icon={<Award className="w-4 h-4 text-primary" />} value={applicant.tasksCompleted ?? 0} label="Tareas" />
            {applicant.verified && (
              <StatPill icon={<ShieldCheck className="w-4 h-4 text-green-500" />} value="Sí" label="Verificado" />
            )}
          </div>
        </div>

        {/* Habilidades */}
        {applicant.skills?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Oferta */}
        <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Oferta del postulante</p>
            <p className="text-3xl font-bold text-primary mt-1">
              ${applicant.offeredPrice?.toLocaleString() || '—'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          {confirmReject ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 bg-red-50 rounded-3xl p-4 space-y-3 border border-red-100"
            >
              <p className="text-sm font-bold text-red-600 text-center">¿Rechazar este postulante?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReject(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { onReject(applicant.id); onBack(); }}
                  className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm"
                >
                  Sí, rechazar
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <button
                onClick={() => setConfirmReject(true)}
                className="flex-1 py-4 rounded-3xl bg-gray-100 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Rechazar
              </button>
              <button
                onClick={() => onAccept(applicant.id)}
                disabled={actionLoading === applicant.id}
                className="flex-[2] py-4 rounded-3xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === applicant.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Aceptar postulante</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <div className="bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-bold text-sm">{value}</span>
      </div>
      <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">{label}</span>
    </div>
  );
}