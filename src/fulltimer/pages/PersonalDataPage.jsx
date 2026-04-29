// source/fulltimer/pages/PersonalDataPage.jsx
import { useAuth } from '../../shared/context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield, Hash } from 'lucide-react';

const PRIMARY = '#7D27BE';

export default function PersonalDataPage() {
  const { user } = useAuth();
  if (!user) return null;

  const rango =
    (user.tasksCompleted ?? 0) > 20 ? 'Experto' :
    (user.tasksCompleted ?? 0) > 5  ? 'Intermedio' : 'Nuevo';

  const fields = [
    {
      group: 'Identidad',
      items: [
        { icon: <User className="w-4 h-4" />,     label: 'Nombre completo', value: `${user.name} ${user.lastName}` },
        { icon: <Hash className="w-4 h-4" />,     label: 'ID de usuario',   value: user.id || '—'                  },
        { icon: <Shield className="w-4 h-4" />,   label: 'Rol',             value: 'FullTimer'                     },
        { icon: <Shield className="w-4 h-4" />,   label: 'Rango',           value: rango                          },
      ],
    },
    {
      group: 'Contacto',
      items: [
        { icon: <Mail className="w-4 h-4" />,  label: 'Email',    value: user.email           },
        { icon: <Phone className="w-4 h-4" />, label: 'Teléfono', value: user.phone || '—'    },
      ],
    },
    {
      group: 'Ubicación',
      items: [
        { icon: <MapPin className="w-4 h-4" />,    label: 'Ciudad',        value: user.city || '—'         },
        { icon: <MapPin className="w-4 h-4" />,    label: 'Departamento',  value: user.department || '—'   },
      ],
    },
    {
      group: 'Cuenta',
      items: [
        { icon: <Calendar className="w-4 h-4" />, label: 'Fecha de nacimiento', value: user.birthdate || '—' },
        {
          icon: <Shield className="w-4 h-4" />,
          label: 'Verificación',
          value: user.verified ? 'Cuenta verificada' : 'Pendiente de verificación',
          highlight: user.verified ? 'green' : 'orange',
        },
      ],
    },
  ];

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px - 80px)' }}>
      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }} />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-5 py-6 max-w-2xl mx-auto space-y-8">

            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>
                Datos Personales
              </h1>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-[26px] overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={user.photoURL || `https://picsum.photos/seed/${user.id}/200`}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Grupos de datos */}
            {fields.map((group) => (
            <section key={group.group} className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#4b5563' }}>
                {group.group}
                </h2>
                <div className="rounded-[28px] overflow-hidden border border-gray-100 bg-gray-50"> 
                {/* Cambiamos el contenedor a bg-gray-50 para que actúe como base 
                    y subimos el radio a 28px para que sea más orgánico como en Pagos.
                */}
                {group.items.map((item, i) => (
                    <div
                    key={item.label}
                    className={`
                        flex items-center justify-between px-5 py-4 bg-white transition-all border-2 border-transparent
                        hover:bg-[#7D27BE]/5 hover:border-[#7D27BE]/30
                        ${i < group.items.length - 1 ? 'border-b-gray-100' : ''}
                    `}
                    // Eliminamos el style inline del borderBottom para usar la clase condicional de arriba
                    >
                    <div className="flex items-center gap-3">
                        <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#f3e8ff', color: PRIMARY }}
                        >
                        {item.icon}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#6b7280' }}>
                        {item.label}
                        </span>
                    </div>
                    <span
                        className="text-sm font-bold text-right max-w-[55%] truncate"
                        style={{
                        color: item.highlight === 'green'
                            ? '#16a34a'
                            : item.highlight === 'orange'
                            ? '#d97706'
                            : '#111827',
                        }}
                    >
                        {item.value}
                    </span>
                    </div>
                ))}
                </div>
            </section>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-44 xl:w-56 shrink-0" style={{ borderLeft: '1px solid #f3f4f6' }} />
    </div>
  );
}