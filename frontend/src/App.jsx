import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CityPage from './pages/CityPage';
import DayPage from './pages/DayPage';
import ActivityPage from './pages/ActivityPage';
import AdminPage from './pages/AdminPage';
import AdminActivityPage from './pages/AdminActivityPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/cities/:cityId" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
      <Route path="/days/:dayId" element={<ProtectedRoute><DayPage /></ProtectedRoute>} />
      <Route path="/activities/:id" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/activities/:dayId" element={<ProtectedRoute><AdminActivityPage /></ProtectedRoute>} />
    </Routes>
  );
}
