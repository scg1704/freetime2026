// source/fulltimer/pages/SettingsPage.jsx
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, Moon, Globe, Lock, Eye, EyeOff,
  Smartphone, Trash2, ChevronRight, Check,
} from 'lucide-react';

const PRIMARY = '#7D27BE';

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
      style={{ background: enabled ? PRIMARY : '#e5e7eb' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

// ─── Setting row con toggle ───────────────────────────────────────────────────
function ToggleRow({ icon, label, sublabel, enabled, onChange }) {
  return (
    <div 
      className="flex items-center justify-between px-5 py-4 bg-white transition-all border-2 border-transparent hover:bg-[#7D27BE]/5 hover:border-[#7D27BE]/30"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f3e8ff', color: PRIMARY }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#111827' }}>{label}</p>
          {sublabel && <p className="text-xs" style={{ color: '#6b7280' }}>{sublabel}</p>}
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

// ─── Setting row con chevron (acción) ────────────────────────────────────────
function ActionRow({ icon, label, sublabel, value, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-5 py-4 bg-white transition-all border-2 border-transparent cursor-pointer
        ${danger 
          ? 'hover:bg-red-50 hover:border-red-100' 
          : 'hover:bg-[#7D27BE]/5 hover:border-[#7D27BE]/30'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: danger ? '#fef2f2' : '#f3e8ff', color: danger ? '#ef4444' : PRIMARY }}
        >
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold" style={{ color: danger ? '#ef4444' : '#111827' }}>{label}</p>
          {sublabel && <p className="text-xs" style={{ color: '#6b7280' }}>{sublabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {value && <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>{value}</span>}
        <ChevronRight className="w-4 h-4" style={{ color: '#d1d5db' }} />
      </div>
    </button>
  );
}

// ─── Grupo de settings ────────────────────────────────────────────────────────
function SettingsGroup({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
        {title}
      </h2>
      <div className="rounded-[28px] overflow-hidden border border-gray-100 bg-gray-50 divide-y divide-gray-100">
        {children}
      </div>
    </section>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function SettingsPage() {
  const [notifTasks,   setNotifTasks]   = useState(true);
  const [notifChat,    setNotifChat]    = useState(true);
  const [notifPromo,   setNotifPromo]   = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [language,     setLanguage]     = useState('Español');

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-8">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Opciones
              </h1>
            </div>

            {/* Notificaciones */}
            <SettingsGroup title="Notificaciones">
              <ToggleRow
                icon={<Bell className="w-4 h-4" />}
                label="Nuevas tareas"
                sublabel="Avisos cuando publiques o actualices tareas"
                enabled={notifTasks}
                onChange={setNotifTasks}
              />
              <ToggleRow
                icon={<Smartphone className="w-4 h-4" />}
                label="Mensajes"
                sublabel="Notificaciones de chat con FreeTimers"
                enabled={notifChat}
                onChange={setNotifChat}
              />
              <ToggleRow
                icon={<Bell className="w-4 h-4" />}
                label="Promociones"
                sublabel="Ofertas y novedades de FreeTime"
                enabled={notifPromo}
                onChange={setNotifPromo}
              />
            </SettingsGroup>

            {/* Apariencia */}
            <SettingsGroup title="Apariencia">
              <ToggleRow
                icon={<Moon className="w-4 h-4" />}
                label="Modo oscuro"
                sublabel="Próximamente disponible"
                enabled={darkMode}
                onChange={setDarkMode}
              />
              <ActionRow
                icon={<Globe className="w-4 h-4" />}
                label="Idioma"
                value={language}
                onClick={() => {}}
              />
            </SettingsGroup>

            {/* Privacidad */}
            <SettingsGroup title="Privacidad">
              <ToggleRow
                icon={<Eye className="w-4 h-4" />}
                label="Mostrar actividad"
                sublabel="Otros usuarios pueden ver cuándo estás activo"
                enabled={showActivity}
                onChange={setShowActivity}
              />
              <ActionRow
                icon={<Lock className="w-4 h-4" />}
                label="Cambiar contraseña"
                sublabel="Actualiza tu contraseña de acceso"
                onClick={() => {}}
              />
              <ActionRow
                icon={<EyeOff className="w-4 h-4" />}
                label="Sesiones activas"
                sublabel="Revisa los dispositivos conectados"
                value="1 activa"
                onClick={() => {}}
              />
            </SettingsGroup>

            {/* Zona de peligro */}
            <SettingsGroup title="Eliminar cuenta">
              {!deleteConfirm ? (
                <ActionRow
                  icon={<Trash2 className="w-4 h-4" />}
                  label="Eliminar cuenta"
                  sublabel="Esta acción es permanente e irreversible"
                  danger
                  onClick={() => setDeleteConfirm(true)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-5 py-4 space-y-3"
                  style={{ background: '#fef2f2' }}
                >
                  <p className="text-sm font-bold text-center" style={{ color: '#dc2626' }}>
                    ¿Estás seguro? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-2xl font-bold text-sm border-2 border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{ color: '#6b7280' }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="flex-1 py-2.5 rounded-2xl font-bold text-sm text-white transition-colors cursor-pointer"
                      style={{ background: '#ef4444' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
                      onClick={() => {/* TODO: eliminar cuenta */}}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </motion.div>
              )}
            </SettingsGroup>

            {/* Versión */}
            <p className="text-center text-xs pb-4" style={{ color: '#9ca3af' }}>
              FreeTime v1.0.0 · Hecho con ♥ en Colombia
            </p>

          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}