// API Configuration
const API_CONFIG = {
  // Production API URL
  BASE_URL: 'https://consent-back.onrender.com',
  
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
