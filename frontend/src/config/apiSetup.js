import axios from 'axios';
import apiConfig from './apiConfig';
import authService from '../services/authService';

// Configure axios defaults
export function setupAPI() {
  // Get stored API settings if available
  const storedBaseUrl = localStorage.getItem('apiBaseUrl');
  
  // Apply base URL from settings or fallback to config
  if (storedBaseUrl) {
    axios.defaults.baseURL = storedBaseUrl;
  } else {
    axios.defaults.baseURL = apiConfig.API_BASE_URL;
  }
  
  // Set up default headers
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Accept'] = 'application/json';
  
  // Load custom headers if available
  try {
    const storedHeaders = localStorage.getItem('apiHeaders');
    if (storedHeaders) {
      const headers = JSON.parse(storedHeaders);
      headers.forEach(header => {
        if (header.key && header.value) {
          axios.defaults.headers.common[header.key] = header.value;
        }
      });
    }
  } catch (e) {
    console.error('Failed to load custom API headers', e);
  }

  // Set up request interceptor for authentication
  axios.interceptors.request.use(async config => {
    try {
      if (authService.isAuthenticated()) {
        // Get a valid token (refreshes if expired)
        const token = await authService.getValidToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  });

  // Set up response interceptor for token refresh
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // If error is 401 and not a retry attempt
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Try to refresh the token
          await authService.refreshToken();
          
          // Update authorization header with new token
          const newToken = authService.getToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // Token refresh failed, logout and redirect
          console.error('Token refresh failed:', refreshError);
          authService.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
}

export default setupAPI;