import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export const financeService = {
  getDashboard: () => api.get('/api/dashboard'),
  getContasPagar: () => api.get('/api/contas-pagar'),
  createContaPagar: (data) => api.post('/api/contas-pagar', data),
  getCartoes: () => api.get('/api/cartoes'),
  getFontesRenda: () => api.get('/api/fontes-renda'),
  createFonteRenda: (data) => api.post('/api/fontes-renda', data),
};

export default api;