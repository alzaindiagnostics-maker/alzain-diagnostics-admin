import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import PackageForm from './pages/PackageForm';
import Tests from './pages/Tests';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import HomeCollections from './pages/HomeCollections';
import AdminReviews from './pages/AdminReviews';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Portal Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/new" element={<PackageForm />} />
            <Route path="packages/:id/edit" element={<PackageForm />} />
            <Route path="tests" element={<Tests />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="home-collections" element={<HomeCollections />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
