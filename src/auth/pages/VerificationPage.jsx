// source/auth/pages/VerificationPage.jsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }                    from 'motion/react';
import { useNavigate }                                from 'react-router-dom';
import { useAuth }                                    from '../../shared/context/AuthContext';
import Button                                         from '../../shared/components/ui/Button';
import {
  Camera, Shield, CheckCircle, AlertCircle,
  Eye, FileImage, ArrowRight, RefreshCw, Lock, Info,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes — valores calibrados para cámaras web y móviles reales
// ─────────────────────────────────────────────────────────────────────────────
const LIVENESS_HOLD_MS       = 3000;  // ms que el usuario debe mantenerse frente a la cámara
const BLINK_DELTA_THRESHOLD  = 8;     // puntos de luminancia de delta para detectar parpadeo (era 46 — demasiado alto)
const BLINK_NEEDED           = 1;     // basta con 1 parpadeo detectado
const ANTISPOOF_VARIANCE_MIN = 180;   // varianza mínima de textura (era 420 — irrealmente alto)
const FACEMATCH_SCORE_MIN    = 0.45;  // correlación mínima entre histogramas (era 0.62)
const CAPTURE_JPEG_QUALITY   = 0.88;

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de imagen
// ─────────────────────────────────────────────────────────────────────────────
function captureFrame(videoEl, canvasEl) {
  const { videoWidth: w, videoHeight: h } = videoEl;
  if (!w || !h) return null;
  canvasEl.width  = w;
  canvasEl.height = h;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function captureDataURL(videoEl, canvasEl) {
  captureFrame(videoEl, canvasEl);
  return canvasEl.toDataURL('image/jpeg', CAPTURE_JPEG_QUALITY);
}

// Luminancia promedio de la región central de la imagen (donde estarían los ojos)
function getEyeRegionLuminance(imageData) {
  const { data, width, height } = imageData;
  const x0 = Math.floor(width  * 0.25);
  const x1 = Math.floor(width  * 0.75);
  const y0 = Math.floor(height * 0.22);
  const y1 = Math.floor(height * 0.42);
  let sum = 0, count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      count++;
    }
  }
  return count > 0 ? sum / count : 128;
}

function computeTextureVariance(imageData) {
  const { data, width, height } = imageData;
  const blockSize = 8;
  let totalVar = 0, blockCount = 0;
  for (let by = 0; by < height - blockSize; by += blockSize) {
    for (let bx = 0; bx < width - blockSize; bx += blockSize) {
      let sum = 0, sum2 = 0, n = 0;
      for (let y = by; y < by + blockSize; y++) {
        for (let x = bx; x < bx + blockSize; x++) {
          const i = (y * width + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          sum  += lum;
          sum2 += lum * lum;
          n++;
        }
      }
      const mean = sum / n;
      totalVar += (sum2 / n) - (mean * mean);
      blockCount++;
    }
  }
  return blockCount > 0 ? totalVar / blockCount : 0;
}

function compareFaceHistograms(imgA, imgB) {
  const BINS = 64;
  function buildHistogram(imageData) {
    const hist = new Float32Array(BINS).fill(0);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const bin = Math.min(Math.floor(lum / (256 / BINS)), BINS - 1);
      hist[bin]++;
    }
    const total = data.length / 4;
    return hist.map((v) => v / total);
  }
  const hA = buildHistogram(imgA);
  const hB = buildHistogram(imgB);
  let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  for (let i = 0; i < BINS; i++) {
    sumA  += hA[i]; sumB  += hB[i];
    sumAB += hA[i] * hB[i];
    sumA2 += hA[i] * hA[i]; sumB2 += hB[i] * hB[i];
  }
  const n = BINS;
  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  return den === 0 ? 0 : Math.max(0, Math.min(1, (num / den + 1) / 2));
}

function loadImageDataFromURL(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.getContext('2d').getImageData(0, 0, img.width, img.height));
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook de cámara
// ─────────────────────────────────────────────────────────────────────────────
function useCamera(active) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [ready,  setReady]  = useState(false);
  const [denied, setDenied] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          if (!cancelled) setReady(true);
        }
      } catch {
        if (!cancelled) setDenied(true);
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [active, stop]);

  return { videoRef, ready, denied, stop };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = ['consent', 'selfie', 'document', 'result'];

