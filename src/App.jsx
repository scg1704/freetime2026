import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/context/AuthContext';

// Auth
import LandingPage      from './auth/pages/LandingPage';
import LoginPage        from './auth/pages/LoginPage';
import RegisterPage     from './auth/pages/RegisterPage';
import VerificationPage from './auth/pages/VerificationPage';

// Freetimer
import FreetimerDashboard  from './freetimer/pages/FreetimerDashboard';
import FreetimerTasksPage  from './freetimer/pages/TasksPage';
import TaskDetailsPage     from './freetimer/pages/TaskDetailsPage';
import TaskExecutionPage   from './freetimer/pages/TaskExecutionPage';
import FreetimerPaymentPage from './freetimer/pages/PaymentPage';
import FreetimerProfilePage from './freetimer/pages/ProfilePage';

// Fulltimer
import FulltimerDashboard  from './fulltimer/pages/FulltimerDashboard';
import PostTaskPage         from './fulltimer/pages/PostTaskPage';
import MyTasksPage          from './fulltimer/pages/MyTasksPage';
import ApplicantsPage       from './fulltimer/pages/ApplicantsPage';
import FulltimerPaymentPage from './fulltimer/pages/PaymentPage';
import FulltimerProfilePage from './fulltimer/pages/ProfilePage';

// Shared
import Layout              from './shared/components/Layout';
import { AuthProvider }    from './shared/context/AuthContext';

// ─────────────────────────────────────────────
// Spinner de carga mientras se hidrata la sesión
// ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ProtectedRoute
// Bloquea el acceso si no hay sesión activa.
// Acepta un `requiredRole` opcional para restringir
// por tipo de usuario (FREETIMER / FULLTIMER).
// ─────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Mientras se hidrata la sesión desde storage, mostrar spinner
  // para evitar un flash incorrecto de redirección.
  if (loading) return <LoadingScreen />;

  // Sin sesión → LandingPage
  if (!user) return <Navigate to="/" replace />;

  // Con sesión pero rol incorrecto → dashboard del rol que tiene
  if (requiredRole && user.role !== requiredRole) {
    const home = user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home';
    return <Navigate to={home} replace />;
  }

  return children;
}

// ─────────────────────────────────────────────
// PublicRoute
// Si el usuario ya tiene sesión y entra a una
// página pública (/, /login, /register), lo
// redirige directamente a su dashboard.
// ─────────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    const home = user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home';
    return <Navigate to={home} replace />;
  }

  return children;
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>

            {/* ── Rutas públicas (redirigen al dashboard si hay sesión) ── */}
            <Route path="/" element={
              <PublicRoute><LandingPage /></PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute><LoginPage /></PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute><RegisterPage /></PublicRoute>
            } />

            {/* Verificación: accesible solo si hay sesión (recién registrado) */}
            <Route path="/verification" element={
              <ProtectedRoute><VerificationPage /></ProtectedRoute>
            } />

            {/* ── Rutas protegidas — solo FREETIMER ── */}
            <Route path="/freetimer/home" element={
              <ProtectedRoute requiredRole="FREETIMER"><FreetimerDashboard /></ProtectedRoute>
            } />
            <Route path="/freetimer/tasks" element={
              <ProtectedRoute requiredRole="FREETIMER"><FreetimerTasksPage /></ProtectedRoute>
            } />
            <Route path="/freetimer/task/:taskId" element={
              <ProtectedRoute requiredRole="FREETIMER"><TaskDetailsPage /></ProtectedRoute>
            } />
            <Route path="/freetimer/execution/:taskId" element={
              <ProtectedRoute requiredRole="FREETIMER"><TaskExecutionPage /></ProtectedRoute>
            } />
            <Route path="/freetimer/payment" element={
              <ProtectedRoute requiredRole="FREETIMER"><FreetimerPaymentPage /></ProtectedRoute>
            } />
            <Route path="/freetimer/profile" element={
              <ProtectedRoute requiredRole="FREETIMER"><FreetimerProfilePage /></ProtectedRoute>
            } />

            {/* ── Rutas protegidas — solo FULLTIMER ── */}
            <Route path="/fulltimer/home" element={
              <ProtectedRoute requiredRole="FULLTIMER"><FulltimerDashboard /></ProtectedRoute>
            } />
            <Route path="/fulltimer/post-task" element={
              <ProtectedRoute requiredRole="FULLTIMER"><PostTaskPage /></ProtectedRoute>
            } />
            <Route path="/fulltimer/my-tasks" element={
              <ProtectedRoute requiredRole="FULLTIMER"><MyTasksPage /></ProtectedRoute>
            } />
            <Route path="/fulltimer/task/:taskId/applicants" element={
              <ProtectedRoute requiredRole="FULLTIMER"><ApplicantsPage /></ProtectedRoute>
            } />
            <Route path="/fulltimer/payment" element={
              <ProtectedRoute requiredRole="FULLTIMER"><FulltimerPaymentPage /></ProtectedRoute>
            } />
            <Route path="/fulltimer/profile" element={
              <ProtectedRoute requiredRole="FULLTIMER"><FulltimerProfilePage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}