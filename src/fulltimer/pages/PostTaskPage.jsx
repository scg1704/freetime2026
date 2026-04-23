import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import {
  Send, DollarSign, Calendar, MapPin, Briefcase,
  FileText, Tag, Clock, Star, ChevronDown, AlertCircle,
  Sparkles, Shield, Users, Zap, CheckCircle2, Search, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

// ─── Utils ────────────────────────────────────────────────────────────────────
function cn(...classes) { return classes.filter(Boolean).join(' '); }

// ─── Datos ────────────────────────────────────────────────────────────────────
const CATEGORIES = {
  Hogar:         ['Limpieza', 'Reparaciones', 'Pintura', 'Jardinería', 'Plomería', 'Electricidad', 'Mudanza', 'Otros'],
  Mascotas:      ['Paseo', 'Guardería', 'Baño y peluquería', 'Veterinaria', 'Entrenamiento', 'Otros'],
  Tecnología:    ['Soporte técnico', 'Instalación', 'Desarrollo web', 'Diseño', 'Redes', 'Otros'],
  Educación:     ['Tutoría', 'Idiomas', 'Música', 'Matemáticas', 'Ciencias', 'Otros'],
  Mandados:      ['Compras', 'Entregas', 'Trámites', 'Filas', 'Otros'],
  Eventos:       ['Fotografía', 'Catering', 'Decoración', 'Logística', 'Otros'],
  Profesionales: ['Contabilidad', 'Legal', 'Salud', 'Consultoría', 'Otros'],
  Otros:         ['General'],
};

const LEVELS = [
  { key: 'PRINCIPIANTE', label: 'Principiante', desc: 'Sin experiencia previa' },
  { key: 'INTERMEDIO',   label: 'Intermedio',   desc: 'Experiencia básica'     },
  { key: 'EXPERTO',      label: 'Experto',       desc: 'Habilidades avanzadas' },
];

const PRIMARY       = '#7D27BE';
const PRIMARY_LIGHT = '#f3e8ff';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function CharCount({ current, max }) {
  return (
    <p style={{ color: current > max * 0.9 ? '#f97316' : '#9ca3af' }}
      className="text-xs font-semibold text-right pr-1 mt-1">
      {current}/{max}
    </p>
  );
}

function SectionDivider({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: PRIMARY_LIGHT }}>
        <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
      </div>
      <span className="text-sm font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{title}</span>
      <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
    </div>
  );
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2"
      style={{ color: '#4b5563' }}>
      {Icon && <Icon className="w-4 h-4" style={{ color: PRIMARY }} />}
      {children}
    </label>
  );
}

function LightInput({ icon: Icon, suffix, className, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />}
      <input
        {...props}
        style={{ background: '#fafafa', border: '2px solid #e5e7eb', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = PRIMARY}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        className={cn('w-full py-3.5 rounded-2xl transition-all font-medium placeholder:text-gray-400 text-sm',
          Icon ? 'pl-11' : 'pl-4', suffix ? 'pr-16' : 'pr-4', className)}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider pointer-events-none"
          style={{ color: '#9ca3af' }}>{suffix}</span>
      )}
    </div>
  );
}

