import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import LandingPage from './auth/pages/LandingPage';
import LoginPage from './auth/pages/LoginPage';
import RegisterPage from './auth/pages/RegisterPage';
import VerificationPage from './auth/pages/VerificationPage';

// Freetimer
import FreetimerDashboard from './freetimer/pages/FreetimerDashboard';
import FreetimerTasksPage from './freetimer/pages/TasksPage';
import TaskDetailsPage from './freetimer/pages/TaskDetailsPage';
import TaskExecutionPage from './freetimer/pages/TaskExecutionPage';
import FreetimerPaymentPage from './freetimer/pages/PaymentPage';
import FreetimerProfilePage from './freetimer/pages/ProfilePage';

// Fulltimer
import FulltimerDashboard from './fulltimer/pages/FulltimerDashboard';
import PostTaskPage from './fulltimer/pages/PostTaskPage';
import MyTasksPage from './fulltimer/pages/MyTasksPage';
import ApplicantsPage from './fulltimer/pages/ApplicantsPage';
import FulltimerPaymentPage from './fulltimer/pages/PaymentPage';
import FulltimerProfilePage from './fulltimer/pages/ProfilePage';

// Shared
import Layout from './shared/components/Layout';
import { AuthProvider } from './shared/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verification" element={<VerificationPage />} />

            {/* Freetimer */}
            <Route path="/freetimer/home" element={<FreetimerDashboard />} />
            <Route path="/freetimer/tasks" element={<FreetimerTasksPage />} />
            <Route path="/freetimer/task/:taskId" element={<TaskDetailsPage />} />
            <Route path="/freetimer/execution/:taskId" element={<TaskExecutionPage />} />
            <Route path="/freetimer/payment" element={<FreetimerPaymentPage />} />
            <Route path="/freetimer/profile" element={<FreetimerProfilePage />} />

            {/* Fulltimer */}
            <Route path="/fulltimer/home" element={<FulltimerDashboard />} />
            <Route path="/fulltimer/post-task" element={<PostTaskPage />} />
            <Route path="/fulltimer/my-tasks" element={<MyTasksPage />} />
            <Route path="/fulltimer/task/:taskId/applicants" element={<ApplicantsPage />} />
            <Route path="/fulltimer/payment" element={<FulltimerPaymentPage />} />
            <Route path="/fulltimer/profile" element={<FulltimerProfilePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}