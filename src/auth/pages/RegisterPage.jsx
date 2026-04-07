import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Lock, Phone, ArrowRight, CheckCircle2,
  ArrowLeft, Eye, EyeOff, Camera, ChevronDown, Calendar,
  MapPin, X, Check, AlertCircle, MapPinned, FileText
} from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { useAuth } from '../../shared/context/AuthContext';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import RoleCard from '../components/RoleCard';
import { DEPARTMENTS, getMunicipalities } from '../../shared/lib/colombiaLocations';

// ─────────────────────────────────────────────
// Image compressor – resizes to max 400px and
// outputs a JPEG base64 string under ~150 KB
// ─────────────────────────────────────────────
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// Password strength checker
// ─────────────────────────────────────────────
function getPasswordStrength(password) {
  const rules = [
    { id: 'length',  label: 'Mínimo 8 caracteres',                   test: (p) => p.length >= 8 },
    { id: 'upper',   label: 'Al menos 1 mayúscula',                  test: (p) => /[A-Z]/.test(p) },
    { id: 'number',  label: 'Al menos 1 número',                     test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'Al menos 1 carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];
  const passed = rules.filter((r) => r.test(password)).length;
  const level = passed === 0 ? 'none' : passed <= 1 ? 'weak' : passed <= 2 ? 'fair' : passed === 3 ? 'good' : 'strong';
  return { rules, passed, level };
}

const STRENGTH_CONFIG = {
  none:   { label: '',        color: 'bg-gray-200',   text: 'text-gray-400',   bars: 0 },
  weak:   { label: 'Débil',   color: 'bg-red-500',    text: 'text-red-500',    bars: 1 },
  fair:   { label: 'Regular', color: 'bg-orange-400', text: 'text-orange-400', bars: 2 },
  good:   { label: 'Buena',   color: 'bg-yellow-400', text: 'text-yellow-500', bars: 3 },
  strong: { label: 'Fuerte',  color: 'bg-green-500',  text: 'text-green-500',  bars: 4 },
};

function PasswordStrengthBar({ password }) {
  const { rules, level } = getPasswordStrength(password);
  const cfg = STRENGTH_CONFIG[level];
  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 mt-2"
    >
      <div className="flex gap-1.5 items-center">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= cfg.bars ? cfg.color : 'bg-gray-200'
            )}
          />
        ))}
        {level !== 'none' && (
          <span className={cn('text-xs font-bold ml-1 shrink-0', cfg.text)}>
            {cfg.label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-1.5">
            {rule.test(password) ? (
              <Check className="w-3 h-3 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-gray-300 shrink-0" />
            )}
            <span className={cn(
              'text-[10px] font-medium leading-tight',
              rule.test(password) ? 'text-green-600' : 'text-gray-400'
            )}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Reusable required-checkbox row
// ─────────────────────────────────────────────
function RequiredCheckbox({ id, checked, onChange, icon: Icon, iconColor, children }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all select-none',
        checked
          ? 'bg-primary/5 border-primary/30'
          : 'bg-gray-50 border-transparent hover:border-gray-200'
      )}
    >
      {/* Custom visual checkbox */}
      <div
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
          checked ? 'bg-primary border-primary' : 'bg-white border-gray-300'
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      {/* Hidden native checkbox for accessibility */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className="flex items-start gap-2">
        {Icon && <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', iconColor)} />}
        <span className="text-sm text-secondary leading-snug">{children}</span>
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────
// Phone input – Colombia (+57) formatted
// ─────────────────────────────────────────────
function PhoneInput({ value, onChange }) {
  const handleChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6)      formatted = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
    else if (digits.length > 3) formatted = digits.slice(0, 3) + '-' + digits.slice(3);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Teléfono</label>
      <div className="flex items-stretch gap-2">
        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border border-gray-200 rounded-2xl shrink-0">
          <span className="text-base leading-none">🇨🇴</span>
          <span className="text-sm font-bold text-gray-600">+57</span>
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            placeholder="310-000-0000"
            value={value}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium tracking-wide"
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-400 font-medium pl-1">
        Solo números de Colombia · Formato: 310-000-0000
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Location selector – Departamento + Municipio
// ─────────────────────────────────────────────
function LocationSelector({ department, municipality, onDeptChange, onMunChange }) {
  const municipalities = getMunicipalities(department);

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" /> Ubicación
      </label>
      <div className="relative">
        <select
          value={department}
          onChange={(e) => { onDeptChange(e.target.value); onMunChange(''); }}
          className={cn(
            'w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            'transition-all appearance-none pr-10 font-medium',
            !department && 'text-gray-400'
          )}
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
              className={cn(
                'w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl',
                'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
                'transition-all appearance-none pr-10 font-medium',
                !municipality && 'text-gray-400'
              )}
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

// ─────────────────────────────────────────────
// Birthday input – validates 18+
// ─────────────────────────────────────────────
function BirthdayInput({ value, onChange, error }) {
  const maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" /> Fecha de Nacimiento
      </label>
      <input
        type="date"
        max={maxDate}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-4 py-4 bg-gray-50 border rounded-2xl',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium',
          error ? 'border-red-300 bg-red-50' : 'border-gray-100'
        )}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium pl-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      <p className="text-[10px] text-gray-400 font-medium pl-1">
        Debes ser mayor de 18 años para registrarte.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile photo uploader with compression
// ─────────────────────────────────────────────
function ProfilePhotoUploader({ preview, onChange }) {
  const inputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
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
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-24 h-24 rounded-3xl overflow-hidden border-2 border-dashed transition-all hover:scale-105 active:scale-95',
            preview ? 'border-primary/40' : 'border-gray-200 bg-gray-50 flex items-center justify-center'
          )}
        >
          {compressing ? (
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <Camera className="w-7 h-7 text-primary/40" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-primary/40">...</span>
            </div>
          ) : preview ? (
            <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1">
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
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
        >
          <Camera className="w-3 h-3" />
        </button>
      </div>

      <p className="text-[10px] text-gray-400 font-medium text-center">
        Foto de perfil (opcional)<br />Se comprime automáticamente
      </p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Step dots
// ─────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            i + 1 === current ? 'w-8 bg-primary' : i + 1 < current ? 'w-4 bg-primary/40' : 'w-4 bg-gray-200'
          )}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main RegisterPage
// ─────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);

  // Step 2
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsChecked, setTerms]        = useState(false);
  const [locationChecked, setLocation]  = useState(false);

  // Step 3
  const [name, setName]                     = useState('');
  const [lastName, setLastName]             = useState('');
  const [phone, setPhone]                   = useState('');
  const [department, setDepartment]         = useState('');
  const [municipality, setMunicipality]     = useState('');
  const [birthdate, setBirthdate]           = useState('');
  const [birthdateError, setBirthdateError] = useState('');
  const [photo, setPhoto]                   = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Validations ──────────────────────────────
  const validateStep2 = () => {
    if (!email.trim()) return 'El email es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no es válido.';
    const { passed } = getPasswordStrength(password);
    if (passed < 4) return 'La contraseña no cumple todos los requisitos de seguridad.';
    if (!termsChecked)    return 'Debes aceptar los Términos y Condiciones para continuar.';
    if (!locationChecked) return 'Debes comprometerte a compartir tu ubicación para continuar.';
    return null;
  };

  const validateStep3 = () => {
    if (!name.trim())     return 'El nombre es requerido.';
    if (!lastName.trim()) return 'El apellido es requerido.';
    if (phone.replace(/\D/g, '').length < 10) return 'Ingresa un número de teléfono válido (10 dígitos).';
    if (!department || !municipality) return 'Selecciona tu departamento y municipio.';
    if (!birthdate) return 'La fecha de nacimiento es requerida.';
    const dob   = new Date(birthdate);
    const today = new Date();
    const age   = today.getFullYear() - dob.getFullYear() -
      (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    if (age < 18) {
      setBirthdateError('Debes ser mayor de 18 años para registrarte.');
      return 'Debes ser mayor de 18 años.';
    }
    return null;
  };

  const handleStep2 = () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBirthdateError('');
    const err = validateStep3();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        name,
        lastName,
        phone: `+57${phone.replace(/\D/g, '')}`,
        city: `${municipality}, ${department}`,
        department,
        municipality,
        birthdate,
        role,
        // already compressed to ~20-40 KB JPEG base64
        photoBase64: photo?.preview || null,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al crear la cuenta.');
        return;
      }

      login(data.user);
      navigate('/verification');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    if (step > 1) setStep((s) => s - 1);
    else navigate(-1);
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button
          onClick={goBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1"><StepDots current={step} total={3} /></div>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter text-primary">FREETIME</h1>
            <p className="text-secondary text-sm mt-1">
              {step === 1 ? '¿Cómo quieres usar FreeTime?' : step === 2 ? 'Crea tu cuenta' : 'Información Personal'}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100 flex items-center gap-2 justify-center"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* ── STEP 1: Role ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <RoleCard
                  selected={role === 'FULLTIMER'}
                  onClick={() => setRole('FULLTIMER')}
                  title="FullTimer"
                  description="Necesito ayuda con tareas y quiero contratar expertos."
                />
                <RoleCard
                  selected={role === 'FREETIMER'}
                  onClick={() => setRole('FREETIMER')}
                  title="FreeTimer"
                  description="Tengo tiempo y habilidades para ayudar a otros."
                />
              </div>
              <Button variant="secondary" size="lg" disabled={!role} onClick={() => setStep(2)} className="text-white bg-primary hover:bg-[#5c178e] transition-all shadow-lg shadow-primary/20">
                Continuar <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* ── STEP 2: Account ── */}
          {step === 2 && (
            <div className="space-y-5">
              <InputField
                label="Email"
                type="email"
                placeholder="tu@email.com"
                icon={<Mail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password with show/hide */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={password} />
              </div>

              {/* Required checkboxes */}
              <div className="space-y-3 pt-1">
                <RequiredCheckbox
                  id="terms"
                  checked={termsChecked}
                  onChange={setTerms}
                  icon={FileText}
                  iconColor="text-primary"
                >
                  Acepto los{' '}
                  <button
                    type="button"
                    className="text-primary font-bold underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Términos y Condiciones
                  </button>
                  {' '}y la Política de Privacidad.
                </RequiredCheckbox>

                <RequiredCheckbox
                  id="location"
                  checked={locationChecked}
                  onChange={setLocation}
                  icon={MapPinned}
                  iconColor="text-blue-500"
                >
                  Me comprometo a compartir mi ubicación cuando realice una tarea.
                </RequiredCheckbox>

                {(!termsChecked || !locationChecked) && (
                  <p className="text-[11px] text-gray-400 font-medium text-center pt-1">
                    Ambas confirmaciones son obligatorias para continuar.
                  </p>
                )}
              </div>

              {/* Button disabled until both checked */}
              <Button
                variant="secondary"
                size="lg"
                disabled={!termsChecked || !locationChecked}
                onClick={handleStep2}
                className="text-white bg-primary hover:bg-[#5c178e] transition-all shadow-lg shadow-primary/20"
              >
                Siguiente <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* ── STEP 3: Personal info ── */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-5 pb-6">
              <div className="flex justify-center pt-2 pb-1">
                <ProfilePhotoUploader preview={photo?.preview} onChange={setPhoto} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nombre"   placeholder="Juan"  icon={<User />} value={name}     onChange={(e) => setName(e.target.value)} />
                <InputField label="Apellido" placeholder="Pérez" icon={<User />} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>

              <PhoneInput value={phone} onChange={setPhone} />

              <LocationSelector
                department={department}
                municipality={municipality}
                onDeptChange={setDepartment}
                onMunChange={setMunicipality}
              />

              <BirthdayInput
                value={birthdate}
                onChange={(val) => { setBirthdate(val); setBirthdateError(''); }}
                error={birthdateError}
              />

              <Button variant="primary" size="lg" loading={loading} type="submit" className="text-white bg-primary hover:bg-[#5c178e] transition-all shadow-lg shadow-primary/20">
                Finalizar Registro
              </Button>
            </form>
          )}

          <p className="text-center mt-6 text-secondary text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}