function LightSelect({ icon: Icon, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10" style={{ color: '#9ca3af' }} />}
      <select value={value} onChange={onChange} disabled={disabled}
        style={{ background: '#fafafa', border: '2px solid #e5e7eb', color: value ? '#111827' : '#9ca3af', outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = PRIMARY}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        className={cn('w-full pr-10 py-3.5 rounded-2xl transition-all appearance-none font-medium cursor-pointer text-sm',
          Icon ? 'pl-11' : 'pl-4', disabled && 'opacity-40 cursor-not-allowed')}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />
    </div>
  );
}

function LightTextarea({ rows = 4, ...props }) {
  return (
    <textarea rows={rows} {...props}
      style={{ background: '#fafafa', border: '2px solid #e5e7eb', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
      onFocus={e => e.target.style.borderColor = PRIMARY}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      className="w-full px-4 py-3.5 rounded-2xl transition-all resize-none font-medium text-sm placeholder:text-gray-400"
    />
  );
}

function LevelSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LEVELS.map(level => {
        const active = value === level.key;
        return (
          <button key={level.key} type="button" onClick={() => onChange(level.key)}
            style={{ background: active ? PRIMARY : '#fafafa', border: `2px solid ${active ? PRIMARY : '#e5e7eb'}`,
              color: active ? '#fff' : '#374151', boxShadow: active ? `0 4px 14px ${PRIMARY}33` : 'none' }}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl font-bold text-xs transition-all cursor-pointer">
            <span className="font-bold text-sm">{level.label}</span>
            <span className="text-[9px] font-medium text-center leading-tight"
              style={{ color: active ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>{level.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Duration Picker ──────────────────────────────────────────────────────────
function DurationPicker({ hours, minutes, onHoursChange, onMinutesChange }) {
  const hNum = Number(hours);
  const mNum = Number(minutes);
  const hErr = hours !== '' && (hNum < 0 || hNum > 23 || !Number.isInteger(hNum));
  const mErr = minutes !== '' && (mNum < 0 || mNum > 59 || !Number.isInteger(mNum));
  const hasDuration = (hNum > 0 || mNum > 0) && !hErr && !mErr;

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Horas (0-23)</p>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />
            <input type="number" min="0" max="23" step="1" placeholder="0"
              value={hours} onChange={e => onHoursChange(e.target.value)}
              style={{ background: hErr ? '#fef2f2' : '#fafafa',
                border: `2px solid ${hErr ? '#fca5a5' : '#e5e7eb'}`,
                color: '#111827', outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => { if (!hErr) e.target.style.borderColor = PRIMARY; }}
              onBlur={e => { if (!hErr) e.target.style.borderColor = '#e5e7eb'; }}
              className="w-full pl-9 pr-12 py-3.5 rounded-2xl transition-all font-bold text-sm" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase pointer-events-none">hrs</span>
          </div>
          <AnimatePresence>
            {hErr && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[10px] text-red-400 mt-1 pl-1">Valor entre 0 y 23</motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-18px text-2xl font-black select-none" style={{ color: '#d1d5db' }}>:</div>

        <div className="flex-1">
          <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Minutos (0-59)</p>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />
            <input type="number" min="0" max="59" step="5" placeholder="0"
              value={minutes} onChange={e => onMinutesChange(e.target.value)}
              style={{ background: mErr ? '#fef2f2' : '#fafafa',
                border: `2px solid ${mErr ? '#fca5a5' : '#e5e7eb'}`,
                color: '#111827', outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => { if (!mErr) e.target.style.borderColor = PRIMARY; }}
              onBlur={e => { if (!mErr) e.target.style.borderColor = '#e5e7eb'; }}
              className="w-full pl-9 pr-12 py-3.5 rounded-2xl transition-all font-bold text-sm" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase pointer-events-none">min</span>
          </div>
          <AnimatePresence>
            {mErr && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[10px] text-red-400 mt-1 pl-1">Valor entre 0 y 59</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {hasDuration && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: PRIMARY_LIGHT }}>
            <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: PRIMARY }} />
            <p className="text-xs font-bold" style={{ color: PRIMARY }}>
              Duración total:{' '}
              {hNum > 0 ? `${hNum}h ` : ''}
              {mNum > 0 ? `${mNum}min` : ''}
              {' '}≈ {hNum * 60 + mNum} minutos
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── FIX 1 & 2: Formatea la dirección de forma más precisa ───────────────────
function formatAddress(data) {
  const a = data.address || {};

  const dept = a.state || a.region || '';
  const city =
    a.city || a.town || a.municipality || a.county ||
    a.village || a.suburb || '';
  const road   = a.road || a.pedestrian || a.footway || '';
  const number = a.house_number || '';
  const street = [road, number].filter(Boolean).join(' ');
  const neighbourhood = a.neighbourhood || a.quarter || '';

  const parts = [];
  if (dept) parts.push(dept);
  if (city && city !== dept) parts.push(city);
  if (street) {
    const streetFull = neighbourhood && neighbourhood !== city
      ? `${street}, ${neighbourhood}`
      : street;
    parts.push(streetFull);
  } else if (neighbourhood && neighbourhood !== city) {
    parts.push(neighbourhood);
  }

  return parts.length > 0 ? parts.join(' · ') : data.display_name;
}

// ─── FIX 1, 2 & 3: Map Picker mejorado con campo "Detalles de ubicación" ─────
function MapPicker({ value, locationDetails, onLocationChange, onDetailsChange }) {
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markerRef   = useRef(null);
  const debounce    = useRef(null);
  const isSelectingRef = useRef(false); // evita que el reverseGeocode sobreescriba el query activo

  const [query, setQuery]             = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [coords, setCoords]           = useState(null);
  const [mapReady, setMapReady]       = useState(false);
  const [showSugg, setShowSugg]       = useState(false);
  const [geoLoading, setGeoLoading]   = useState(false);
  const [geoError, setGeoError]       = useState('');

  // Sync query si el valor externo cambia (p.ej. al limpiar el form)
  useEffect(() => {
    if (!value) { setQuery(''); setCoords(null); }
  }, [value]);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const defaultLatLng = [4.7110, -74.0721]; // Bogotá
    // FIX MOBILE z-index: el mapa y sus tiles deben estar por debajo del navbar (z-50 = 50)
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(defaultLatLng, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Marcador morado
    const icon = L.divIcon({
      html: `
        <div style="position:relative;width:36px;height:44px;">
          <div style="
            width:36px;height:36px;background:${PRIMARY};
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            border:3px solid #fff;box-shadow:0 4px 16px ${PRIMARY}88;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-70%);
            width:10px;height:10px;background:#fff;border-radius:50%;
          "></div>
        </div>`,
      iconSize: [36, 44], iconAnchor: [18, 44], className: '',
    });

    const marker = L.marker(defaultLatLng, { icon, draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', async () => {
      const { lat, lng } = marker.getLatLng();
      setCoords({ lat, lng });
      await reverseGeocode(lat, lng);
    });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], map.getZoom(), { animate: true });
      setCoords({ lat, lng });
      await reverseGeocode(lat, lng);
    });

    leafletMap.current = map;
  }, [mapReady]);

  // FIX 1: reverseGeocode más preciso con zoom=18 para mayor detalle
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      const addr = formatAddress(data);
      setQuery(addr);
      onLocationChange(addr);
    } catch { /* silent */ }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        const lat = c.latitude;
        const lng = c.longitude;
        setCoords({ lat, lng });
        if (leafletMap.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          leafletMap.current.setView([lat, lng], 17, { animate: true });
        }
        await reverseGeocode(lat, lng);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setGeoError('Permiso denegado. Permite el acceso a tu ubicación.');
        else setGeoError('No se pudo obtener tu ubicación. Intenta manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchAddress = async (q) => {
    if (!q.trim() || q.length < 3) { setSuggestions([]); return; }
    setLoadingSuggest(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=co&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSugg(true);
    } catch { setSuggestions([]); }
    setLoadingSuggest(false);
  };

  // FIX 2: el campo de búsqueda ahora actualiza la ubicación al escribir directamente
  const handleInput = (val) => {
    setQuery(val);
    onLocationChange(val); // refleja inmediatamente el texto escrito
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => searchAddress(val), 450);
  };

  // FIX 2: al seleccionar sugerencia, el mapa se mueve Y el campo se actualiza
  const selectSuggestion = async (item) => {
    isSelectingRef.current = true;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ lat, lng });
    setSuggestions([]);
    setShowSugg(false);

    if (leafletMap.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMap.current.setView([lat, lng], 17, { animate: true });
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      const addr = formatAddress(data);
      setQuery(addr);
      onLocationChange(addr);
    } catch {
      const addr = item.display_name;
      setQuery(addr);
      onLocationChange(addr);
    }
    isSelectingRef.current = false;
  };

  const clearAll = () => {
    setQuery('');
    onLocationChange('');
    setSuggestions([]);
    setShowSugg(false);
    setCoords(null);
  };

  return (
    <div className="space-y-2">
      {/* Botón detectar ubicación */}
      <button type="button" onClick={detectLocation} disabled={geoLoading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-60 cursor-pointer w-full justify-center"
        style={{ background: PRIMARY_LIGHT, border: `1.5px solid ${PRIMARY}44`, color: PRIMARY }}
        onMouseEnter={e => { if (!geoLoading) e.currentTarget.style.background = '#e9d5ff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = PRIMARY_LIGHT; }}>
        {geoLoading
          ? <><div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${PRIMARY} transparent transparent transparent` }} />
              Detectando tu ubicación...</>
          : <><MapPin className="w-3.5 h-3.5" /> Usar mi ubicación actual</>
        }
      </button>

      <AnimatePresence>
        {geoError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs font-medium px-2 flex items-center gap-1.5" style={{ color: '#dc2626' }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {geoError}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>o busca</span>
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
      </div>

      {/* FIX 2: Campo de búsqueda — ahora bidireccional con el mapa */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Busca tu dirección en Colombia..."
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => query.length >= 3 && suggestions.length > 0 && setShowSugg(true)}
          style={{
            background: '#fafafa',
            border: `2px solid ${query ? PRIMARY : '#e5e7eb'}`,
            color: '#111827', outline: 'none', fontFamily: 'inherit',
          }}
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl transition-all font-medium text-sm placeholder:text-gray-400"
        />
        {loadingSuggest && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${PRIMARY} transparent transparent transparent` }} />
        )}
        {query && (
          <button type="button" onClick={clearAll}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            style={{ background: '#f3f4f6' }}>
            <X className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
          </button>
        )}

        {/* Sugerencias dropdown */}
        <AnimatePresence>
          {showSugg && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden"
              // FIX 5: z-index menor que el navbar (z-50), pero mayor que el mapa
              style={{ background: '#fff', border: '1.5px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 40 }}
              onMouseLeave={() => setShowSugg(false)}>
              {suggestions.map((item, i) => (
                <button key={i} type="button" onMouseDown={() => selectSuggestion(item)}
                  className="w-full text-left px-4 py-3 text-xs font-medium flex items-start gap-3 border-b last:border-0 transition-colors"
                  style={{ borderColor: '#f3f4f6', color: '#374151', background: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = PRIMARY_LIGHT}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: PRIMARY }} />
                  <span className="leading-tight line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FIX 5: Mapa con z-index controlado para no superar el navbar */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: '280px',
          border: `2px solid ${coords ? PRIMARY : '#e5e7eb'}`,
          transition: 'border-color 0.3s ease',
          boxShadow: coords ? `0 4px 20px ${PRIMARY}22` : 'none',
          // Crítico: el mapa y sus popups/controles deben estar por debajo del navbar (z-50)
          zIndex: 0,
          isolation: 'isolate',
        }}>

        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: '#fafafa' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
                style={{ border: `3px solid ${PRIMARY}`, borderTopColor: 'transparent' }} />
              <p className="text-xs font-bold" style={{ color: '#9ca3af' }}>Cargando mapa...</p>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {mapReady && !coords && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full pointer-events-none whitespace-nowrap"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
            <p className="text-[10px] font-bold text-white">
              📍 Toca el mapa o busca tu dirección arriba
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {coords && (
            <motion.div initial={{ opacity: 0, scale: 0.85, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              style={{ background: PRIMARY, boxShadow: `0 4px 14px ${PRIMARY}66`, zIndex: 5 }}>
              <CheckCircle2 className="w-3 h-3 text-white" />
              <p className="text-[9px] font-black text-white tracking-wider">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dirección seleccionada */}
      <AnimatePresence>
        {coords && query && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: PRIMARY_LIGHT, border: `1px solid ${PRIMARY}33` }}>
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: PRIMARY }} />
            <p className="text-[11px] font-semibold leading-tight" style={{ color: '#374151' }}>{query}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] font-medium" style={{ color: '#d1d5db' }}>
        © OpenStreetMap contributors · Puedes arrastrar el marcador para ajustar la posición exacta
      </p>

      {/* FIX 3: Campo de detalles de la ubicación */}
      <div>
        <FieldLabel icon={MapPin}>
          Detalles de la ubicación (Opcional)
        </FieldLabel>
        
        <LightInput
          type="text" 
          placeholder="Apto 301, Torre B, piso 3, portería norte, referencias..." 
          maxLength={200}
          value={locationDetails} 
          onChange={e => onDetailsChange(e.target.value)} 
        />
        
        <CharCount current={(locationDetails || '').length} max={200} />
      </div>
    </div>
  );
}

// ─── Animated Scroll Bar ──────────────────────────────────────────────────────
function ScrollBar({ containerRef }) {
  const [thumbH, setThumbH] = useState(40);
  const [trackH, setTrackH] = useState(400);
  const springY = useSpring(0, { stiffness: 200, damping: 30, mass: 0.5 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max <= 0 ? 0 : el.scrollTop / max;
      const ratio = el.clientHeight / el.scrollHeight;
      const tH = Math.max(ratio * el.clientHeight, 36);
      setThumbH(tH);
      setTrackH(el.clientHeight);
      springY.set(pct * (el.clientHeight - tH));
    };

    el.addEventListener('scroll', update, { passive: true });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [containerRef, springY]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-2"
      style={{ background: '#f3e8ff', zIndex: 30, borderRadius: '0 0 0 0' }}>
      <motion.div
        style={{
          y: springY,
          height: thumbH,
          width: 8,
          background: `linear-gradient(to bottom, ${PRIMARY}, #a855f7)`,
          borderRadius: 4,
          boxShadow: `0 2px 10px ${PRIMARY}66`,
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      />
    </div>
  );
}

// ─── Floating Panels (desktop) ────────────────────────────────────────────────
function ProgressPanel({ formData }) {
  const filled = [
    formData.title, formData.description, formData.category,
    formData.subcategory, formData.location, formData.date,
    (Number(formData.durationHours) > 0 || Number(formData.durationMinutes) > 0) ? '1' : '',
    formData.budget,
  ].filter(Boolean).length;
  const pct = Math.round((filled / 8) * 100);

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: '#fff', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 20px rgba(125,39,190,0.08)' }}>
      <p className="text-[17px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Progreso</p>
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#f3e8ff" strokeWidth="6" />
          <circle cx="32" cy="32" r="26" fill="none" stroke={PRIMARY} strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 26}`}
            strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black" style={{ color: PRIMARY }}>{pct}%</span>
        </div>
      </div>
      <p className="text-[12px] text-center font-semibold" style={{ color: '#9ca3af' }}>{filled}/8 campos</p>
    </div>
  );
}

// FIX 6: Rueda de progreso flotante para mobile
function FloatingProgress({ formData }) {
  const filled = [
    formData.title, formData.description, formData.category,
    formData.subcategory, formData.location, formData.date,
    (Number(formData.durationHours) > 0 || Number(formData.durationMinutes) > 0) ? '1' : '',
    formData.budget,
  ].filter(Boolean).length;
  const pct = Math.round((filled / 8) * 100);
  const [expanded, setExpanded] = useState(false);

  return (
    // z-40 para estar por encima del contenido pero por debajo del navbar (z-50)
    <div className="fixed bottom-24 right-4 z-40 md:hidden">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 rounded-2xl p-4 w-44"
            style={{
              background: '#fff',
              border: '1.5px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(125,39,190,0.15)',
            }}>
            <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>
              Progreso
            </p>
            <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>{filled}/8 campos completados</p>
            <div className="mt-2 w-full rounded-full overflow-hidden" style={{ height: 6, background: '#f3e8ff' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, ${PRIMARY}, #a855f7)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(v => !v)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        style={{
          background: '#fff',
          border: `2.5px solid ${PRIMARY}`,
          boxShadow: `0 4px 20px ${PRIMARY}44`,
        }}>
        {/* Mini rueda SVG */}
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="15" fill="none" stroke="#f3e8ff" strokeWidth="4" />
          <circle cx="20" cy="20" r="15" fill="none" stroke={PRIMARY} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 15}`}
            strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <span className="absolute text-[10px] font-black" style={{ color: PRIMARY }}>
          {pct}%
        </span>
      </motion.button>
    </div>
  );
}

function TipsPanel() {
  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: '#fff', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 20px rgba(125,39,190,0.08)' }}>
      <p className="text-[17px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
        <Sparkles className="w-5 h-5" style={{ color: PRIMARY }} /> Tips
      </p>
      {[
        { icon: Briefcase, text: 'Títulos claros atraen más postulantes' },
        { icon: DollarSign, text: 'El presupuesto justo genera más interés' },
        { icon: MapPin, text: 'Dirección exacta reduce rechazos' },
      ].map(({ icon: I, text }) => (
        <div key={text} className="flex items-start gap-2">
          <I className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `${PRIMARY}90` }} />
          <p className="text-[13px] leading-tight" style={{ color: '#6b7280' }}>{text}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewPanel({ formData }) {
  const hasTitle    = formData.title.trim().length > 0;
  const hasBudget   = Number(formData.budget) > 0;
  const hasCategory = formData.category.length > 0;
  const hasDate     = formData.date.length > 0;
  const hNum = Number(formData.durationHours || 0);
  const mNum = Number(formData.durationMinutes || 0);
  const hasDuration = hNum > 0 || mNum > 0;

  return (
    <div className="rounded-2xl p-4 space-y-2"
      style={{ background: '#fff', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 20px rgba(125,39,190,0.08)' }}>
      <p className="text-[17px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
        <Zap className="w-5 h-5" style={{ color: '#ca8a04' }} /> Resumen
      </p>
      <p className="text-sm font-bold leading-tight"
        style={{ color: hasTitle ? '#111827' : '#d1d5db', fontStyle: hasTitle ? 'normal' : 'italic' }}>
        {hasTitle ? formData.title : 'Sin título aún...'}
      </p>
      {hasCategory && (
        <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ color: PRIMARY, background: PRIMARY_LIGHT }}>
          {formData.subcategory || formData.category}
        </span>
      )}
      {hasBudget && (
        <p className="text-base font-black" style={{ color: PRIMARY }}>
          ${Number(formData.budget).toLocaleString('es-CO')}
        </p>
      )}
      {hasDate && (
        <p className="text-[11px] flex items-center gap-1" style={{ color: '#9ca3af' }}>
          <Calendar className="w-4 h-4" />
          {new Date(formData.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      {hasDuration && (
        <p className="text-[11px] flex items-center gap-1" style={{ color: '#9ca3af' }}>
          <Clock className="w-4 h-4" />
          {hNum > 0 ? `${hNum}h ` : ''}{mNum > 0 ? `${mNum}min` : ''}
        </p>
      )}
    </div>
  );
}

function ChecklistPanel({ formData }) {
  const items = [
    { label: 'Título',      done: formData.title.trim().length > 0 },
    { label: 'Descripción', done: formData.description.trim().length > 0 },
    { label: 'Categoría',   done: !!formData.category },
    { label: 'Ubicación',   done: formData.location.trim().length > 0 },
    { label: 'Fecha',       done: !!formData.date },
    { label: 'Presupuesto', done: Number(formData.budget) > 0 },
  ];
  return (
    <div className="rounded-2xl p-4 space-y-2.5"
      style={{ background: '#fff', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 20px rgba(125,39,190,0.08)' }}>
      <p className="text-[17px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
        <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a' }} /> Checklist
      </p>
      {items.map(({ label, done }) => (
        <div key={label} className="flex items-center gap-2">
          <motion.div
            animate={{ scale: done ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
            style={{ background: done ? '#16a34a' : 'transparent', borderColor: done ? '#16a34a' : '#d1d5db' }}>
            {done && <span className="text-white text-[8px] font-black">✓</span>}
          </motion.div>
          <span className="text-[13px] font-medium"
            style={{ color: done ? '#9ca3af' : '#374151', textDecoration: done ? 'line-through' : 'none' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── FIX 4: DateTimeButton — input de fecha con apariencia de botón morado ────
function DateTimeButton({ value, onChange }) {
  const inputRef = useRef(null);
  const hasValue = !!value;

  const formatted = hasValue
    ? new Date(value).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="relative">
      {/* Botón visual morado */}
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer"
        style={{
          background: hasValue ? PRIMARY : PRIMARY,
          border: `2px solid ${PRIMARY}`,
          color: '#fff',
          boxShadow: `0 4px 18px ${PRIMARY}44`,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#5c178e'; e.currentTarget.style.borderColor = '#5c178e'; }}
        onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.borderColor = PRIMARY; }}>
        <Calendar className="w-5 h-5 text-white shrink-0" />
        <span className="flex-1 text-left">
          {hasValue ? formatted : 'Seleccionar fecha y hora'}
        </span>
        {hasValue && (
          <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Cambiar</span>
        )}
      </button>

      {/* Input real invisible que dispara el date picker nativo */}
      <input
        ref={inputRef}
        type="datetime-local"
        value={value}
        onChange={onChange}
        required
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          opacity: 0,
          pointerEvents: 'none',
        }}
        tabIndex={-1}
      />
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function MainForm({ formData, update, subcategories, error, loading, handleSubmit, isUrgent, errorRef }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AnimatePresence>
        {error && (
          <motion.div ref={errorRef} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-2xl text-sm font-bold flex items-center gap-2"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }}>
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionDivider icon={Briefcase} title="Información básica" />
      <div>
        <FieldLabel icon={Briefcase}>Título de la Tarea</FieldLabel>
        <LightInput icon={Briefcase} type="text" placeholder="Ej: Limpieza de jardín..." maxLength={100} required
          value={formData.title} onChange={e => update('title', e.target.value)} />
        <CharCount current={formData.title.length} max={100} />
      </div>
      <div>
        <FieldLabel icon={FileText}>Descripción Detallada</FieldLabel>
        <LightTextarea rows={4} placeholder="Describe lo que necesitas, materiales, condiciones..." maxLength={2000} required
          value={formData.description} onChange={e => update('description', e.target.value)} />
        <CharCount current={formData.description.length} max={2000} />
      </div>

      <SectionDivider icon={Tag} title="Categoría" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel icon={Tag}>Categoría</FieldLabel>
          <LightSelect icon={Tag} value={formData.category} onChange={e => update('category', e.target.value)}
            options={Object.keys(CATEGORIES)} placeholder="Selecciona..." />
        </div>
        <div>
          <FieldLabel icon={Tag}>Subcategoría</FieldLabel>
          <LightSelect icon={Tag} value={formData.subcategory} onChange={e => update('subcategory', e.target.value)}
            options={subcategories} placeholder={formData.category ? 'Selecciona...' : 'Elige categoría primero'}
            disabled={!formData.category} />
        </div>
      </div>

      <SectionDivider icon={MapPin} title="Ubicación" />
      <div>
        <FieldLabel icon={MapPin}>Dirección exacta (Ubicación donde se realizará el trabajo)</FieldLabel>
        {/* FIX 1, 2, 3: MapPicker ahora recibe onLocationChange + locationDetails */}
        <MapPicker
          value={formData.location}
          locationDetails={formData.locationDetails || ''}
          onLocationChange={val => update('location', val)}
          onDetailsChange={val => update('locationDetails', val)}
        />
      </div>

      <SectionDivider icon={Calendar} title="Fecha y duración" />
      <div>
        <FieldLabel icon={Calendar}>Fecha y Hora requerida</FieldLabel>
        {/* FIX 4: Botón morado con ícono de calendario */}
        <DateTimeButton
          value={formData.date}
          onChange={e => update('date', e.target.value)}
        />

        {isUrgent && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: '#fef3c7', color: '#d97706' }}
            >
              ⚡ Urgente
            </span>
            <span className="text-xs" style={{ color: '#9ca3af' }}>
              Esta tarea se realizará en menos de 24 horas
            </span>
          </div>
        )}
      </div>
      
      <div>
        <FieldLabel icon={Clock}>Duración Estimada</FieldLabel>
        <DurationPicker
          hours={formData.durationHours}
          minutes={formData.durationMinutes}
          onHoursChange={v => update('durationHours', v)}
          onMinutesChange={v => update('durationMinutes', v)}
        />
      </div>

      <SectionDivider icon={DollarSign} title="Presupuesto" />
      <div>
        <FieldLabel icon={DollarSign}>Cantidad ofrecida (Dinero que está dispuesto a pagar)</FieldLabel>
        <LightInput icon={DollarSign} type="number" min="5000" step="500" placeholder="50000" required suffix="COP"
          className="text-lg font-black" value={formData.budget} onChange={e => update('budget', e.target.value)} />
        <AnimatePresence>
          {Number(formData.budget) > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs font-bold pl-1 mt-1" style={{ color: PRIMARY }}>
              $ {Number(formData.budget).toLocaleString('es-CO')} pesos colombianos
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <SectionDivider icon={Star} title="Nivel de especialización" />
      <LevelSelector value={formData.specializationLevel} onChange={v => update('specializationLevel', v)} />

      <SectionDivider icon={Shield} title="Requisitos especiales (opcional)" />
      <div>
        <LightTextarea rows={3} placeholder="Certificaciones requeridas, herramientas propias, seguros..." maxLength={500}
          value={formData.specialRequirements} onChange={e => update('specialRequirements', e.target.value)} />
        <CharCount current={formData.specialRequirements.length} max={500} />
      </div>

      <motion.button whileTap={{ scale: 0.97 }} disabled={loading} type="submit"
        style={{ boxShadow: `0 8px 24px ${PRIMARY}40`, color: '#fff' }}
        className="w-full py-4 rounded-[26px] font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer bg-primary hover:bg-[#5c178e] transition-opacity">
        {loading
          ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publicando...</>
          : <><Send className="w-5 h-5" /> Publicar Tarea</>
        }
      </motion.button>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PostTaskPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const scrollRef = useRef(null);
  const errorRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [published, setPublished] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', subcategory: '',
    budget: '', location: '', locationDetails: '', date: '',
    durationHours: '', durationMinutes: '',
    specializationLevel: 'PRINCIPIANTE', specialRequirements: '',
  });

  const update = (key, val) => setFormData(prev => {
    const next = { ...prev, [key]: val };
    if (key === 'category') next.subcategory = '';
    return next;
  });

  const subcategories = formData.category ? CATEGORIES[formData.category] || [] : [];

  const validate = () => {
    if (!formData.title.trim())             return 'El título es requerido.';
    if (formData.title.length > 100)        return 'El título no puede superar 100 caracteres.';
    if (!formData.description.trim())       return 'La descripción es requerida.';
    if (formData.description.length > 2000) return 'La descripción no puede superar 2000 caracteres.';
    if (!formData.category)                 return 'La categoría es requerida.';
    if (!formData.subcategory)              return 'La subcategoría es requerida.';
    if (!formData.location.trim())          return 'La ubicación es requerida.';
    if (!formData.date) return 'La fecha y hora son requeridas.';
    const selectedDate = new Date(formData.date);
    const now = new Date();
    const minAllowed = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 horas
    if (selectedDate < minAllowed) {
      const minStr = minAllowed.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const minDay = minAllowed.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      return `La fecha debe ser al menos 2 horas desde ahora. Mínimo permitido: ${minDay} a las ${minStr}.`;
    }
    const h = Number(formData.durationHours  || 0);
    const m = Number(formData.durationMinutes || 0);
    if (h < 0 || h > 23)                   return 'Las horas deben estar entre 0 y 23.';
    if (m < 0 || m > 59)                   return 'Los minutos deben estar entre 0 y 59.';
    if (h === 0 && m === 0)                return 'La duración estimada debe ser mayor a 0.';
    if (!formData.budget || Number(formData.budget) <= 0) return 'El presupuesto debe ser mayor a 0.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      // Scroll al error con un pequeño delay para que React lo renderice primero
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return;
    }
    setLoading(true); setError('');
    const totalMinutes = Number(formData.durationHours || 0) * 60 + Number(formData.durationMinutes || 0);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...formData, budget: Number(formData.budget), estimatedDuration: totalMinutes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Error al publicar la tarea.'); return; }
      setPublished(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isUrgent = (() => {
    if (!formData.date) return false;
    const selected = new Date(formData.date);
    const now = new Date();
    const hoursAhead = (selected - now) / (1000 * 60 * 60);
    return hoursAhead >= 2 && hoursAhead <= 24;
  })();

  const sharedProps = { formData, update, subcategories, error, loading, handleSubmit, isUrgent, errorRef };

  if (published) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center bg-white z-50 overflow-hidden">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex flex-col items-center gap-5"
        >
          {/* Círculo con checkmark */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: '#f3e8ff' }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: '#7D27BE' }} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black" style={{ color: '#111827' }}>
              ¡Publicación exitosa!
            </h2>
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Tu tarea ya está disponible para los FreeTimmers.<br />
              Podrás verla en "Mis Tareas" y en tu historial.
            </p>
          </div>

          <div className="w-full max-w-xs pt-2">
            <button
              onClick={() => navigate('/fulltimer/home')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 bg-primary hover:bg-[#5c178e] cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* ════ MOBILE (< md) ════ */}
      <div className="md:hidden min-h-screen px-5 pt-5 pb-5" style={{ background: '#fff' }}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>Publicar Tarea</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Completa los campos para encontrar al FreeTimer ideal.</p>
        </div>
        <MainForm {...sharedProps} />
        {/* FIX 6: Rueda de progreso flotante solo en mobile */}
        <FloatingProgress formData={formData} />
      </div>

      {/* ════ DESKTOP (≥ md) ════ */}
      <div className="hidden md:flex h-[calc(100vh-9rem)]" style={{ background: '#fff' }}>

        {/* Publicidad izquierda */}
        <div className="hidden lg:flex w-44 xl:w-56 shrink-0 items-center justify-center"
          style={{ borderRight: '1px solid #f3f4f6' }}>
        </div>

        {/* Columna central con scroll y barra morada */}
        <div className="flex-1 relative min-w-0" style={{ overflow: 'hidden' }}>
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto pt-6 pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingLeft: '1.5rem', paddingRight: '2rem' }}
          >
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="text-center mb-7">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>Publicar Nueva Tarea</h1>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Completa los campos para encontrar al FreeTimer ideal.</p>
            </motion.div>

            <div className="relative max-w-2xl mx-auto">

              {/* Paneles sticky izquierda */}
              <div className="hidden xl:block absolute -left-48 top-0 bottom-0 w-44" style={{ zIndex: 10 }}>
                <div className="sticky top-[15vh] flex flex-col gap-3">
                  <ProgressPanel formData={formData} />
                  <TipsPanel />
                </div>
              </div>

              {/* Paneles sticky derecha */}
              <div className="hidden xl:block absolute -right-48 top-0 bottom-0 w-44" style={{ zIndex: 10 }}>
                <div className="sticky top-[15vh] flex flex-col gap-3">
                  <PreviewPanel formData={formData} />
                  <ChecklistPanel formData={formData} />
                </div>
              </div>

              <MainForm {...sharedProps} />
            </div>
          </div>

          <ScrollBar containerRef={scrollRef} />
        </div>

        {/* Publicidad derecha */}
        <div className="hidden lg:flex w-44 xl:w-56 shrink-0 items-center justify-center"
          style={{ borderLeft: '1px solid #f3f4f6' }}>
        </div>
      </div>
    </>
  );
}