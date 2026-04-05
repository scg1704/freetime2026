import { MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskCard({ id, title, category, price, location, fulltimerName, applicants, time }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/freetimer/task/${id}`)}
      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {category}
          </span>
          <h3 className="text-2xl font-bold mt-2 tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-secondary font-medium mt-1">Por: {fulltimerName}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-black">{price}</div>
          <div className="text-[10px] font-bold text-secondary uppercase tracking-tighter">
            {time}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-4 text-secondary text-xs font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {applicants} postulantes
          </div>
        </div>
        <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary transition-colors">
          Postularse
        </button>
      </div>
    </div>
  );
}