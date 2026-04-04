import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import TaskExecutionPage from './pages/TaskExecutionPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import VerificationPage from './pages/VerificationPage';
import PostTaskPage from './pages/PostTaskPage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/task/:taskId" element={<TaskDetailsPage />} />
            <Route path="/post-task" element={<PostTaskPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/execution/:taskId" element={<TaskExecutionPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}