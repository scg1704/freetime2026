// source/fulltimer/pages/PaymentHistoryPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Star,
  Receipt,
  User,
  Tag
} from 'lucide-react';

const PRIMARY = '#7D27BE';

// ─── Datos enriquecidos ──────────────────────────────────────────────────────
const ALL_PAYMENTS = [
  {
    id: 1,
    title: 'Reparación de Grifo',
    freetimer: 'Esteban Perez',
    fretimerRating: 4.8,
    date: '2026-04-02',
    dateLabel: 'Abr 2, 2026',
    amount: '-$40.500',
    status: 'En escrow',
    method: 'Nequi',
    category: 'Hogar · Plomería',
    location: 'Manizales, Caldas',
    duration: '2 horas',
    receiptId: 'FT-20260402-001',
    escrowReleased: false,
    description: 'Reparación completa de grifo de cocina con reemplazo de empaque y ajuste de presión.',
  },
  {
    id: 2,
    title: 'Limpieza Apartamento',
    freetimer: 'Esteban Perez',
    fretimerRating: 4.9,
    date: '2026-03-28',
    dateLabel: 'Mar 28, 2026',
    amount: '-$72.000',
    status: 'Pagado',
    method: 'Nequi',
    category: 'Hogar · Limpieza',
    location: 'Manizales, Caldas',
    duration: '4 horas',
    receiptId: 'FT-20260328-003',
    escrowReleased: true,
    description: 'Limpieza profunda de apartamento de 2 habitaciones, incluyendo baños, cocina y áreas comunes.',
  },
  {
    id: 3,
    title: 'Paseo de Perro',
    freetimer: 'Esteban Perez',
    fretimerRating: 4.5,
    date: '2026-03-25',
    dateLabel: 'Mar 25, 2026',
    amount: '-$13.500',
    status: 'Pagado',
    method: 'Nequi',
    category: 'Mascotas · Paseo',
    location: 'Manizales, Caldas',
    duration: '1 hora',
    receiptId: 'FT-20260325-007',
    escrowReleased: true,
    description: 'Paseo de 1 hora por el parque con recogida y entrega en el domicilio.',
  },
  {
    id: 4,
    title: 'Tutoría de Matemáticas',
    freetimer: 'Esteban Perez',
    fretimerRating: 5.0,
    date: '2026-03-18',
    dateLabel: 'Mar 18, 2026',
    amount: '-$35.000',
    status: 'Pagado',
    method: 'Nequi',
    category: 'Educación · Tutoría',
    location: 'Manizales, Caldas',
    duration: '2 horas',
    receiptId: 'FT-20260318-012',
    escrowReleased: true,
    description: 'Sesión de cálculo diferencial e integral para estudiante universitario.',
  },
  {
    id: 5,
    title: 'Instalación de Router',
    freetimer: 'Esteban Perez',
    fretimerRating: 4.7,
    date: '2026-02-14',
    dateLabel: 'Feb 14, 2026',
    amount: '-$28.000',
    status: 'Pagado',
    method: 'Nequi',
    category: 'Tecnología · Instalación',
    location: 'Manizales, Caldas',
    duration: '1.5 horas',
    receiptId: 'FT-20260214-019',
    escrowReleased: true,
    description: 'Configuración y optimización de red Wi-Fi con instalación de repetidor.',
  },
];

