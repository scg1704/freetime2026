import { Star, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

export default function ApplicantCard({ applicant, onAccept, onReject }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Header del postulante */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl overflow-hidden">
            <img
              src={`https://picsum.photos/seed/${applicant.id}/100`}
              alt={applicant.name}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h4 className="font-bold text-lg">{applicant.name} {applicant.lastName}</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold text-black">{applicant.rating?.toFixed(1)}</span>
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
          <div className="text-xl font-bold text-primary">
            ${applicant.offeredPrice?.toLocaleString()}
          </div>
          <div className="text-xs text-secondary font-medium">Oferta</div>
        </div>
      </div>

      {/* Habilidades */}
      {applicant.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {applicant.skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 text-secondary rounded-full text-xs font-bold">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-secondary font-medium">
        <span>{applicant.tasksCompleted ?? 0} tareas completadas</span>
        <span>•</span>
        <span>{applicant.city}</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onReject(applicant.id)}
          className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" /> Rechazar
        </button>
        <button
          onClick={() => onAccept(applicant.id)}
          className="flex-[2] py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <CheckCircle className="w-4 h-4" /> Aceptar Postulante
        </button>
      </div>
    </div>
  );
}