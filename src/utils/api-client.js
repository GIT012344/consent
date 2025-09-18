import axios from 'axios';

// Determine the correct API URL based on environment
const getApiUrl = () => {
  // Check if we have an environment variable set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Production URLs - check window location to determine which backend to use
  if (process.env.NODE_ENV === 'production') {
    // Use the correct backend URL for production
    return 'https://consent-backend-3hmi.onrender.com';
  }
  
  // Development
  return 'http://localhost:3000';
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error details
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('API No Response:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export the configured client and the base URL
export default apiClient;
export const API_BASE_URL = getApiUrl();

// Utility function to build full URL
export const buildUrl = (endpoint) => {
  const baseUrl = getApiUrl();
  if (endpoint.startsWith('http')) {
    return endpoint; // Already a full URL
  }
  return `${baseUrl}${endpoint}`;
};
