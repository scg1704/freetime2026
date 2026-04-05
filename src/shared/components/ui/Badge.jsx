import { cn } from '../../lib/utils';

export default function Badge({ label, color = 'bg-primary', icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm',
          color
        )}
      >
        {Icon && <Icon className="w-8 h-8 text-white" />}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter text-secondary text-center">
        {label}
      </span>
    </div>
  );
}