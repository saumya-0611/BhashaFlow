/**
 * BhashaFlow — centralised Axios instance.
 *
 * Every API call in the app imports from here.
 * Automatically:
 *   - Sets the base URL to the backend
 *   - Attaches the JWT from localStorage on every request
 *   - Redirects to /auth on a 401 so stale tokens are handled globally
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 60000, // 60s — AI processing can take up to ~15s
});

// ── Request interceptor — attach token ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;