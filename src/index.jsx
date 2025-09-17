import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserConsentPage from './pages/UserConsentPage';
import AdminPolicyManager from './pages/AdminPolicyManager';
import './index.css';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/user" element={<UserConsentPage />} />
        <Route path="/admin" element={<AdminPolicyManager />} />
        <Route path="/:tenant/consent" element={<UserConsentPage />} />
        <Route path="/" element={<Navigate to="/user" replace />} />
      </Routes>
    </HashRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
