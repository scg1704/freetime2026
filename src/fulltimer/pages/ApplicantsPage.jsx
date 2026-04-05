import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import ApplicantCard from '../components/ApplicantCard';

export default function ApplicantsPage() {
  const { user } = useAuth();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId || !user) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const [taskRes, applicantsRes] = await Promise.all([
          fetch(`/api/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`/api/tasks/${taskId}/applicants`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const taskData = await taskRes.json();
        const applicantsData = await applicantsRes.json();

        if (taskRes.ok) setTask(taskData.task);
        if (applicantsRes.ok) setApplicants(applicantsData.applicants || []);
      } catch {
        setError('No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, user]);

  const handleAccept = async (applicantId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ applicantId }),
      });

      if (res.ok) {
        navigate('/fulltimer/home');
      }
    } catch {
      setError('Error al aceptar el postulante.');
    }
  };

  const handleReject = async (applicantId) => {
    setApplicants((prev) => prev.filter((a) => a.id !== applicantId));
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <p className="text-secondary">Debes iniciar sesión.</p>
      <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-full font-bold">Iniciar Sesión</button>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Postulantes</h1>
          {task && <p className="text-secondary text-sm">{task.title}</p>}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      {/* Info de la tarea */}
      {task && (
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-500">Presupuesto</span>
            <span className="font-bold text-primary">${task.budget?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-500">Categoría</span>
            <span className="font-bold">{task.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-500">Nivel</span>
            <span className="font-bold">{task.specializationLevel}</span>
          </div>
        </div>
      )}

      {/* Lista de postulantes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {applicants.length} Postulante{applicants.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {applicants.length > 0 ? (
          applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="text-center py-12 space-y-2">
            <p className="text-secondary font-medium">Aún no hay postulantes.</p>
            <p className="text-xs text-gray-400">Los FreeTimers comenzarán a postularse pronto.</p>
          </div>
        )}
      </div>
    </div>
  );
}