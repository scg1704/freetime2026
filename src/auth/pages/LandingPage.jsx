import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Clock, Shield, TrendingUp } from 'lucide-react';
import ShaderBackground from '../../shared/components/ui/ShaderBackground';
import SparklesText from '../../shared/components/ui/SparklesText';

const sections = [
  {
    id: 1,
    label: 'Para todos',
    title: 'Más tiempo\npara ti',
    description:
      'La plataforma digital que conecta personas con tiempo y habilidades con quienes necesitan ayuda en tareas específicas. Delega, trabaja y gana desde donde estés.',
    icon: <Clock className="w-12 h-12 text-primary" />,
    reverse: false,
    cta: true,
  },
  {
    id: 2,
    label: 'FreeTimers',
    title: 'Convierte tu\ntiempo en dinero',
    description:
      'Regístrate, muestra tus habilidades y postúlate a tareas cerca de ti. Tú decides cuándo, cómo y cuánto trabajas. Sin jefes, sin horarios fijos.',
    icon: <TrendingUp className="w-12 h-12 text-primary" />,
    reverse: true,
    cta: false,
  },
  {
    id: 3,
    label: 'FullTimers',
    title: 'Seguridad\nen cada tarea',
    description:
      'Verificación biométrica, revisión de antecedentes y sistema de pago Escrow. Tu dinero está protegido hasta que el trabajo esté completado a tu satisfacción.',
    icon: <Shield className="w-12 h-12 text-primary" />,
    reverse: false,
    cta: false,
  },
];

function ParallaxSection({ section }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.6],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
  );
  const translateY = useTransform(scrollYProgress, [0, 1], [-40, 0]);

  return (
    <div
      ref={ref}
      className={`
        min-h-screen flex items-center justify-center gap-12 md:gap-24
        px-6 sm:px-10 md:px-20 py-20
        flex-col ${section.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}
      `}
    >
      <motion.div
        style={{ y: translateY }}
        className="flex flex-col gap-5 w-full max-w-md"
      >
        <span className="inline-flex self-start text-xs font-bold uppercase tracking-widest text-primary bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          {section.label}
        </span>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight whitespace-pre-line drop-shadow-lg">
          {section.title}
        </h2>

        {/* Mejora 2: Color gris #B3B3B3 */}
        <p className="text-[#B3B3B3] text-base sm:text-lg leading-relaxed bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/5">
          {section.description}
        </p>

        {section.cta && (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              to="/register"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#5c178e] active:bg-[#7A2FB0] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
            >
              Comenzar <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </motion.div>

      <motion.div
        style={{ opacity, clipPath }}
        className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md"
      >
        {/* Mejora 3: Contenedor con más profundidad */}
        <div className="
          bg-white/10 backdrop-blur-2xl border border-white/20
          rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          flex flex-col items-center gap-8
        ">
          <div className="w-20 h-20 bg-white backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-lg">
            {section.icon}
          </div>

          <div className="w-full">
            <MockContent sectionId={section.id} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MockContent({ sectionId }) {
  const cardStyle = "bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl";

  if (sectionId === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {[
          { title: 'Paseo de perro', price: '$25.000', badge: 'Mascotas' },
          { title: 'Limpieza', price: '$80.000', badge: 'Hogar' },
          { title: 'Tutoría', price: '$50.000', badge: 'Educación' },
        ].map((task) => (
          /* Mejora 3: Mayor contraste en las filas */
          <div
            key={task.title}
            className="bg-primary backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg"
          >
            <div className="text-left">
              <p className="text-white text-sm font-semibold mb-1">{task.title}</p>
              <span className="text-[10px] text-white font-bold bg-black/40 border border-black/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {task.badge}
              </span>
            </div>
            <span className="text-white font-bold text-base">{task.price}</span>
          </div>
        ))}
      </div>
    );
  }

  if (sectionId === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-primary backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 shadow-lg text-center">
          <p className="text-white text-xs mb-2 font-medium">Ganancias del mes</p>
          <p className="text-white text-3xl font-black tracking-tight">$640.000</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center shadow-lg">
            <p className="text-white font-bold text-2xl">12</p>
            <p className="text-white text-xs mt-1 uppercase font-bold tracking-tighter">Tareas</p>
          </div>
          <div className="bg-primary backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center shadow-lg">
            <p className="text-white font-bold text-2xl">4.9 ⭐</p>
            <p className="text-white text-xs mt-1 uppercase font-bold tracking-tighter">Rating</p>
          </div>
        </div>
      </div>
    );
  }

  if (sectionId === 3) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {[
          { label: 'Verificación biométrica' },
          { label: 'Antecedentes revisados' },
          { label: 'Pago en Escrow' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-primary backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(166,76,234,0.5)]">
              <span className="text-primary text-xs font-bold">✓</span>
            </div>
            <p className="text-white text-sm font-semibold">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-primary/30"
      style={{ background: 'transparent' }}
    >
      <ShaderBackground />

      {/* Mejora 1: Logo con fondo gris difuminado similar al botón */}
      <div className="fixed top-0 left-0 z-50 p-5">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white p-2 shadow-xl">
          <img
            src="https://res.cloudinary.com/djhzmob44/image/upload/v1775446214/FTLOGO3-removebg-preview_j1yad7.png"
            alt="FreeTime Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
      </div>

      <nav className="fixed top-0 right-0 z-50 flex items-center gap-3 p-5">
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg"
        >
          Log In
        </Link>
        <Link
          to="/register"
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary hover:bg-[#5c178e] active:bg-[#7A2FB0] transition-all shadow-lg shadow-primary/20"
        >
          Sign Up
        </Link>
      </nav>

      <section className="relative flex items-center justify-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center px-6"
        >
          <SparklesText
            text="FREETIME"
            sparklesCount={14}
            colors={{ first: '#A64CEA', second: '#d8b4fe' }}
            className="text-6xl sm:text-8xl md:text-9xl tracking-tighter text-white"
          />
        </motion.div>
      </section>

      <div className="flex flex-col">
        {sections.map((section) => (
          <ParallaxSection key={section.id} section={section} />
        ))}
      </div>

      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 space-y-8">
        <SparklesText
          text="Únete hoy"
          sparklesCount={8}
          colors={{ first: '#A64CEA', second: '#d8b4fe' }}
          className="text-5xl sm:text-6xl md:text-7xl tracking-tighter text-white"
        />
        <p className="text-[#B3B3B3] text-lg sm:text-xl max-w-md leading-relaxed bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/5">
          Miles de personas ya están aprovechando su tiempo con FreeTime.
        </p>
        <Link
          to="/register"
          className="bg-primary text-white px-10 sm:px-12 py-5 rounded-full font-bold text-xl hover:bg-[#5c178e] active:bg-[#7A2FB0] transition-all flex items-center gap-3 shadow-2xl shadow-primary/40"
        >
          Crear cuenta gratis <ArrowRight className="w-6 h-6" />
        </Link>
      </section>
    </div>
  );
}