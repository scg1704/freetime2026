import { cn } from '../../lib/utils';

/**
 * Variantes: primary | secondary | danger | ghost
 * Tamaños:   sm | md | lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20',
    secondary: 'bg-black text-white hover:opacity-90',
    danger: 'bg-red-500 text-white hover:opacity-90',
    ghost: 'bg-gray-100 text-black hover:bg-gray-200',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg w-full',
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
}