import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import InitialRegistration from './pages/InitialRegistration';
import ConsentForm from './components/ConsentForm';
import CheckConsent from './pages/CheckConsent';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ConsentVersions from './pages/ConsentVersions';
import ConsentVersionTargeting from './pages/VersionTargeting';
import ConsentVersionManager from './pages/ConsentVersionManager';
import FormTemplateManager from './pages/FormTemplateManager';
import ConsentFormEditor from './pages/ConsentFormEditor';
import clearStorage from './utils/clearStorage';
import StorageCleaner from './components/StorageCleaner';
import './App.css';

// Admin Components
import AdminLayout from './layouts/AdminLayout';

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

// Customer Layout Component
const CustomerLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={
          <CustomerLayout>
            <LandingPage />
          </CustomerLayout>
        } />
        <Route path="/register" element={
          <CustomerLayout>
            <InitialRegistration />
          </CustomerLayout>
        } />
        <Route path="/consent" element={
          <CustomerLayout>
            <ConsentForm />
          </CustomerLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/versions" element={
          <ProtectedAdminRoute>
            <ConsentVersions />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/version-targeting" element={
          <ProtectedAdminRoute>
            <ConsentVersionTargeting />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/version-manager" element={
          <ProtectedAdminRoute>
            <ConsentVersionManager />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/form-templates" element={
          <ProtectedAdminRoute>
            <FormTemplateManager />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/consent-forms" element={
          <ProtectedAdminRoute>
            <ConsentFormEditor />
          </ProtectedAdminRoute>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Storage Cleaner Button - Always visible */}
      <StorageCleaner />
    </Router>
  );
}

export default App;
