import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TaskExecutionPage from './pages/TaskExecutionPage.jsx';
import TaskDetailsPage from './pages/TaskDetailsPage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import PostTaskPage from './pages/PostTaskPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

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
