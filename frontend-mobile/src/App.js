import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContasPagar from './pages/ContasPagar';
import Rendimentos from './pages/Rendimentos';
import Dividas from './pages/Dividas';
import Mesada from './pages/Mesada';
import BottomNav from './components/BottomNav';

// Componente para verificar autenticação
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Layout com navegação inferior
const AppLayout = ({ children }) => {
  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <h1>💰 Meu Financeiro</h1>
      </header>
      {children}
      <BottomNav />
    </div>
  );
};

// Páginas temporárias para as outras rotas
const ComingSoon = ({ title }) => (
  <div className="mobile-content">
    <div className="mobile-card">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>{title}</h2>
        <p style={{ color: '#6c757d', marginTop: '1rem' }}>
          Em desenvolvimento...
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        } />
        
        <Route path="/contas" element={
          <PrivateRoute>
            <AppLayout>
              <ContasPagar />
            </AppLayout>
          </PrivateRoute>
        } />
        
        <Route path="/rendimentos" element={
          <PrivateRoute>
            <AppLayout>
              <Rendimentos />
            </AppLayout>
          </PrivateRoute>
        } />
        
        <Route path="/dividas" element={
          <PrivateRoute>
            <AppLayout>
              <Dividas />
            </AppLayout>
          </PrivateRoute>
        } />
        
        <Route path="/mesada" element={
          <PrivateRoute>
            <AppLayout>
              <Mesada />
            </AppLayout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;