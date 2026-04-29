// source/fulltimer/pages/RatingsPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const PRIMARY = '#7D27BE';

// ─── Datos de ejemplo ────────────────────────────────────────────────────────
const RATINGS = [
  {
    id: 1,
    user: 'María González',
    task: 'Limpieza Apartamento',
    date: 'Abr 2, 2026',
    rating: 5,
    review: 'Excelente trabajo, muy puntual y dejó todo impecable. Lo recomiendo totalmente para este tipo de tareas.',
  },
  {
    id: 2,
    user: 'Carlos Martínez',
    task: 'Reparación de Grifo',
    date: 'Mar 28, 2026',
    rating: 4,
    review: 'Buen trabajo, resolvió el problema rápidamente. Solo tardó un poco más de lo esperado pero el resultado fue muy bueno.',
  },
  {
    id: 3,
    user: 'Laura Pérez',
    task: 'Paseo de Perro',
    date: 'Mar 18, 2026',
    rating: 5,
    review: 'Mi perro llegó feliz y cansado. Muy responsable y cariñoso con los animales. Sin duda lo volvería a contratar.',
  },
  {
    id: 4,
    user: 'Andrés Ruiz',
    task: 'Tutoría de Matemáticas',
    date: 'Mar 10, 2026',
    rating: 4,
    review: 'Explicó muy bien los temas, mi hijo mejoró bastante en cálculo. Volveríamos a contratarlo sin duda.',
  },
  {
    id: 5,
    user: 'Sofía Torres',
    task: 'Instalación de Router',
    date: 'Feb 14, 2026',
    rating: 5,
    review: 'Solucionó un problema que llevaba semanas sin poder resolver. Muy técnico y conocedor del tema.',
  },
];

// ─── Promedio ────────────────────────────────────────────────────────────────
function average(ratings) {
  if (!ratings.length) return 0;
  return ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
}

// ─── Estrellas ───────────────────────────────────────────────────────────────
function Stars({ value, size = 'sm' }) {
  const px = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={px}
          style={{ color: i <= value ? '#facc15' : '#e5e7eb' }}
          fill={i <= value ? '#facc15' : '#e5e7eb'}
        />
      ))}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function RatingsPage() {
  const [expandedId, setExpandedId] = useState(null);
  const avg = average(RATINGS);

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-6">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Mis Calificaciones
              </h1>
            </div>

            {/* Resumen */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
                  Promedio general
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-black" style={{ color: '#111827' }}>
                    {avg.toFixed(1)}
                  </span>
                  <Stars value={Math.round(avg)} size="lg" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {RATINGS.length} calificaciones
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  {RATINGS.filter(r => r.rating === 5).length} de 5 estrellas
                </p>
              </div>
            </div>

            {/* Subtítulo lista */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
              Historial
            </h2>

            {/* Tarjetas */}
            <div className="space-y-3">
              {RATINGS.map((r) => (
                <RatingCard
                  key={r.id}
                  r={r}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Tarjeta expandible ──────────────────────────────────────────────────────
function RatingCard({ r, expanded, onToggle }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = expanded
    ? { borderColor: `${PRIMARY}40`, background: '#fff' }
    : hovered
    ? { borderColor: `${PRIMARY}40`, background: `${PRIMARY}08` }
    : { borderColor: '#f3f4f6',      background: '#fff' };

  return (
    <motion.div
      layout
      className="rounded-3xl border-2 overflow-hidden cursor-pointer transition-all duration-200"
      style={cardStyle}
      onClick={onToggle}
      onMouseEnter={() => { if (!expanded) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fila principal */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Nombre de usuario en morado */}
          <button
            className="text-sm font-bold text-left block"
            style={{ color: PRIMARY }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            onClick={e => e.stopPropagation()}
          >
            {r.user}
          </button>

          <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
            {r.task}
          </p>

          <div className="flex items-center gap-2">
            <Stars value={r.rating} />
            <span className="text-xs" style={{ color: '#6b7280' }}>{r.date}</span>
          </div>
        </div>

        <div className="shrink-0 ml-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-black text-sm" style={{ color: '#111827' }}>{r.rating}.0</span>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4" style={{ color: '#9ca3af' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: '#9ca3af' }} />
          }
        </div>
      </div>

      {/* Review expandida */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-5 pb-5 pt-1 space-y-3"
              style={{ borderTop: '1px solid #f3f4f6' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Review text */}
              <p className="text-sm italic leading-relaxed" style={{ color: '#4b5563' }}>
                "{r.review}"
              </p>

              {/* Footer con usuario y fecha */}
              <div className="flex items-center justify-between">
                <button
                  className="text-xs font-bold cursor-pointer"
                  style={{ color: PRIMARY }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {r.user}
                </button>
                <span className="text-xs" style={{ color: '#9ca3af' }}>{r.date}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}