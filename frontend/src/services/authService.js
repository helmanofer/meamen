import axios from 'axios';
import apiConfig from '../config/apiConfig';

const TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Create a separate instance for auth operations
const authClient = axios.create({
  baseURL: apiConfig.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

class AuthService {
  // Get access token from storage
  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Get refresh token from storage
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  // Save tokens to storage
  saveTokens(accessToken, refreshToken, expiresIn = 3600) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    
    // Calculate expiry time and store it (current time + expiry seconds)
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
  }

  // Check if token is expired
  isTokenExpired() {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    
    return Date.now() > parseInt(expiryTime);
  }

  // Clear all auth data
  clearTokens() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem('credentials');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Refresh token
  async refreshToken() {
    // Try to use the existing token to reauthenticate
    try {
      // Since we don't have a dedicated refresh token endpoint,
      // we'll reuse the login endpoint with stored credentials
      const storedCredentials = localStorage.getItem('credentials');
      
      if (!storedCredentials) {
        throw new Error('No stored credentials available for token refresh');
      }
      
      const credentials = JSON.parse(storedCredentials);
      
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      // Add grant_type for FastAPI auth conformance
      formData.append('grant_type', 'password');
      
      const response = await authClient.post(
        apiConfig.auth.login,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const { access_token, expires_in } = response.data;
      this.saveTokens(access_token, null, expires_in || 3600);
      
      return access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Get a valid token (refreshes if needed)
  async getValidToken() {
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    // If token is expired, try to refresh it
    if (this.isTokenExpired()) {
      return await this.refreshToken();
    }

    // Return existing token if it's still valid
    return this.getToken();
  }

  // Login
  async login(credentials) {
    const formData = new FormData();
    
    // Add username and password
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    // Add grant_type for FastAPI auth conformance
    formData.append('grant_type', 'password');

    const response = await authClient.post(
      apiConfig.auth.login,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Store credentials securely for potential token refresh
    localStorage.setItem('credentials', JSON.stringify({
      username: credentials.username,
      password: credentials.password
    }));

    const { access_token, expires_in } = response.data;
    // The API may not return refresh token, so we pass null
    this.saveTokens(access_token, null, expires_in || 3600);
    
    return response.data;
  }

  // Register
  async register(userData) {
    const response = await authClient.post(
      apiConfig.auth.register, 
      userData
    );
    
    // If registration returns tokens
    if (response.data.access_token) {
      const { access_token, refresh_token, expires_in } = response.data;
      this.saveTokens(access_token, refresh_token, expires_in);
    }
    
    return response.data;
  }

  // Forgot password
  async forgotPassword(email) {
    return await authClient.post(
      apiConfig.auth.forgotPassword, 
      { email }
    );
  }

  // Reset password
  async resetPassword(token, newPassword) {
    return await authClient.post(
      apiConfig.auth.resetPassword, 
      { token, password: newPassword }
    );
  }

  // Logout
  logout() {
    this.clearTokens();
  }
}

export default new AuthService();