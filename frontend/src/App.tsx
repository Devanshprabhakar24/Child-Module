import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import DashboardLayout from './components/DashboardLayout';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import LoginPage from './pages/auth/LoginPage';
import FirstLoginPage from './pages/auth/FirstLoginPage';
import RegisterChildPage from './pages/registration/RegisterChildPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import VaccinationPage from './pages/dashboard/VaccinationPage';
import GrowthChartPage from './pages/dashboard/GrowthChartPage';
import HealthRecordsPage from './pages/dashboard/HealthRecordsPage';
import RemindersPage from './pages/dashboard/RemindersPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import EditProfilePage from './pages/dashboard/EditProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/first-login" element={<FirstLoginPage />} />

          {/* Protected: Register Child */}
          <Route path="/register-child" element={<ProtectedRoute><RegisterChildPage /></ProtectedRoute>} />

          {/* Protected: Dashboard with sidebar layout */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="vaccination" element={<VaccinationPage />} />
            <Route path="growth" element={<GrowthChartPage />} />
            <Route path="health-records" element={<HealthRecordsPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          </Route>

          {/* Root redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
