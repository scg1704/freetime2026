import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../shared/lib/utils';

export default function RoleCard({ selected, onClick, title, description }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-6 rounded-3xl border-2 text-left transition-all w-full',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-100 bg-white hover:border-gray-200'
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={cn('text-xl font-bold', selected ? 'text-primary' : 'text-black')}>
          {title}
        </h3>
        {selected && <CheckCircle2 className="w-6 h-6 text-primary" />}
      </div>
      <p className="text-secondary text-sm leading-relaxed">{description}</p>
    </button>
  );
}