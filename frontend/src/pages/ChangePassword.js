import React, { useState } from 'react';
import api from '../services/api';

function ChangePassword({ user, onClose }) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Nova senha e confirmação não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/change-password', {
        username: user,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Senha alterada com sucesso!');
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Alterar Senha
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Senha Atual:</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Nova Senha:</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Confirmar Nova Senha:</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              required
            />
          </div>
          
          {error && (
            <div style={{ color: '#e74c3c', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ color: '#27ae60', marginBottom: '1rem', textAlign: 'center' }}>
              {success}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn"
              style={{ flex: 1 }}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
            
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;