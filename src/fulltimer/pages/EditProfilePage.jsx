// source/fulltimer/pages/EditProfilePage.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Phone, MapPin, ChevronDown, Check,
  X, Upload, FlipHorizontal2, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { useAuth } from '../../shared/context/AuthContext';
import { DEPARTMENTS, getMunicipalities } from '../../shared/lib/colombiaLocations';

const PRIMARY = '#7D27BE';

// ─── Image compressor (idéntico al de RegisterPage) ──────────────────────────
function compressImage(file, maxPx = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Phone input (igual que RegisterPage) ────────────────────────────────────
function PhoneInput({ value, onChange }) {
  const handleChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let fmt = digits;
    if (digits.length > 6)      fmt = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
    else if (digits.length > 3) fmt = digits.slice(0, 3) + '-' + digits.slice(3);
    onChange(fmt);
  };
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4b5563' }}>
        Teléfono
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border border-gray-200 rounded-2xl shrink-0">
          <span className="text-base leading-none">🇨🇴</span>
          <span className="text-sm font-bold" style={{ color: '#4b5563' }}>+57</span>
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            placeholder="310-000-0000"
            value={value}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all font-medium tracking-wide text-sm"
            style={{ color: '#111827' }}
            onFocus={e => (e.target.style.borderColor = PRIMARY)}
            onBlur={e => (e.target.style.borderColor = '#f3f4f6')}
          />
        </div>
      </div>
      <p className="text-[10px] font-medium pl-1" style={{ color: '#9ca3af' }}>
        Solo números de Colombia · Formato: 310-000-0000
      </p>
    </div>
  );
}

