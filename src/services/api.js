import axios from 'axios';

// ตั้งค่า Base URL สำหรับ API
const BASE_URL = process.env.REACT_APP_API_URL || 'https://consent-back.onrender.com/api';

// Clear large cookies/storage to prevent 431 error
if (typeof window !== 'undefined') {
  try {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Keep only essential items
    const essentials = {
      adminToken: localStorage.getItem('adminToken'),
      userType: localStorage.getItem('userType'),
      language: localStorage.getItem('language')
    };
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore essentials with size limit
    Object.entries(essentials).forEach(([key, value]) => {
      if (value && value.length < 100) {
        localStorage.setItem(key, value);
      }
    });
  } catch (e) {
    console.log('Storage cleanup error:', e);
  }
}

// สร้าง axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000
});

// Request interceptor - MINIMAL headers to prevent 431
api.interceptors.request.use(
  (config) => {
    // Only essential headers
    config.headers = {
      'Content-Type': config.data instanceof FormData ? 'multipart/form-data' : 'application/json'
    };
    
    // Add auth token only if needed and small
    const token = localStorage.getItem('adminToken');
    if (token && token.length < 100 && config.url?.includes('/admin')) {
      config.headers['Authorization'] = `Bearer ${token.substring(0, 100)}`;
    }
    
    // Remove any cookies from request
    config.withCredentials = false;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.message);
    return Promise.reject(error);
  }
);

// API Functions
const consentAPI = {
  // ส่งข้อมูลความยินยอม
  submitConsent: async (data) => {
    try {
      const response = await api.post('/consent/submit', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
  },

  // ตรวจสอบข้อมูลที่มีอยู่
  checkConsent: async (idPassport) => {
    try {
      const response = await api.get(`/consent/check/${idPassport}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, message: 'ไม่พบข้อมูลความยินยอม' };
      }
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
  },

  // ดึงรายการข้อมูลทั้งหมด (สำหรับ Admin)
  getConsentList: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/consent/list?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
  },

  // สถิติข้อมูล
  getStats: async () => {
    try {
      const response = await api.get('/consent/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
  },

  // Export ข้อมูล
  exportExcel: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/export/excel?${queryString}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการ Export' };
    }
  },

  exportCSV: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/export/csv?${queryString}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการ Export' };
    }
  },

  exportSummary: async () => {
    try {
      const response = await api.get('/export/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการ Export' };
    }
  },

  // Consent Version APIs
  getActiveVersionByType: async (userType = 'customer', language = 'th') => {
    try {
      const response = await api.get(`/consent/active-version/${userType}/${language}`);
      return response.data;
    } catch (error) {
      // Fallback to default active version
      return consentAPI.getActiveVersion(userType, language);
    }
  },

  getActiveVersion: async (userType, language) => {
    try {
      const response = await api.get(`/consent/active-version/${userType}/${language}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
  },

  // Consent Versions Management
  getConsentVersions: async () => {
    try {
      const response = await api.get('/consent/versions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล versions' };
    }
  },

  createConsentVersion: async (data) => {
    try {
      const response = await api.post('/consent/versions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง version' };
    }
  },

  updateConsentVersion: async (id, data) => {
    try {
      const response = await api.put(`/consent/versions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท version' };
    }
  },

  deleteConsentVersion: async (id) => {
    try {
      const response = await api.delete(`/consent/versions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการลบ version' };
    }
  },

  getTargetedVersion: async (idPassport) => {
    try {
      const response = await api.get(`/consent/targeted-version/${idPassport}`);
      return response.data;
    } catch (error) {
      // ถ้าไม่มี targeting rule ให้ใช้ default
      return consentAPI.getActiveVersion('customer', 'th');
    }
  },

  getConsentVersions: async () => {
    try {
      const response = await api.get('/upload/consent-versions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการดึงรายการ version' };
    }
  },

  uploadConsentVersion: async (formData) => {
    try {
      const response = await api.post('/upload/consent-version', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการอัพโหลด' };
    }
  },

  toggleConsentVersion: async (id) => {
    try {
      const response = await api.put(`/upload/consent-version/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' };
    }
  },

  deleteConsentVersion: async (id) => {
    try {
      const response = await api.delete(`/upload/consent-version/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'เกิดข้อผิดพลาดในการลบ' };
    }
  },

  downloadConsentVersion: (id) => {
    return `${BASE_URL}/upload/consent-version/${id}/download`;
  }
};

// Form Template API
const formTemplateAPI = {
  // Get all form templates
  getTemplates: () => api.get('/form-templates'),
  
  // Get template by user type
  getTemplateByUserType: (userType) => api.get(`/form-templates/user-type/${userType}`),
  
  // Create new template
  createTemplate: (data) => api.post('/form-templates', data),
  
  // Update template
  updateTemplate: (id, data) => api.put(`/form-templates/${id}`, data),
  
  // Delete template
  deleteTemplate: (id) => api.delete(`/form-templates/${id}`)
};

// Export all APIs
export { consentAPI, formTemplateAPI };
export default api;
