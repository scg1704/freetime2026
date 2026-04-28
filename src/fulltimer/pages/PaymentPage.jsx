// source/fulltimer/pages/PaymentPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FulltimerPaymentPage() {
  const navigate = useNavigate();

  const [methods] = useState([
    { id: 1, type: 'Nequi', number: '300 **** 123', isDefault: true },
  ]);

  const recentPayments = [
    { id: 1, title: 'Reparación de Grifo',  date: 'Abr 27, 2026',  amount: '-$40.500', status: 'Pagado'    },
    { id: 2, title: 'Limpieza Apartamento', date: 'Mar 28, 2026', amount: '-$72.000', status: 'Pagado'    },
    { id: 3, title: 'Paseo de Perro',       date: 'Mar 25, 2026', amount: '-$13.500', status: 'En escrow' },
  ];

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>

      {/* Columna izquierda */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      {/* Contenido central */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-8">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Mis Pagos
              </h1>
            </div>

            {/* ── Métodos de pago ── */}
            <section className="space-y-4">
              <h2
                className="text-sm font-bold uppercase tracking-widest text-center -mt-3"
                style={{ color: '#4b5563' }}
              >
                Métodos de pago
              </h2>

              <PurpleButton
                icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/fulltimer/payment/add-nequi')}
              >
                Añadir método de pago
              </PurpleButton>

              <AnimatePresence>
                {methods.length > 0 && (
                  <div className="space-y-3">
                    {methods.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                      >
                        <PaymentMethodCard
                          type={m.type}
                          number={m.number}
                          isDefault={m.isDefault}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </section>

            {/* ── Historial de pagos ── */}
            <section className="space-y-4 -mt-4">
              <h2
                className="text-sm font-bold uppercase tracking-widest text-center"
                style={{ color: '#4b5563' }}
              >
                Historial de Pagos
              </h2>

              <div className="bg-gray-50 rounded-[28px] overflow-hidden border border-gray-100">
                {recentPayments.map((tx, i) => (
                  <TransactionItem
                    key={tx.id}
                    title={tx.title}
                    date={tx.date}
                    amount={tx.amount}
                    status={tx.status}
                    isLast={i === recentPayments.length - 1}
                  />
                ))}
              </div>

              <PurpleButton onClick={() => navigate('/fulltimer/payment/history')}>
                Ver historial de pagos
              </PurpleButton>
            </section>

          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}

function PurpleButton({ children, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white cursor-pointer transition-colors"
      style={{ background: '#7D27BE' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#6a1fa3')}
      onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}
    >
      {icon && icon}
      {children}
    </button>
  );
}

function PaymentMethodCard({ type, number, isDefault }) {
  return (
    <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 flex items-center justify-between transition-all cursor-default hover:bg-[#7D27BE]/5 hover:border-[#7D27BE]/30">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-sm" style={{ color: '#111827' }}>{type}</h4>
          <p className="text-xs" style={{ color: '#6b7280' }}>{number}</p>
        </div>
      </div>
      {isDefault && (
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Principal
        </span>
      )}
    </div>
  );
}

function TransactionItem({ title, date, amount, status, isLast }) {
  const isNegative = amount.startsWith('-');
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 bg-white transition-all border-2 border-transparent hover:bg-[#7D27BE]/5 hover:border-[#7D27BE]/30 ${
        !isLast ? 'border-b-gray-100' : ''
      }`}
    >
      <div className="space-y-0.5">
        <h4 className="font-bold text-sm" style={{ color: '#111827' }}>{title}</h4>
        <button
          className="text-xs font-semibold cursor-pointer text-left block"
          style={{ color: '#7D27BE' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          Esteban Perez
        </button>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          {date} · {status}
        </p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <div className="font-bold text-sm" style={{ color: isNegative ? '#ef4444' : '#16a34a' }}>
          {amount}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-tighter mt-0.5" style={{ color: '#6b7280' }}>
          Recibo #FT
        </div>
      </div>
    </div>
  );
}