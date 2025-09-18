// API Configuration Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://consent-backend-3hmi.onrender.com'  // Correct backend URL
    : 'http://localhost:3000');

export const API_ENDPOINTS = {
  // Consent
  CONSENT_SUBMIT: '/api/consent/submit',
  CONSENT_RECORDS: '/api/consent/records',
  
  // Titles
  TITLES: '/api/titles',
  
  // Form Fields
  FORM_FIELDS: '/api/form-fields',
  
  // Simple Policy
  SIMPLE_POLICY: '/api/simple-policy',
  SIMPLE_POLICY_ACTIVE: '/api/simple-policy/active',
  
  // Admin
  ADMIN_STATISTICS: '/api/admin/statistics',
  ADMIN_DASHBOARD_STATS: '/api/admin/dashboard/stats',
  ADMIN_EXPORT: '/api/admin/export',
  
  // User Types
  USER_TYPES: '/api/user-types',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint; // Already a full URL
  }
  return `${API_BASE_URL}${endpoint}`;
};
