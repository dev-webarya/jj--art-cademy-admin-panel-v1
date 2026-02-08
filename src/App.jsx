import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import EnrollmentsPage from './pages/EnrollmentsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SessionsPage from './pages/SessionsPage';
import AttendancePage from './pages/AttendancePage';
import EventsPage from './pages/EventsPage';
import LmsGalleryPage from './pages/LmsGalleryPage';
import ArtWorksPage from './pages/ArtWorksPage';
import MaterialsPage from './pages/MaterialsPage';
import GalleriesPage from './pages/GalleriesPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import ClassesPage from './pages/ClassesPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* User Management */}
              <Route path="users" element={<UsersPage />} />

              {/* LMS Routes */}
              <Route path="enrollments" element={<EnrollmentsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="lms-gallery" element={<LmsGalleryPage />} />

              {/* Shop & Content Routes */}
              <Route path="art-works" element={<ArtWorksPage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="galleries" element={<GalleriesPage />} />
              <Route path="exhibitions" element={<ExhibitionsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