// ─── Location selector (igual que RegisterPage) ───────────────────────────────
function LocationSelector({ department, municipality, onDeptChange, onMunChange }) {
  const municipalities = getMunicipalities(department);
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4b5563' }}>
        <MapPin className="w-3.5 h-3.5" /> Ubicación
      </label>
      <div className="relative">
        <select
          value={department}
          onChange={(e) => { onDeptChange(e.target.value); onMunChange(''); }}
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all appearance-none pr-10 font-medium text-sm"
          style={{ color: department ? '#111827' : '#9ca3af' }}
          onFocus={e => (e.target.style.borderColor = PRIMARY)}
          onBlur={e => (e.target.style.borderColor = '#f3f4f6')}
        >
          <option value="">Selecciona un departamento</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      <AnimatePresence>
        {department && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden"
          >
            <select
              value={municipality}
              onChange={(e) => onMunChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all appearance-none pr-10 font-medium text-sm"
              style={{ color: municipality ? '#111827' : '#9ca3af' }}
              onFocus={e => (e.target.style.borderColor = PRIMARY)}
              onBlur={e => (e.target.style.borderColor = '#f3f4f6')}
            >
              <option value="">Selecciona un municipio</option>
              {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Profile photo uploader (adaptado de RegisterPage) ───────────────────────
function ProfilePhotoUploader({ preview, onChange }) {
  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const streamRef    = useRef(null);

  const [compressing, setCompressing] = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [cameraOpen,  setCameraOpen]  = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [mirrored,    setMirrored]    = useState(true);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file, 400, 0.75);
      onChange({ file, preview: compressed });
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange({ file, preview: reader.result });
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleFileInput = async (e) => {
    await processFile(e.target.files?.[0]);
    e.target.value = '';
    setShowModal(false);
  };

  const openCamera = async () => {
    setShowModal(false);
    setCameraError(false);
    setCameraReady(false);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch { setCameraError(true); }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraReady(false);
    setCameraError(false);
  };

  const handleCapture = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const offX = (video.videoWidth  - size) / 2;
    const offY = (video.videoHeight - size) / 2;
    if (mirrored) { ctx.translate(size, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, offX, offY, size, size, 0, 0, size, size);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      closeCamera();
      await processFile(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.88);
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      {/* Foto grande centrada */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-28 h-28 rounded-[32px] overflow-hidden border-2 border-dashed transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: preview ? `${PRIMARY}60` : '#e5e7eb', background: preview ? undefined : '#fafafa' }}
          >
            {compressing ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} />
              </div>
            ) : preview ? (
              <img src={preview} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 w-full h-full justify-center">
                <Camera className="w-7 h-7 text-gray-300" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-300">Foto</span>
              </div>
            )}
          </button>

          {preview && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
            style={{ background: PRIMARY }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6a1fa3')}
            onMouseLeave={e => (e.currentTarget.style.background = PRIMARY)}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs font-medium text-center" style={{ color: '#6b7280' }}>
          Toca la foto para cambiarla
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

      {/* Modal opciones */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-black rounded-3xl p-6 space-y-3 pb-10 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-bold text-white text-center pb-1">Cambiar foto de perfil</p>
              <button type="button" onClick={openCamera} className="cursor-pointer w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}30` }}>
                  <Camera className="w-5 h-5" style={{ color: PRIMARY }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Tomar foto</p>
                  <p className="text-xs text-white/60">Usa la cámara de tu dispositivo</p>
                </div>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="cursor-pointer w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Subir desde archivos</p>
                  <p className="text-xs text-white/60">JPG, PNG, HEIC — máx. 5 MB</p>
                </div>
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="w-full py-3 text-sm font-bold text-white rounded-2xl transition-all cursor-pointer" 
                style={{ 
                    background: PRIMARY,
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#5c178e'}
                onMouseLeave={e => e.currentTarget.style.background = PRIMARY}
                >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal cámara */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
          >
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 z-10">
              <button type="button" onClick={closeCamera} className="cursor-pointer w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
              <p className="text-white text-sm font-bold">Foto de perfil</p>
              <button type="button" onClick={() => setMirrored((m) => !m)} className="cursor-pointer w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <FlipHorizontal2 className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white/30">
              <video ref={videoRef} autoPlay playsInline muted className={cn('w-full h-full object-cover', mirrored && 'scale-x-[-1]')} />
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                  <Camera className="w-8 h-8 text-white/50 animate-pulse" />
                  <p className="text-white/60 text-xs font-medium">Iniciando cámara…</p>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-white text-xs font-bold">No se pudo acceder a la cámara.</p>
                </div>
              )}
            </div>
            <p className="text-white/60 text-xs mt-5 font-medium text-center px-10">
              Coloca tu rostro dentro del círculo y asegúrate de estar bien iluminado
            </p>
            <div className="absolute bottom-12 inset-x-0 flex justify-center">
              <button type="button" onClick={handleCapture} disabled={!cameraReady || cameraError} className="cursor-pointer w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform hover:border-white/50">
                <div className="w-14 h-14 rounded-full bg-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [photo,        setPhoto]        = useState(user?.photoURL ? { preview: user.photoURL } : null);
  const [phone,        setPhone]        = useState(user?.phone?.replace('+57', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') || '');
  const [department,   setDepartment]   = useState(user?.department || '');
  const [municipality, setMunicipality] = useState(user?.municipality || '');
  const [loading,      setLoading]      = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState('');

  const handleSave = async () => {
    if (phone.replace(/\D/g, '').length < 10) { setError('Ingresa un número de teléfono válido.'); return; }
    if (!department || !municipality) { setError('Selecciona tu departamento y municipio.'); return; }
    setError('');
    setLoading(true);
    try {
      // TODO: llamar a /api/users/profile con PATCH
      await new Promise(r => setTimeout(r, 1200)); // simulación
      setSaved(true);
      setTimeout(() => navigate('/fulltimer/profile'), 1000);
    } catch {
      setError('Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Centramos el contenido verticalmente en el scroll con flex items-center */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center" style={{ scrollbarWidth: 'none' }}>
          
          <div className="px-5 py-6 w-full max-w-4xl mx-auto space-y-10">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Editar Perfil
              </h1>
            </div>

            {/* Contenedor Grid con centrado vertical interno (items-center) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              
              {/* COLUMNA IZQUIERDA: Foto (Centrada verticalmente por el items-center del grid) */}
              <section className="flex flex-col items-center space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                  Foto de perfil
                </h2>
                <ProfilePhotoUploader preview={photo?.preview} onChange={setPhoto} />
              </section>

              {/* COLUMNA DERECHA: Formulario */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-left border-b border-gray-100 pb-2" style={{ color: '#4b5563' }}>
                    Contacto
                  </h2>
                  <PhoneInput value={phone} onChange={setPhone} />
                </section>

                <section className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-left border-b border-gray-100 pb-2" style={{ color: '#4b5563' }}>
                    Ubicación
                  </h2>
                  <LocationSelector
                    department={department}
                    municipality={municipality}
                    onDeptChange={setDepartment}
                    onMunChange={setMunicipality}
                  />
                </section>
              </div>
            </div>

            {/* Botón Guardar - También centrado */}
            <div className="max-w-md mx-auto pt-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl mb-4"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
                  <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>{error}</p>
                </motion.div>
              )}

              <button
                onClick={handleSave}
                disabled={loading || saved}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer shadow-xl shadow-purple-100 transition-all active:scale-95 "
                style={{ 
                    background: saved ? '#7D27BE' : PRIMARY, 
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={e => {
                    if (!loading && !saved) e.currentTarget.style.background = '#5c178e';
                }}
                onMouseLeave={e => {
                    if (!loading && !saved) e.currentTarget.style.background = PRIMARY;
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
                {loading ? 'Guardando...' : saved ? '¡Cambios guardados!' : 'Guardar cambios'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}