import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = () => api.get('/api/health');
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const changePassword = (passwordData) => api.post('/api/auth/change-password', passwordData);

export default api;