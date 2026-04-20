import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000,   // 30s — AI processing can be slow
});

// Attach JWT to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If backend returns 401, clear token and redirect to /auth
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default api;
