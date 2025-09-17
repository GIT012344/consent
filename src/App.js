import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import CreateSinglePolicy from './pages/CreateSinglePolicy';
import PolicyManager from './pages/PolicyManager';
import ConsentLinks from './pages/ConsentLinks';
import AdminPolicyManagement from './pages/AdminPolicyManagement';
import AdminLogin from './pages/AdminLogin';
import AdminConsentDashboard from './pages/AdminConsentDashboard';
import AdminConsentManager from './pages/AdminConsentManager';
// import AdminConsentLinks from './pages/AdminConsentLinks'; // ไม่จำเป็น - ซ้ำกับ Dashboard
import AdminLayout from './layouts/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ConsentFlowPage from './pages/ConsentFlowPage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import SimplePolicyManager from './pages/SimplePolicyManager';
import CheckConsent from './pages/CheckConsent';

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Create router with future flags enabled
const router = createBrowserRouter([
  // Public Routes
  { path: "/", element: <Navigate to="/consent/select-language" /> },
  { path: "/consent/select-language", element: <LanguageSelectionPage /> },
  { path: "/consent/:userType", element: <ConsentFlowPage /> },
  { path: "/create-policy", element: <CreateSinglePolicy /> },
  { path: "/policy-manager", element: <SimplePolicyManager /> },
  { path: "/check-consent", element: <CheckConsent /> },
  
  // Admin Routes
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout>
          <AdminConsentDashboard />
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  {
    path: "/admin/consents",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout>
          <AdminConsentManager />
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  {
    path: "/admin/links",
    element: (
      <ProtectedAdminRoute>
        {/* <Route path="consent-links" element={<AdminConsentLinks />} /> ไม่จำเป็น - ซ้ำกับ Dashboard */}
        <AdminLayout>
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  {
    path: "/admin/policies",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout>
          <SimplePolicyManager />
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  {
    path: "/admin/create-policy",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout>
          <CreateSinglePolicy />
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  {
    path: "/admin/consent-links",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout>
          <SimplePolicyManager />
        </AdminLayout>
      </ProtectedAdminRoute>
    )
  },
  // Default redirect
  { path: "*", element: <Navigate to="/" replace /> }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
