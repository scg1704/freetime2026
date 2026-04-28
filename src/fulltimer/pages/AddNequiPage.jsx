// source/fulltimer/pages/AddNequiPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const PRIMARY = '#7D27BE';

// ─── Simulación de API Nequi ─────────────────────────────────────────────────
// Nequi ofrece una API REST oficial (api.nequi.com.co) que requiere:
//   - Client ID + Client Secret (portal de desarrolladores de Nequi)
//   - OAuth2 para obtener access_token
//   - Endpoint POST /payments/v2/-/transfers/-/debitintents para débitos
// Por ahora se simula el flujo completo de vinculación.
async function simulateNequiLink(phoneNumber) {
  await new Promise(r => setTimeout(r, 2000));

  if (phoneNumber === '3000000000') {
    throw new Error('Número no registrado en Nequi');
  }

  return {
    success: true,
    maskedNumber: `${phoneNumber.slice(0, 3)} **** ${phoneNumber.slice(-3)}`,
    accountId: `NQ-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
}

// ─── Validación de número colombiano ────────────────────────────────────────
function isValidColombian(num) {
  return /^3\d{9}$/.test(num.replace(/\s/g, ''));
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function AddNequiPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  const isValid = isValidColombian(phone);

  async function handleSubmit() {
    if (!isValid) return;
    setStep('loading');
    setErrorMsg('');
    try {
      const data = await simulateNequiLink(phone.replace(/\s/g, ''));
      setResult(data);
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar con Nequi');
      setStep('error');
    }
  }

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>

      {/* Columna izquierda */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      {/* Contenido central — centrado vertical y horizontal */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto flex items-center justify-center" style={{ scrollbarWidth: 'none' }}>
          <div className="w-full px-5 py-6 max-w-md mx-auto space-y-6">

            {/* Título centrado, sin flecha */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Añadir Nequi
              </h1>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Formulario / Error ── */}
              {(step === 'form' || step === 'error') && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  {/* Info Nequi */}
                  <div
                    className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}
                  >
                    <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: PRIMARY }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                        Conexión segura con Nequi
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Tu número será vinculado para recibir y enviar pagos dentro de FreeTime.
                        Usamos la API oficial de Nequi — nunca almacenamos tu PIN.
                      </p>
                    </div>
                  </div>

                  {/* Campo teléfono */}
                  <div className="space-y-2">
                    <label
                      className="block text-xs font-bold uppercase tracking-widest text-center"
                      style={{ color: '#4b5563' }}
                    >
                      Número de celular Nequi
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: '#9ca3af' }}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="300 000 0000"
                        value={formatted}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium placeholder:text-gray-400 transition-all"
                        style={{
                          background: '#fafafa',
                          border: `2px solid ${step === 'error' ? '#fca5a5' : '#e5e7eb'}`,
                          color: '#111827',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                        onFocus={e => (e.target.style.borderColor = PRIMARY)}
                        onBlur={e => (e.target.style.borderColor = step === 'error' ? '#fca5a5' : '#e5e7eb')}
                      />
                    </div>
                    <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
                      Debe ser el número registrado en tu cuenta Nequi (empieza por 3)
                    </p>
                  </div>

                  {/* Mensaje de error */}
                  {step === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
                      <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>{errorMsg}</p>
                    </motion.div>
                  )}

                  {/* Botón vincular */}
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-colors"
                    style={{
                      background: isValid ? PRIMARY : '#d1d5db',
                      cursor: isValid ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={e => { if (isValid) e.currentTarget.style.background = '#5c178e'; }}
                    onMouseLeave={e => { if (isValid) e.currentTarget.style.background = isValid ? PRIMARY : '#d1d5db'; }}
                  >
                    Vincular número Nequi
                  </button>

                  <p className="text-center text-xs" style={{ color: '#9ca3af' }}>
                    Al vincular aceptas que FreeTime use este número para gestionar pagos de tareas.
                  </p>
                </motion.div>
              )}

              {/* ── Cargando ── */}
              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
                >
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: PRIMARY }} />
                  <p className="font-bold text-sm" style={{ color: '#4b5563' }}>
                    Conectando con Nequi...
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    Verificando número y vinculando cuenta
                  </p>
                </motion.div>
              )}

              {/* ── Éxito ── */}
              {step === 'success' && result && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center space-y-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: '#f0fdf4' }}
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color: '#16a34a' }} />
                  </motion.div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black" style={{ color: '#111827' }}>
                      ¡Nequi vinculado!
                    </h2>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Tu número{' '}
                      <span className="font-bold" style={{ color: PRIMARY }}>
                        {result.maskedNumber}
                      </span>{' '}
                      quedó asociado a tu cuenta FreeTime.
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                      ID de cuenta: {result.accountId}
                    </p>
                  </div>

                  <div
                    className="w-full rounded-2xl p-4 text-left space-y-1"
                    style={{ background: '#f3e8ff', border: '1px solid #e9d5ff' }}
                  >
                    <p className="text-xs font-bold" style={{ color: PRIMARY }}>¿Qué sigue?</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Cuando se acepte a un FreeTimer, el pago saldrá automáticamente de tu Nequi
                      y quedará en escrow hasta que marques la tarea como completada.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/fulltimer/payment')}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white cursor-pointer transition-colors"
                    style={{ background: '#7D27BE' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}
                  >
                    Volver a Mis Pagos
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}