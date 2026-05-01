// source/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/context/AuthContext';

// ── Auth ─────────────────────────────────────────────────────────────────────
import LandingPage            from './auth/pages/LandingPage';
import LoginPage              from './auth/pages/LoginPage';
import RegisterPage           from './auth/pages/RegisterPage';
//import EmailVerificationPage  from './auth/pages/EmailVerificationPage';
import VerificationPage       from './auth/pages/VerificationPage';

// ── Freetimer ────────────────────────────────────────────────────────────────
import FreetimerDashboard     from './freetimer/pages/FreetimerDashboard';
import FreetimerTasksPage     from './freetimer/pages/TasksPage';
import TaskDetailsPage        from './freetimer/pages/TaskDetailsPage';
import TaskExecutionPage      from './freetimer/pages/TaskExecutionPage';
import FreetimerPaymentPage   from './freetimer/pages/PaymentPage';
import FreetimerProfilePage   from './freetimer/pages/ProfilePage';

// ── Fulltimer ────────────────────────────────────────────────────────────────
import FulltimerDashboard       from './fulltimer/pages/FulltimerDashboard';
import PostTaskPage             from './fulltimer/pages/PostTaskPage';
import MyTasksPage              from './fulltimer/pages/MyTasksPage';
import ApplicantsPage           from './fulltimer/pages/ApplicantsPage';
import TaskHistoryPage          from './fulltimer/pages/TaskHistoryPage';
import FulltimerPaymentPage     from './fulltimer/pages/PaymentPage';
import AddNequiPage             from './fulltimer/pages/AddNequiPage';
import PaymentHistoryPage       from './fulltimer/pages/PaymentHistoryPage';
import FulltimerProfilePage     from './fulltimer/pages/ProfilePage';
import EditProfilePage          from './fulltimer/pages/EditProfilePage';
import PersonalDataPage         from './fulltimer/pages/PersonalDataPage';
import RatingsPage              from './fulltimer/pages/RatingsPage';
import SettingsPage             from './fulltimer/pages/SettingsPage';
import MessagesPage             from './fulltimer/pages/MessagesPage';
import FreetimeProfileViewPage  from './fulltimer/pages/FreetimeProfileViewPage'; // ← nuevo

// ── Shared ───────────────────────────────────────────────────────────────────
import Layout       from './shared/components/Layout';
import { AuthProvider } from './shared/context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (!user.verified) return <Navigate to="/verify-email" replace />;
    return <Navigate to={user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home'} replace />;
  }
  return children;
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!user.verified) return <Navigate to="/verify-email" replace />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to={user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home'} replace />;
  return children;
}

function EmailVerifyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (user.verified) return <Navigate to={user.role === 'FREETIMER' ? '/freetimer/home' : '/fulltimer/home'} replace />;
  return children;
}

function SessionRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>

            {/* ── Públicas ── */}
            <Route path="/"         element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* ── Verificación ── */}
            {/* <Route path="/verify-email" element={<EmailVerifyRoute><EmailVerificationPage /></EmailVerifyRoute>} /> */}
            <Route path="/verification" element={<SessionRoute><VerificationPage /></SessionRoute>} />

            {/* ── Freetimer ── */}
            <Route path="/freetimer/home"              element={<ProtectedRoute requiredRole="FREETIMER"><FreetimerDashboard /></ProtectedRoute>} />
            <Route path="/freetimer/tasks"             element={<ProtectedRoute requiredRole="FREETIMER"><FreetimerTasksPage /></ProtectedRoute>} />
            <Route path="/freetimer/task/:taskId"      element={<ProtectedRoute requiredRole="FREETIMER"><TaskDetailsPage /></ProtectedRoute>} />
            <Route path="/freetimer/execution/:taskId" element={<ProtectedRoute requiredRole="FREETIMER"><TaskExecutionPage /></ProtectedRoute>} />
            <Route path="/freetimer/payment"           element={<ProtectedRoute requiredRole="FREETIMER"><FreetimerPaymentPage /></ProtectedRoute>} />
            <Route path="/freetimer/profile"           element={<ProtectedRoute requiredRole="FREETIMER"><FreetimerProfilePage /></ProtectedRoute>} />

            {/* ── Fulltimer ── */}
            <Route path="/fulltimer/home"                   element={<ProtectedRoute requiredRole="FULLTIMER"><FulltimerDashboard /></ProtectedRoute>} />
            <Route path="/fulltimer/post-task"              element={<ProtectedRoute requiredRole="FULLTIMER"><PostTaskPage /></ProtectedRoute>} />
            <Route path="/fulltimer/my-tasks"               element={<ProtectedRoute requiredRole="FULLTIMER"><MyTasksPage /></ProtectedRoute>} />
            <Route path="/fulltimer/task-history"           element={<ProtectedRoute requiredRole="FULLTIMER"><TaskHistoryPage /></ProtectedRoute>} />
            <Route path="/fulltimer/task/:taskId/applicants"element={<ProtectedRoute requiredRole="FULLTIMER"><ApplicantsPage /></ProtectedRoute>} />
            <Route path="/fulltimer/payment"                element={<ProtectedRoute requiredRole="FULLTIMER"><FulltimerPaymentPage /></ProtectedRoute>} />
            <Route path="/fulltimer/payment/add-nequi"      element={<ProtectedRoute requiredRole="FULLTIMER"><AddNequiPage /></ProtectedRoute>} />
            <Route path="/fulltimer/payment/history"        element={<ProtectedRoute requiredRole="FULLTIMER"><PaymentHistoryPage /></ProtectedRoute>} />
            <Route path="/fulltimer/profile"                element={<ProtectedRoute requiredRole="FULLTIMER"><FulltimerProfilePage /></ProtectedRoute>} />
            <Route path="/fulltimer/profile/edit"           element={<ProtectedRoute requiredRole="FULLTIMER"><EditProfilePage /></ProtectedRoute>} />
            <Route path="/fulltimer/profile/personal-data"  element={<ProtectedRoute requiredRole="FULLTIMER"><PersonalDataPage /></ProtectedRoute>} />
            <Route path="/fulltimer/profile/ratings"        element={<ProtectedRoute requiredRole="FULLTIMER"><RatingsPage /></ProtectedRoute>} />
            <Route path="/fulltimer/profile/settings"       element={<ProtectedRoute requiredRole="FULLTIMER"><SettingsPage /></ProtectedRoute>} />
            <Route path="/fulltimer/messages"               element={<ProtectedRoute requiredRole="FULLTIMER"><MessagesPage /></ProtectedRoute>} />
            <Route path="/fulltimer/freetimer-profile"      element={<ProtectedRoute requiredRole="FULLTIMER"><FreetimeProfileViewPage /></ProtectedRoute>} /> {/* ← nuevo */}

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}