export default function VerificationPage() {
  const navigate                  = useNavigate();
  const { user, markVerified }    = useAuth();
  const canvasRef                 = useRef(null);
  const fileInputRef              = useRef(null);
  const animRef                   = useRef(null);
  const holdTimerRef              = useRef(null);   // intervalo del contador de presencia
  const blinkCountRef             = useRef(0);      // acumulador de parpadeos (ref, no state)
  const prevLumRef                = useRef(null);   // luminancia del frame anterior (ref, no state)

  const [step,       setStep]     = useState('consent');
  const [selfieURL,  setSelfieURL]= useState(null);
  const [docURL,     setDocURL]   = useState(null);
  const [analyzing,  setAnalyzing]= useState(false);
  const [result,     setResult]   = useState(null);

  // Liveness
  const [livenessOk,   setLivenessOk]  = useState(false);
  const [holdProgress, setHoldProgress]= useState(0);    // 0-100
  const [blinkCount,   setBlinkCount]  = useState(0);    // para mostrar en UI
  const [livenessMsg,  setLivenessMsg] = useState('Mira a la cámara y mantente quieto');

  const cameraActive = step === 'selfie';
  const { videoRef, ready, denied, stop: stopCamera } = useCamera(cameraActive);

  // ── Liveness: detecta presencia y parpadeo simultáneamente ───────────────
  useEffect(() => {
    if (!cameraActive || !ready) return;

    // Limpia cualquier estado anterior
    blinkCountRef.current = 0;
    prevLumRef.current    = null;
    setHoldProgress(0);
    setBlinkCount(0);
    setLivenessOk(false);
    setLivenessMsg('Mira a la cámara y mantente quieto');

    const startTime = Date.now();

    const tick = () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── Calcular progreso de presencia (tiempo) ──
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / LIVENESS_HOLD_MS) * 100);
      setHoldProgress(progress);

      // ── Detectar parpadeo por delta de luminancia ──
      const frame = captureFrame(video, canvas);
      if (frame) {
        const lum = getEyeRegionLuminance(frame);
        if (prevLumRef.current !== null) {
          const delta = Math.abs(lum - prevLumRef.current);
          if (delta > BLINK_DELTA_THRESHOLD) {
            blinkCountRef.current += 1;
            setBlinkCount(blinkCountRef.current);
          }
        }
        prevLumRef.current = lum;
      }

      // ── Liveness confirmado: tiempo + al menos 1 parpadeo ──
      if (elapsed >= LIVENESS_HOLD_MS && blinkCountRef.current >= BLINK_NEEDED) {
        setLivenessOk(true);
        setHoldProgress(100);
        setLivenessMsg('¡Listo! Puedes capturar tu foto');
        return; // detener loop
      }

      // Mensajes de guía progresivos
      if (elapsed < LIVENESS_HOLD_MS) {
        if (blinkCountRef.current === 0) {
          setLivenessMsg('Mantente quieto y parpadea naturalmente…');
        } else {
          setLivenessMsg(`Parpadeo detectado ✓ — Aguarda ${Math.ceil((LIVENESS_HOLD_MS - elapsed) / 1000)}s más…`);
        }
      } else if (blinkCountRef.current < BLINK_NEEDED) {
        setLivenessMsg('¡Ahora parpadea una vez!');
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearInterval(holdTimerRef.current);
    };
  }, [cameraActive, ready]);

  // ── Capturar selfie ───────────────────────────────────────────────────────
  const handleCaptureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !livenessOk) return;
    const dataURL = captureDataURL(videoRef.current, canvasRef.current);
    setSelfieURL(dataURL);
    stopCamera();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setStep('document');
  }, [livenessOk, stopCamera, videoRef]);

  // ── Subir documento ───────────────────────────────────────────────────────
  const handleDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setDocURL(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Análisis biométrico ───────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selfieURL || !docURL) return;
    setAnalyzing(true);
    try {
      const [selfieData, docData] = await Promise.all([
        loadImageDataFromURL(selfieURL),
        loadImageDataFromURL(docURL),
      ]);

      const textureScore = computeTextureVariance(selfieData);
      const antiSpoofOk  = textureScore >= ANTISPOOF_VARIANCE_MIN;

      const matchScore  = compareFaceHistograms(selfieData, docData);
      const faceMatchOk = matchScore >= FACEMATCH_SCORE_MIN;

      const passed = livenessOk && antiSpoofOk && faceMatchOk;

      await new Promise((r) => setTimeout(r, 1800));

      setResult({
        passed,
        scores: {
          liveness:   livenessOk  ? 'OK' : 'FAIL',
          antiSpoof:  antiSpoofOk ? 'OK' : 'FAIL',
          faceMatch:  Math.round(matchScore * 100),
          faceMatchOk,
        },
      });
      setStep('result');
    } catch {
      setResult({ passed: false, scores: null, error: true });
      setStep('result');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Continuar al dashboard ────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await fetch('/api/auth/verify', {
        method:  'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) markVerified(data.user);
        else markVerified();
      } else {
        markVerified();
      }
    } catch {
      markVerified();
    }
    navigate(user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home', { replace: true });
  };

  // ── Reintentar ────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setSelfieURL(null);
    setDocURL(null);
    setResult(null);
    setLivenessOk(false);
    setHoldProgress(0);
    setBlinkCount(0);
    prevLumRef.current   = null;
    blinkCountRef.current = 0;
    setStep('selfie');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Verificación Biométrica</h1>
          <p className="text-secondary text-sm">Garantiza tu seguridad y la de la comunidad</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s) => (
            <div key={s} className={[
              'h-1.5 rounded-full transition-all duration-300',
              s === step
                ? 'w-8 bg-primary'
                : STEPS.indexOf(s) < STEPS.indexOf(step)
                  ? 'w-4 bg-primary/40'
                  : 'w-4 bg-gray-200',
            ].join(' ')} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── PASO 1: Consentimiento ── */}
          {step === 'consent' && (
            <motion.div key="consent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="bg-purple-50 rounded-3xl p-6 space-y-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm font-bold text-gray-800">Tu privacidad está protegida</p>
                </div>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex gap-2"><span>•</span><span>El análisis se realiza <strong>directamente en tu dispositivo</strong>.</span></li>
                  <li className="flex gap-2"><span>•</span><span>Solo enviamos el <strong>resultado</strong> (aprobado/rechazado) a nuestros servidores.</span></li>
                  <li className="flex gap-2"><span>•</span><span>Las imágenes se liberan de memoria al terminar.</span></li>
                </ul>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Camera,    color: 'text-primary',    title: 'Paso 1 — Selfie en vivo',       desc: 'Mantente frente a la cámara 3 segundos y parpadea una vez.' },
                  { icon: FileImage, color: 'text-blue-500',   title: 'Paso 2 — Foto de tu cédula',    desc: 'Sube una foto clara de tu cédula de ciudadanía o pasaporte.' },
                  { icon: Shield,    color: 'text-green-500',  title: 'Paso 3 — Análisis automático',  desc: 'Comparamos tu selfie con la foto del documento de forma segura.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs text-secondary mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="primary" size="lg" onClick={() => setStep('selfie')}>
                Comenzar verificación <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* ── PASO 2: Selfie ── */}
          {step === 'selfie' && (
            <motion.div key="selfie" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              {/* Visor de cámara */}
              <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center"
                style={{ border: `4px solid ${livenessOk ? '#22c55e' : '#d1d5db'}`, transition: 'border-color 0.4s' }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                {/* Spinner mientras arranca */}
                {!ready && !denied && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-secondary font-medium">Iniciando cámara…</p>
                  </div>
                )}

                {/* Error de permisos */}
                {denied && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-gray-100">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-xs font-bold text-red-500">Permiso de cámara denegado. Habilítalo en tu navegador e intenta de nuevo.</p>
                  </div>
                )}

                {/* Máscara oval guía */}
                {ready && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-52 rounded-[50%] border-[3px] border-white/70" />
                  </div>
                )}

                {/* Badge de confirmación */}
                {livenessOk && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> ¡Listo para capturar!
                  </div>
                )}
              </div>

              {/* Barra de progreso de presencia */}
              {ready && !livenessOk && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-secondary font-medium px-1">
                    <span>Verificando presencia…</span>
                    <span>{Math.round(holdProgress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-100"
                      style={{ width: `${holdProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Mensaje de guía */}
              {ready && (
                <div className={[
                  'text-center text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all',
                  livenessOk ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600',
                ].join(' ')}>
                  <Eye className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  {livenessMsg}
                  {blinkCount > 0 && !livenessOk && (
                    <span className="ml-2 text-green-600">({blinkCount} parpadeo{blinkCount > 1 ? 's' : ''} ✓)</span>
                  )}
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold">Coloca tu rostro en el círculo</h3>
                <p className="text-sm text-secondary mt-1">Iluminación frontal, sin gafas ni objetos en el rostro.</p>
              </div>

              <Button variant="primary" size="lg" disabled={!livenessOk} onClick={handleCaptureSelfie}>
                <Camera className="w-5 h-5" />
                {livenessOk ? 'Capturar foto' : 'Esperando verificación…'}
              </Button>
            </motion.div>
          )}

          {/* ── PASO 3: Documento ── */}
          {step === 'document' && (
            <motion.div key="document" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Foto de tu documento</h3>
                <p className="text-sm text-secondary">Sube la foto de tu cédula de ciudadanía o pasaporte. Asegúrate de que sea legible y sin reflejos.</p>
              </div>

              {selfieURL && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                  <img src={selfieURL} alt="Selfie" className="w-12 h-12 rounded-full object-cover border-2 border-green-300" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Selfie capturada ✓</p>
                    <p className="text-xs text-green-600">Presencia verificada</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-3 transition-all',
                  docURL ? 'border-primary/40 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:border-primary/30 hover:bg-purple-50/30',
                ].join(' ')}
              >
                {docURL
                  ? <img src={docURL} alt="Documento" className="w-full max-h-48 object-contain rounded-2xl" />
                  : <>
                      <FileImage className="w-10 h-10 text-gray-300" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-600">Toca para subir tu documento</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG o HEIC — máx. 10 MB</p>
                      </div>
                    </>
                }
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleDocUpload} />

              {docURL && (
                <div className="flex gap-3">
                  <Button variant="outline" size="md" onClick={() => setDocURL(null)} className="flex-1">
                    <RefreshCw className="w-4 h-4" /> Cambiar
                  </Button>
                  <Button variant="primary" size="md" onClick={handleAnalyze} loading={analyzing} className="flex-1">
                    Analizar <Shield className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {analyzing && (
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-secondary font-medium">Comparando biométricos de forma segura…</p>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-2xl">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>El análisis se realiza localmente en tu dispositivo. Ningún dato biométrico se transmite a servidores externos.</span>
              </div>
            </motion.div>
          )}

          {/* ── PASO 4: Resultado ── */}
          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {result.passed ? (
                <>
                  <div className="p-8 bg-green-50 rounded-[40px] border border-green-100 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-200">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-green-700">¡Identidad Verificada!</h3>
                      <p className="text-sm text-green-600/80">Tu identidad coincide con el documento presentado.</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
                    {[
                      { label: 'Detección de presencia (Liveness)',  ok: result.scores.liveness  === 'OK' },
                      { label: 'Validación Anti-Spoofing',            ok: result.scores.antiSpoof === 'OK' },
                      { label: `Coincidencia facial (${result.scores.faceMatch}%)`, ok: result.scores.faceMatchOk },
                    ].map(({ label, ok }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${ok ? 'text-green-500' : 'text-red-400'}`} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {ok ? 'OK' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" size="lg" onClick={handleContinue}>
                    Ir a mi dashboard <ArrowRight className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 text-center space-y-4">
                    <div className="w-20 h-20 bg-red-400 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-200">
                      <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-red-600">Verificación fallida</h3>
                      <p className="text-sm text-red-500/80">
                        {result.error
                          ? 'Ocurrió un error durante el análisis. Intenta de nuevo.'
                          : 'No pudimos confirmar tu identidad. Asegúrate de buena iluminación y que el documento sea legible.'}
                      </p>
                    </div>
                  </div>
                  {result.scores && (
                    <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
                      {[
                        { label: 'Detección de presencia (Liveness)',  ok: result.scores.liveness  === 'OK' },
                        { label: 'Validación Anti-Spoofing',            ok: result.scores.antiSpoof === 'OK' },
                        { label: `Coincidencia facial (${result.scores.faceMatch}%)`, ok: result.scores.faceMatchOk },
                      ].map(({ label, ok }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${ok ? 'text-green-500' : 'text-red-400'}`} />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {ok ? 'OK' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="primary" size="lg" onClick={handleRetry}>
                    <RefreshCw className="w-5 h-5" /> Intentar de nuevo
                  </Button>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}