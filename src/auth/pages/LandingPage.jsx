import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Shield, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden">
      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-6xl font-bold tracking-tighter mb-6">
            Más tiempo <span className="text-primary italic">para ti</span>
          </h1>
          <p className="text-xl text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            La plataforma digital que conecta personas con tiempo y habilidades
            con quienes necesitan ayuda en tareas específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Comenzar <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white text-black border-2 border-black px-10 py-4 rounded-full font-bold text-lg hover:bg-black hover:text-white transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Clock className="w-10 h-10 text-primary" />}
            title="Ahorra Tiempo"
            description="Delega tus tareas a expertos locales y enfócate en lo que realmente importa."
          />
          <FeatureCard
            icon={<TrendingUp className="w-10 h-10 text-primary" />}
            title="Gana Dinero"
            description="Monetiza tus habilidades y tiempo libre ayudando a otros en tu comunidad."
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-primary" />}
            title="Seguridad Total"
            description="Verificación biométrica y sistema de pagos seguro (Escrow) para tu tranquilidad."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-secondary leading-relaxed">{description}</p>
    </div>
  );
}