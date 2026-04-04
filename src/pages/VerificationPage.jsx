import { useState } from 'react';
import { Camera, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerificationPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="px-6 py-12 flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Verificación Biométrica
          </h1>
          <p className="text-secondary">
            Garantiza tu seguridad y la de los demás
          </p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
              <Camera className="w-12 h-12 text-primary opacity-50" />
              <div className="absolute inset-0 border-[20px] border-white rounded-full" />
            </div>
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-bold">Captura de Selfie</h3>
              <p className="text-sm text-secondary">
                Asegúrate de estar en un lugar bien iluminado y sin accesorios
                que cubran tu rostro.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white py-5 rounded-3xl font-bold text-lg shadow-lg shadow-primary/20"
            >
              Tomar Foto
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="p-8 bg-green-50 rounded-[40px] border border-green-100 text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-700">
                  ¡Identidad Verificada!
                </h3>
                <p className="text-sm text-green-600/80">
                  Hemos comparado tu selfie con tu documento con éxito.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">
                  Validación Anti-Spoofing: OK
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">
                  Análisis de Liveness: OK
                </span>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = '/home')}
              className="w-full bg-black text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-2"
            >
              Continuar al Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}