// ─── Agrupar por mes ─────────────────────────────────────────────────────────
function groupByMonth(payments) {
  const groups = {};
  payments.forEach(p => {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { label, items: [] };
    groups[key].items.push(p);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v);
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function PaymentHistoryPage() {
  const [expandedId, setExpandedId] = useState(null);

  const groups = groupByMonth(ALL_PAYMENTS);

  const totalPaid = ALL_PAYMENTS
    .filter(p => p.status === 'Pagado')
    .reduce((acc, p) => acc + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-6">

            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Historial de Pagos
              </h1>
            </div>

            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
                  Total pagado
                </p>
                <p className="text-2xl font-black mt-0.5" style={{ color: '#111827' }}>
                  ${totalPaid.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {ALL_PAYMENTS.filter(p => p.status === 'Pagado').length} tareas completadas
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  {ALL_PAYMENTS.filter(p => p.status === 'En escrow').length} en escrow
                </p>
              </div>
            </div>

            {groups.map((group, gi) => (
              <div key={gi} className="space-y-3 mt-8 first:mt-0">
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1" style={{ background: '#e5e7eb' }} />
                  <span className="text-sm font-bold uppercase tracking-widest text-center px-2" style={{ color: '#4b5563' }}>
                    {group.label}
                  </span>
                  <div className="h-px flex-1" style={{ background: '#e5e7eb' }} />
                </div>

                <div className="space-y-3">
                  {group.items.map(tx => (
                    <PaymentCard
                      key={tx.id}
                      tx={tx}
                      expanded={expandedId === tx.id}
                      onToggle={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                      onViewFreetimer={() => {/* Navegar perfil */}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

// ─── Tarjeta de pago expandible ──────────────────────────────────────────────
function PaymentCard({ tx, expanded, onToggle, onViewFreetimer }) {
  const [hovered, setHovered] = useState(false);
  const isNegative = tx.amount.startsWith('-');
  const isPaid = tx.status === 'Pagado';

  const cardStyle = expanded
    ? { borderColor: PRIMARY, background: PRIMARY }
    : hovered
    ? { borderColor: `${PRIMARY}40`, background: `${PRIMARY}08` }
    : { borderColor: '#f3f4f6', background: '#fff' };

  const textColor = expanded ? '#ffffff' : '#111827';
  const subTextColor = expanded ? 'rgba(255,255,255,0.7)' : '#6b7280';
  
  const iconBg = expanded ? '#ffffff' : (isPaid ? '#f0fdf4' : '#fef9c3');
  const iconColor = expanded ? PRIMARY : (isPaid ? '#16a34a' : '#ca8a04');

  return (
    <motion.div
      layout
      className="rounded-3xl border-2 overflow-hidden cursor-pointer transition-all duration-200"
      style={cardStyle}
      onClick={onToggle}
      onMouseEnter={() => { if (!expanded) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
            style={{ background: iconBg }}
          >
            {isPaid
              ? <CheckCircle2 className="w-5 h-5" style={{ color: iconColor }} />
              : <Clock className="w-5 h-5" style={{ color: iconColor }} />
            }
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate" style={{ color: textColor }}>
              {tx.title}
            </h4>
            <button
              className="text-xs font-semibold text-left cursor-pointer hover:underline"
              style={{ color: expanded ? '#ffffff' : PRIMARY }}
              onClick={e => { e.stopPropagation(); onViewFreetimer(); }}
            >
              {tx.freetimer}
            </button>
            <p className="text-xs" style={{ color: subTextColor }}>
              {tx.dateLabel} · {tx.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right">
            <div className="font-bold text-sm" style={{ color: expanded ? '#ffffff' : (isNegative ? '#ef4444' : '#16a34a') }}>
              {tx.amount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: expanded ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
              {tx.method}
            </div>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4" style={{ color: '#ffffff' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: '#9ca3af' }} />
          }
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs pt-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {tx.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <DetailChip icon={<MapPin className="w-3.5 h-3.5" />} label="Ubicación" value={tx.location} inverted />
                <DetailChip icon={<Clock className="w-3.5 h-3.5" />} label="Duración" value={tx.duration} inverted />
                <DetailChip icon={<Tag className="w-3.5 h-3.5" />} label="Categoría" value={tx.category} inverted />
                <DetailChip icon={<Receipt className="w-3.5 h-3.5" />} label="Recibo" value={tx.receiptId} mono inverted />
              </div>

              {/* Caja de Usuario (Fondo blanco, contenido morado) */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{ background: '#ffffff', border: '1px solid #ffffff' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
                    <User className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <button 
                      className="text-xs font-bold text-left cursor-pointer hover:underline" 
                      style={{ color: PRIMARY }}
                      onClick={e => { e.stopPropagation(); onViewFreetimer(); }}
                    >
                      {tx.freetimer}
                    </button>
                    <p className="text-[10px]" style={{ color: '#6b7280' }}>FreeTimer</p>
                  </div>
                </div>
                {tx.fretimerRating !== null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold" style={{ color: '#111827' }}>{tx.fretimerRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Caja de Escrow (Fondo blanco, contenido morado) */}
              <div
                className="flex items-center gap-2 p-3 rounded-2xl"
                style={{ background: '#ffffff', border: '1px solid #ffffff' }}
              >
                {isPaid
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  : <Clock className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                }
                <p className="text-xs font-bold" style={{ color: PRIMARY }}>
                  {isPaid ? 'Pago liberado — Tarea completada' : 'Pago retenido en escrow'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Chip de detalle ─────────────────────────────────────────────────────────
function DetailChip({ icon, label, value, mono, inverted }) {
  const bg = inverted ? 'rgba(255,255,255,0.1)' : '#fafafa';
  const border = inverted ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
  const labelColor = inverted ? 'rgba(255,255,255,0.6)' : '#9ca3af';
  const valColor = inverted ? '#ffffff' : '#4b5563';

  return (
    <div className="rounded-2xl p-3 space-y-1" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-1.5" style={{ color: labelColor }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-xs font-semibold ${mono ? 'font-mono' : ''}`} style={{ color: valColor }}>
        {value}
      </p>
    </div>
  );
}