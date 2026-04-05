import { cn } from '../../lib/utils';

export default function InputField({ icon, label, error, className, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={cn(
            'w-full pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all',
            icon ? 'pl-12' : 'pl-4',
            error && 'border-red-400 focus:border-red-400',
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
}