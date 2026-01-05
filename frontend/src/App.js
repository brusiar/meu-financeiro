import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ContasPagar from './pages/ContasPagar';
import Categorias from './pages/Categorias';
import Rendimentos from './pages/Rendimentos';
import Mesada from './pages/Mesada';
import Dividas from './pages/Dividas';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [pessoaMesada, setPessoaMesada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('userRole');
    const savedPessoa = localStorage.getItem('pessoaMesada');
    if (savedUser) {
      setUser(savedUser);
      setUserRole(savedRole || 'USER');
      setPessoaMesada(savedPessoa ? JSON.parse(savedPessoa) : null);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, role, pessoa) => {
    setUser(userData);
    setUserRole(role || 'USER');
    setPessoaMesada(pessoa);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('pessoaMesada');
    setUser(null);
    setUserRole(null);
    setPessoaMesada(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1>Meu Financeiro</h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              className="mobile-menu-btn"
            >
              ☰
            </button>
          </div>
          <div className="nav-links" style={{ display: showMobileMenu ? 'flex' : undefined }}>
            {userRole !== 'MESADA' && <a href="/">Home</a>}
            {userRole !== 'MESADA' && <a href="/contas">Contas</a>}
            {userRole !== 'MESADA' && <a href="/dividas">Dívidas</a>}
            {userRole !== 'MESADA' && <a href="/rendimentos">Rendimentos</a>}
            <a href="/mesada">Mesada</a>
            {userRole !== 'MESADA' && <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setShowConfigMenu(!showConfigMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Ajustes {showConfigMenu ? '▲' : '▼'}
              </button>
              {showConfigMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  minWidth: '200px',
                  zIndex: 1000,
                  marginTop: '0.5rem'
                }}>
                  <a
                    href="/categorias"
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: '#333',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    Categorias
                  </a>
                  {userRole === 'ADMIN' && (
                    <a
                      href="/usuarios"
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        color: '#333',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      Usuários
                    </a>
                  )}
                </div>
              )}
            </div>}
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'none', 
                border: '1px solid white', 
                color: 'white', 
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            {userRole === 'MESADA' ? (
              <>
                <Route path="/" element={<Navigate to="/mesada" replace />} />
                <Route path="/mesada" element={<Mesada pessoaMesadaId={pessoaMesada?.id} userRole={userRole} />} />
                <Route path="*" element={<Navigate to="/mesada" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contas" element={<ContasPagar />} />
                <Route path="/dividas" element={<Dividas />} />
                <Route path="/rendimentos" element={<Rendimentos />} />
                <Route path="/mesada" element={<Mesada pessoaMesadaId={pessoaMesada?.id} userRole={userRole} />} />
                <Route path="/categorias" element={<Categorias />} />
                {userRole === 'ADMIN' && <Route path="/usuarios" element={<Usuarios />} />}
              </>
            )}
          </Routes>
        </main>
        
        {showChangePassword && (
          <ChangePassword 
            user={user} 
            onClose={() => setShowChangePassword(false)} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;