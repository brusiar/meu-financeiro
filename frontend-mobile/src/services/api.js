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
  getContasPagar: () => api.get(`/api/contas?username=${localStorage.getItem('user') || 'admin'}`),
  createContaPagar: (data) => api.post('/api/contas', data),
  updateContaPagar: (id, data) => api.put(`/api/contas/${id}`, data),
  deleteContaPagar: (id) => api.delete(`/api/contas/${id}`),
  marcarContaComoPaga: (id) => api.put(`/api/contas/${id}/pagar`),
  getCartoes: () => api.get('/api/cartoes'),
  getFontesRenda: () => api.get(`/api/rendimentos?username=${localStorage.getItem('user') || 'admin'}`),
  createFonteRenda: (data) => api.post('/api/rendimentos', data),
  updateFonteRenda: (id, data) => api.put(`/api/rendimentos/${id}`, data),
  deleteFonteRenda: (id) => api.delete(`/api/rendimentos/${id}`),
  getCategorias: () => api.get('/api/categorias'),
  // Mesada
  getPessoasMesada: (username) => api.get(`/api/mesada/pessoas?username=${username}`),
  createPessoaMesada: (data) => api.post('/api/mesada/pessoas', data),
  updatePessoaMesada: (id, data) => api.put(`/api/mesada/pessoas/${id}`, data),
  deletePessoaMesada: (id, username) => api.delete(`/api/mesada/pessoas/${id}?username=${username}`),
  getAcoesMesada: (pessoaId) => api.get(`/api/mesada/acoes/${pessoaId}`),
  createAcaoMesada: (data) => api.post('/api/mesada/acoes', data),
  updateAcaoMesada: (id, data) => api.put(`/api/mesada/acoes/${id}`, data),
  deleteAcaoMesada: (id, username) => api.delete(`/api/mesada/acoes/${id}?username=${username}`),
  getRelatorioMesada: (pessoaId) => api.get(`/api/mesada/relatorio/${pessoaId}`),
  // Dívidas
  createDivida: (data) => api.post('/api/dividas', data),
  updateDivida: (id, data) => api.put(`/api/dividas/${id}`, data),
  deleteDivida: (id) => api.delete(`/api/dividas/${id}`),
  getPagamentosDivida: (dividaId) => api.get(`/api/dividas/${dividaId}/pagamentos`),
  createPagamentoDivida: (dividaId, data) => api.post(`/api/dividas/${dividaId}/pagamentos`, data),
  deletePagamentoDivida: (id) => api.delete(`/api/dividas/pagamentos/${id}`),
  // Dashboard específicos
  getContasMes: (username, ano, mes) => api.get(`/api/dashboard/contas-mes?username=${username}&ano=${ano}&mes=${mes}`),
  getRendimentosMes: (username, ano, mes) => api.get(`/api/dashboard/rendimentos-mes?username=${username}&ano=${ano}&mes=${mes}`),
  getResumoMes: (username, ano, mes) => api.get(`/api/dashboard/resumo-mes?username=${username}&ano=${ano}&mes=${mes}`),
  getDividas: (username) => api.get(`/api/dividas?username=${username}`),
};

export default api;