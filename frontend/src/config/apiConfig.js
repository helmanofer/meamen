// Allow configurable API base URL with default fallback
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL ||
  "http://127.0.0.1:8000";

export default {
  API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/auth/jwt/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/users/me`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    // There's no specific refresh endpoint in the API, using login endpoint for refresh
    refreshToken: `${API_BASE_URL}/auth/jwt/login`,
    logout: `${API_BASE_URL}/auth/jwt/logout`,
  },
};
