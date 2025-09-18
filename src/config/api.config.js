// API Configuration
const API_CONFIG = {
  // Dynamic API URL based on environment
  BASE_URL: process.env.REACT_APP_API_URL || 
           (process.env.NODE_ENV === 'production' 
             ? 'https://consent-backend-3hmi.onrender.com' // Your existing backend URL
             : 'http://localhost:3000'),
  
  // API endpoints
  ENDPOINTS: {
    // Simple Policy
    SIMPLE_POLICY: '/api/simple-policy',
    SIMPLE_POLICY_ACTIVE: '/api/simple-policy/active',
    
    // Consent
    CONSENT_SUBMIT: '/api/consent/submit',
    CONSENT_RECORDS: '/api/consent/records',
    CONSENT_ACTIVE_VERSION: '/api/consent/active-version',
    
    // Admin
    ADMIN_STATISTICS: '/api/admin/statistics',
    ADMIN_DASHBOARD_STATS: '/api/admin/dashboard/stats',
    ADMIN_DASHBOARD_RECENT: '/api/admin/dashboard/recent',
    ADMIN_EXPORT: '/api/admin/export',
    
    // Titles
    TITLES: '/api/titles',
    
    // Form Fields
    FORM_FIELDS: '/api/form-fields',
    FORM_TEMPLATES: '/api/form-templates',
    
    // User Types
    USER_TYPES: '/api/user-types',
    
    // Upload
    UPLOAD_CONSENT_VERSION: '/api/upload/consent-version',
    UPLOAD_CONSENT_VERSIONS: '/api/upload/consent-versions',
  }
};

export default API_CONFIG;
