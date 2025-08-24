import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import DonationsPage from './pages/DonationsPage';
import RequestsPage from './pages/RequestsPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import CreateDonation from './components/donations/CreateDonation';
import DonationDetails from './components/donations/DonationDetails';
import DonationRequestsPage from './pages/DonationRequestsPage';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-primary-600 text-xl">Loading NurtiLink...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="donations" 
          element={
            <ProtectedRoute>
              <DonationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="donations/:id" 
          element={
            <ProtectedRoute>
              <DonationDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="donations/:donationId/requests" 
          element={
            <ProtectedRoute>
              <DonationRequestsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="create-donation" 
          element={
            <ProtectedRoute>
              <CreateDonation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="requests" 
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;