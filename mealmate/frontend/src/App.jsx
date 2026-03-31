import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { PageLoader } from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import MessListings from './pages/MessListings';
import MessDetail from './pages/MessDetail';
import WeeklyMenu from './pages/WeeklyMenu';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMesses from './pages/admin/AdminMesses';
import AdminFeedback from './pages/admin/AdminFeedback';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerMenuManager from './pages/owner/OwnerMenuManager';
import OwnerProfile from './pages/owner/OwnerProfile';
import OwnerFeedback from './pages/owner/OwnerFeedback';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubscriptions from './pages/student/StudentSubscriptions';
import StudentProfile from './pages/student/StudentProfile';
import NotFound from './pages/NotFound';

import './index.css';

// Redirects logged-in users to their role-based dashboard
const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';
  return '/student';
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show full-page loader while checking auth on first mount
  if (loading) return <PageLoader />;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/messes" element={<MessListings />} />
          <Route path="/messes/:id" element={<MessDetail />} />
          <Route path="/weekly-menu" element={<WeeklyMenu />} />
          <Route
            path="/login"
            element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Register />}
          />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/messes" element={<ProtectedRoute roles={['admin']}><AdminMesses /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute roles={['admin']}><AdminFeedback /></ProtectedRoute>} />

          {/* Owner */}
          <Route path="/owner" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/menus" element={<ProtectedRoute roles={['owner']}><OwnerMenuManager /></ProtectedRoute>} />
          <Route path="/owner/profile" element={<ProtectedRoute roles={['owner']}><OwnerProfile /></ProtectedRoute>} />
          <Route path="/owner/feedback" element={<ProtectedRoute roles={['owner']}><OwnerFeedback /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/subscriptions" element={<ProtectedRoute roles={['student']}><StudentSubscriptions /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute roles={['student', 'owner', 'admin']}><StudentProfile /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
