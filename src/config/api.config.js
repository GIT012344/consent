// API Configuration
const API_CONFIG = {
  // Determine API base URL based on environment
  getApiBaseUrl: () => {
    // Always use localhost:3000 for now
    return 'http://localhost:3000/api';
  },
  
  // API endpoints
  ENDPOINTS: {
    // Simple Policy
    SIMPLE_POLICY: '/simple-policy',
    SIMPLE_POLICY_ACTIVE: '/simple-policy/active',
    
    // Consent
    CONSENT_SUBMIT: '/consent/submit',
    CONSENT_RECORDS: '/consent/records',
    CONSENT_ACTIVE_VERSION: '/consent/active-version',
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
