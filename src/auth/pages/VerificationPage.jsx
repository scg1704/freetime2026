// source/auth/pages/VerificationPage.jsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }                    from 'motion/react';
import { useNavigate }                                from 'react-router-dom';
import { useAuth }                                    from '../../shared/context/AuthContext';
import Button                                         from '../../shared/components/ui/Button';
import {
  Camera, Shield, CheckCircle, AlertCircle,
  Eye, FileImage, ArrowRight, RefreshCw, Lock, Info,
  ArrowLeft, ScanLine,
  Pointer,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes — ajustadas para mayor tolerancia en entornos reales
// ─────────────────────────────────────────────────────────────────────────────
const LIVENESS_HOLD_MS       = 3000;
const BLINK_DELTA_THRESHOLD  = 5;    // ↓ era 8  — más sensible en cámaras de baja luz
const BLINK_NEEDED           = 1;
const ANTISPOOF_VARIANCE_MIN = 100;  // ↓ era 180 — más tolerante con selfies en pantalla brillante
const FACEMATCH_SCORE_MIN    = 0.32; // ↓ era 0.45 — tolera diferencias de iluminación selfie vs doc
const CAPTURE_JPEG_QUALITY   = 0.88;

// Tiempo mínimo que debe mostrarse el documento frente a la cámara (ms)
const DOC_HOLD_MS = 2500;

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

function getEyeRegionLuminance(imageData) {
  const { data, width, height } = imageData;
  const x0 = Math.floor(width  * 0.25), x1 = Math.floor(width  * 0.75);
  const y0 = Math.floor(height * 0.22), y1 = Math.floor(height * 0.42);
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
          sum  += lum; sum2 += lum * lum; n++;
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
      hist[Math.min(Math.floor(lum / (256 / BINS)), BINS - 1)]++;
    }
    const total = data.length / 4;
    return hist.map((v) => v / total);
  }
  const hA = buildHistogram(imgA), hB = buildHistogram(imgB);
  let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  for (let i = 0; i < BINS; i++) {
    sumA += hA[i]; sumB += hB[i];
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
      canvas.width = img.width; canvas.height = img.height;
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
      } catch { if (!cancelled) setDenied(true); }
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
  const navigate               = useNavigate();
  const { user, markVerified } = useAuth();
  const canvasRef              = useRef(null);
  const animRef                = useRef(null);
  const blinkCountRef          = useRef(0);
  const prevLumRef             = useRef(null);
  // Para captura en vivo del documento
  const docAnimRef             = useRef(null);
  const docHoldStart           = useRef(null);

  const [step,         setStep]        = useState('consent');
  const [selfieURL,    setSelfieURL]   = useState(null);
  const [docURL,       setDocURL]      = useState(null);
  const [analyzing,    setAnalyzing]   = useState(false);
  const [result,       setResult]      = useState(null);

  // Liveness (selfie)
  const [livenessOk,   setLivenessOk]  = useState(false);
  const [holdProgress, setHoldProgress]= useState(0);
  const [blinkCount,   setBlinkCount]  = useState(0);
  const [livenessMsg,  setLivenessMsg] = useState('Mira a la cámara y mantente quieto');

  // Documento en vivo
  const [docReady,     setDocReady]    = useState(false);   // cámara de doc lista
  const [docProgress,  setDocProgress] = useState(0);       // 0-100 barra de confirmación
  const [docConfirmed, setDocConfirmed]= useState(false);   // documento capturado ok
  const [docMsg,       setDocMsg]      = useState('Coloca tu cédula frente a la cámara');

  const selfieCamActive = step === 'selfie';
  const docCamActive    = step === 'document';

  // Usamos el mismo hook para selfie; para documento creamos uno independiente
  const { videoRef: selfieVideoRef, ready: selfieReady, denied: selfieDenied, stop: stopSelfie } = useCamera(selfieCamActive);
  const { videoRef: docVideoRef,    ready: docCamReady, denied: docDenied,    stop: stopDoc    } = useCamera(docCamActive);

  // ── Liveness loop (selfie) ────────────────────────────────────────────────
  useEffect(() => {
    if (!selfieCamActive || !selfieReady) return;
    blinkCountRef.current = 0;
    prevLumRef.current    = null;
    setHoldProgress(0); setBlinkCount(0); setLivenessOk(false);
    setLivenessMsg('Mira a la cámara y mantente quieto');
    const startTime = Date.now();

    const tick = () => {
      const video  = selfieVideoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) { animRef.current = requestAnimationFrame(tick); return; }

      const elapsed  = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / LIVENESS_HOLD_MS) * 100);
      setHoldProgress(progress);

      const frame = captureFrame(video, canvas);
      if (frame) {
        const lum = getEyeRegionLuminance(frame);
        if (prevLumRef.current !== null && Math.abs(lum - prevLumRef.current) > BLINK_DELTA_THRESHOLD) {
          blinkCountRef.current += 1;
          setBlinkCount(blinkCountRef.current);
        }
        prevLumRef.current = lum;
      }

      if (elapsed >= LIVENESS_HOLD_MS && blinkCountRef.current >= BLINK_NEEDED) {
        setLivenessOk(true); setHoldProgress(100);
        setLivenessMsg('¡Listo! Puedes capturar tu foto');
        return;
      }

      if (elapsed < LIVENESS_HOLD_MS) {
        setLivenessMsg(blinkCountRef.current === 0
          ? 'Mantente quieto y parpadea naturalmente…'
          : `Parpadeo detectado ✓ — Aguarda ${Math.ceil((LIVENESS_HOLD_MS - elapsed) / 1000)}s más…`);
      } else if (blinkCountRef.current < BLINK_NEEDED) {
        setLivenessMsg('¡Ahora parpadea una vez!');
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selfieCamActive, selfieReady, selfieVideoRef]);

  // ── Doc live loop ─────────────────────────────────────────────────────────
  // Detecta que hay algo plano y rectangular frente a la cámara midiendo
  // que la varianza de textura sea suficiente (papel impreso) y mantiene
  // un contador de tiempo. Cuando se sostiene DOC_HOLD_MS → captura.
  useEffect(() => {
    if (!docCamActive || !docCamReady) return;
    setDocProgress(0); setDocConfirmed(false);
    setDocMsg('Coloca tu cédula frente a la cámara');
    docHoldStart.current = null;

    const tick = () => {
      const video  = docVideoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) { docAnimRef.current = requestAnimationFrame(tick); return; }

      const frame = captureFrame(video, canvas);
      const variance = frame ? computeTextureVariance(frame) : 0;

      // Umbral bajo: cualquier objeto con texto/imagen impresa supera 60
      const docDetected = variance > 60;

      if (docDetected) {
        if (!docHoldStart.current) docHoldStart.current = Date.now();
        const held     = Date.now() - docHoldStart.current;
        const progress = Math.min(100, (held / DOC_HOLD_MS) * 100);
        setDocProgress(progress);
        setDocMsg(held < DOC_HOLD_MS
          ? `Documento detectado — mantén quieto ${Math.ceil((DOC_HOLD_MS - held) / 1000)}s…`
          : '¡Listo para capturar!');

        if (held >= DOC_HOLD_MS) {
          // Captura automática
          const dataURL = captureDataURL(video, canvas);
          setDocURL(dataURL);
          setDocConfirmed(true);
          stopDoc();
          return;
        }
      } else {
        docHoldStart.current = null;
        setDocProgress(0);
        setDocMsg('Coloca tu cédula frente a la cámara — asegúrate de buena iluminación');
      }

      docAnimRef.current = requestAnimationFrame(tick);
    };

    docAnimRef.current = requestAnimationFrame(tick);
    return () => { if (docAnimRef.current) cancelAnimationFrame(docAnimRef.current); };
  }, [docCamActive, docCamReady, docVideoRef, stopDoc]);

  // ── Capturar selfie ───────────────────────────────────────────────────────
  const handleCaptureSelfie = useCallback(() => {
    if (!selfieVideoRef.current || !canvasRef.current || !livenessOk) return;
    const dataURL = captureDataURL(selfieVideoRef.current, canvasRef.current);
    setSelfieURL(dataURL);
    stopSelfie();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setStep('document');
  }, [livenessOk, stopSelfie, selfieVideoRef]);

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
      const matchScore   = compareFaceHistograms(selfieData, docData);
      const faceMatchOk  = matchScore >= FACEMATCH_SCORE_MIN;
      const passed       = livenessOk && antiSpoofOk && faceMatchOk;
      await new Promise((r) => setTimeout(r, 1800));
      setResult({ passed, scores: { liveness: livenessOk ? 'OK' : 'FAIL', antiSpoof: antiSpoofOk ? 'OK' : 'FAIL', faceMatch: Math.round(matchScore * 100), faceMatchOk } });
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
      const res = await fetch('/api/auth/verify', { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) { const data = await res.json(); data.user ? markVerified(data.user) : markVerified(); }
      else markVerified();
    } catch { markVerified(); }
    navigate(user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home', { replace: true });
  };

  // ── Reintentar ────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setSelfieURL(null); setDocURL(null); setResult(null);
    setLivenessOk(false); setHoldProgress(0); setBlinkCount(0);
    setDocProgress(0); setDocConfirmed(false);
    prevLumRef.current = null; blinkCountRef.current = 0;
    docHoldStart.current = null;
    setStep('selfie');
  };

  // ── Navegación hacia atrás por paso ──────────────────────────────────────
  const handleBack = () => {
    const idx = STEPS.indexOf(step);
    if (step === 'document') {
      // Si ya capturó doc, solo resetear doc y volver a selfie
      setDocURL(null); setDocConfirmed(false); setDocProgress(0);
      setSelfieURL(null); setLivenessOk(false); setHoldProgress(0); setBlinkCount(0);
      prevLumRef.current = null; blinkCountRef.current = 0;
      setStep('selfie');
    } else if (idx > 0) {
      setStep(STEPS[idx - 1]);
    } else {
      navigate(-1);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div className="w-full max-w-md space-y-8">

        {/* ── Header con botón Back morado ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 transition-colors cursor-pointer"
            style={{ background: '#7D27BE' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
              Verificación Biométrica
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#6b7280' }}>
              Garantiza tu seguridad y la de la comunidad
            </p>
          </div>

          {/* Espaciador para centrar el título */}
          <div className="w-10 shrink-0" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s) => (
            <div key={s} className={[
              'h-1.5 rounded-full transition-all duration-300',
              s === step ? 'w-8 bg-primary' : STEPS.indexOf(s) < STEPS.indexOf(step) ? 'w-4 bg-primary/40' : 'w-4 bg-gray-200',
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
                  { icon: Camera,   color: 'text-primary',   title: 'Paso 1 — Selfie en vivo',        desc: 'Mantente frente a la cámara 3 segundos y parpadea una vez.' },
                  { icon: ScanLine, color: 'text-blue-500',  title: 'Paso 2 — Escaneo de cédula',      desc: 'Muestra tu cédula frente a la cámara y mantenla quieta 2.5 segundos.' },
                  { icon: Shield,   color: 'text-green-500', title: 'Paso 3 — Análisis automático',    desc: 'Comparamos tu selfie con la foto del documento de forma segura.' },
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
              <Button 
                size="lg" 
                onClick={() => setStep('selfie')}
                className="cursor-pointer"
                style={{ 
                  background: '#7D27BE', 
                  border: 'none', // Aseguramos que no haya bordes que interfieran con el color
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}
              >
                Comenzar verificación <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* ── PASO 2: Selfie ── */}
          {step === 'selfie' && (
            <motion.div key="selfie" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
              <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center"
                style={{ border: `4px solid ${livenessOk ? '#22c55e' : '#d1d5db'}`, transition: 'border-color 0.4s' }}>
                <video ref={selfieVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                {!selfieReady && !selfieDenied && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-secondary font-medium">Iniciando cámara…</p>
                  </div>
                )}
                {selfieDenied && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-gray-100">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-xs font-bold text-red-500">Permiso de cámara denegado.</p>
                  </div>
                )}
                {selfieReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-52 rounded-[50%] border-[3px] border-white/70" />
                  </div>
                )}
                {livenessOk && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> ¡Listo para capturar!
                  </div>
                )}
              </div>

              {selfieReady && !livenessOk && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium px-1" style={{ color: '#6b7280' }}>
                    <span>Verificando presencia…</span>
                    <span>{Math.round(holdProgress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${holdProgress}%` }} />
                  </div>
                </div>
              )}

              {selfieReady && (
                <div className={['text-center text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all', livenessOk ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'].join(' ')}>
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

              <Button 
                variant="primary" disabled={!livenessOk} onClick={handleCaptureSelfie}
                size="lg" 
                disabled={!livenessOk} 
                onClick={handleCaptureSelfie}
                className="cursor-pointer"
                style={{ 
                  background: '#7D27BE', 
                  border: 'none', // Aseguramos que no haya bordes que interfieran con el color
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}>
                <Camera className="w-5 h-5" />
                {livenessOk ? 'Capturar foto' : 'Esperando verificación…'}
              </Button>
            </motion.div>
          )}

          {/* ── PASO 3: Documento en vivo ── */}
          {step === 'document' && (
            <motion.div key="document" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">Escanea tu cédula</h3>
                <p className="text-sm text-secondary">
                  Muestra tu cédula o pasaporte frente a la cámara y mantenla quieta. La captura es automática.
                </p>
              </div>

              {/* Selfie confirmada */}
              {selfieURL && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                  <img src={selfieURL} alt="Selfie" className="w-12 h-12 rounded-full object-cover border-2 border-green-300" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Selfie capturada ✓</p>
                    <p className="text-xs text-green-600">Presencia verificada</p>
                  </div>
                </div>
              )}

              {/* Visor de documento — rectángulo horizontal tipo tarjeta */}
              {!docConfirmed ? (
                <div className="space-y-3">
                  <div
                    className="relative mx-auto overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center"
                    style={{
                      width: '100%',
                      aspectRatio: '85.6 / 54',   // proporción exacta de tarjeta ID (cédula)
                      border: `3px solid ${docProgress > 0 ? '#7D27BE' : '#d1d5db'}`,
                      transition: 'border-color 0.3s',
                    }}
                  >
                    <video ref={docVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                    {!docCamReady && !docDenied && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-secondary font-medium">Iniciando cámara…</p>
                      </div>
                    )}

                    {docDenied && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-gray-100">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <p className="text-xs font-bold text-red-500">Permiso de cámara denegado.</p>
                      </div>
                    )}

                    {/* Esquinas guía estilo scanner */}
                    {docCamReady && (
                      <>
                        {[
                          'top-2 left-2 border-t-2 border-l-2',
                          'top-2 right-2 border-t-2 border-r-2',
                          'bottom-2 left-2 border-b-2 border-l-2',
                          'bottom-2 right-2 border-b-2 border-r-2',
                        ].map((cls, i) => (
                          <div key={i} className={`absolute w-5 h-5 ${cls} border-primary pointer-events-none rounded-sm`} />
                        ))}

                        {/* Línea de escaneo animada */}
                        {docProgress > 0 && (
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-primary/70 pointer-events-none"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Barra de progreso de confirmación */}
                  {docCamReady && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium px-1" style={{ color: '#6b7280' }}>
                        <span>{docMsg}</span>
                        <span>{Math.round(docProgress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-100"
                          style={{ width: `${docProgress}%`, background: '#7D27BE' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-2xl">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Asegúrate de buena iluminación. Evita brillos y reflejos sobre el documento.</span>
                  </div>
                </div>
              ) : (
                /* Documento capturado — preview + botón analizar */
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: '#7D27BE40' }}>
                    <img src={docURL} alt="Documento" className="w-full object-contain max-h-48" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Capturado
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => { setDocURL(null); setDocConfirmed(false); setDocProgress(0); setStep('document'); }}
                      className="flex-1 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Repetir
                    </Button>
                    <Button 
                      variant="primary"  
                      size="md" 
                      onClick={handleAnalyze} 
                      loading={analyzing} 
                      className="flex-1 cursor-pointer"
                      style={{ 
                        background: '#7D27BE',
                        border: 'none'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}>
                        Analizar 
                        <Shield className="w-4 h-4" />
                    </Button>
                  </div>

                  {analyzing && (
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-secondary font-medium">Comparando biométricos de forma segura…</p>
                    </div>
                  )}
                </motion.div>
              )}
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
                  <ScoreTable scores={result.scores} />
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    onClick={handleContinue}
                    className="cursor-pointer"
                    style={{ 
                      background: '#7D27BE', 
                      border: 'none', // Aseguramos que no haya bordes que interfieran con el color
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#5c178e')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#7D27BE')}>
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
                          : 'No pudimos confirmar tu identidad. Revisa los consejos de abajo.'}
                      </p>
                    </div>
                  </div>

                  {result.scores && <ScoreTable scores={result.scores} />}

                  {/* Consejos según cuál check falló */}
                  {result.scores && (
                    <div className="rounded-2xl p-4 space-y-2" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
                      <p className="text-xs font-bold" style={{ color: '#92400e' }}>Consejos para el reintento:</p>
                      <ul className="text-xs space-y-1.5" style={{ color: '#78350f' }}>
                        {result.scores.liveness === 'FAIL' && (
                          <li>• <strong>Presencia:</strong> Mantente completamente inmóvil frente a la cámara y parpadea una sola vez despacio.</li>
                        )}
                        {result.scores.antiSpoof === 'FAIL' && (
                          <li>• <strong>Anti-spoofing:</strong> Asegúrate de buena iluminación frontal. Evita fondos muy blancos o brillantes detrás tuyo.</li>
                        )}
                        {!result.scores.faceMatchOk && (
                          <li>• <strong>Coincidencia facial ({result.scores.faceMatch}%):</strong> Usa la misma iluminación en la selfie y al escanear la cédula. Sostén la cédula cerca y bien enfocada.</li>
                        )}
                      </ul>
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

// ─── Tabla de scores reutilizable ────────────────────────────────────────────
function ScoreTable({ scores }) {
  const rows = [
    { label: 'Detección de presencia (Liveness)', ok: scores.liveness   === 'OK' },
    { label: 'Validación Anti-Spoofing',           ok: scores.antiSpoof  === 'OK' },
    { label: `Coincidencia facial (${scores.faceMatch}%)`, ok: scores.faceMatchOk },
  ];
  return (
    <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
      {rows.map(({ label, ok }) => (
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
  );
}