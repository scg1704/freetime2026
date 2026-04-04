import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Play, CheckCircle, XCircle, MessageSquare, Camera, Navigation } from 'lucide-react';

export default function TaskExecutionPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('IDLE'); // IDLE | STARTED | COMPLETED
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'STARTED') {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="px-6 py-8 space-y-8 min-h-screen bg-gray-50">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ejecución de Tarea</h1>
        <p className="text-secondary font-medium">ID: #{taskId}</p>
      </div>

      {/* Map Simulation */}
      <div className="relative h-64 bg-gray-200 rounded-[40px] overflow-hidden shadow-inner border-4 border-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute -inset-0" />
            <div className="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
              <Navigation className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
          <MapPin className="text-primary w-5 h-5" />
          <span className="text-xs font-bold text-black">
            Ubicación en tiempo real (próximamente)
          </span>
        </div>
      </div>

      {/* Timer & Controls */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 text-center space-y-8 border border-gray-100">
        <div className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary">
            Tiempo Transcurrido
          </span>
          <div className="text-6xl font-bold tracking-tighter tabular-nums text-black">
            {formatTime(timer)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors">
            <Camera className="w-6 h-6 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Foto</span>
          </button>
        </div>

        {status === 'IDLE' && (
          <button
            onClick={() => setStatus('STARTED')}
            className="w-full bg-black text-white py-5 rounded-3xl font-bold text-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" /> Iniciar Tarea
          </button>
        )}

        {status === 'STARTED' && (
          <button
            onClick={() => setStatus('COMPLETED')}
            className="w-full bg-primary text-white py-5 rounded-3xl font-bold text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle className="w-6 h-6" /> Finalizar Tarea
          </button>
        )}

        {status === 'COMPLETED' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Tarea Completada con Éxito
            </div>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-black text-white py-5 rounded-3xl font-bold text-xl transition-all"
            >
              Dejar Reseña
            </button>
          </div>
        )}

        {status !== 'COMPLETED' && (
          <button className="text-red-500 font-bold text-sm flex items-center gap-2 mx-auto">
            <XCircle className="w-4 h-4" /> Cancelar Tarea
          </button>
        )}
      </div>
    </div>
  );
}