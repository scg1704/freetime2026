import { CreditCard, AlertTriangle, Plus, ChevronRight } from 'lucide-react';

export default function FreetimerPaymentPage() {
  return (
    <div className="px-6 py-8 space-y-10">
      <h1 className="text-4xl font-bold tracking-tighter">Mis Pagos</h1>

      {/* Métodos para recibir dinero */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Cuentas para recibir
          </h2>
          <button className="text-primary text-sm font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-3">
          <PaymentMethodCard type="Nequi" number="300 **** 123" isDefault />
          <PaymentMethodCard type="Bancolombia" number="**** 4567" />
        </div>
      </section>

      {/* Historial de recibos */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Historial de Cobros
          </h2>
          <button className="text-primary text-sm font-bold">Ver Todo</button>
        </div>
        <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
          <TransactionItem title="Reparación de Grifo" date="Abr 2, 2026" amount="+$40.500" status="Recibido" />
          <TransactionItem title="Limpieza Apartamento" date="Mar 28, 2026" amount="+$72.000" status="Recibido" />
          <TransactionItem title="Paseo de Perro" date="Mar 25, 2026" amount="+$13.500" status="Recibido" />
        </div>
      </section>

      {/* Reportar fallo */}
      <button className="w-full bg-red-50 text-red-600 p-6 rounded-3xl flex items-center justify-between group hover:bg-red-100 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-bold">Reportar Fallo</h4>
            <p className="text-xs opacity-80">Problemas con la recepción de dinero</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function PaymentMethodCard({ type, number, isDefault }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-bold">{type}</h4>
          <p className="text-secondary text-sm">{number}</p>
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

function TransactionItem({ title, date, amount, status }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50 transition-colors">
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-secondary text-xs">{date} • {status}</p>
      </div>
      <div className="text-right">
        <div className="font-bold text-green-600">{amount}</div>
        <div className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Recibo #FT</div>
      </div>
    </div>
  );
}