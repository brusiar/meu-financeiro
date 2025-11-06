import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
    pessoaMesadaId: ''
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarUsuarios();
    carregarPessoas();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/api/usuarios');
      console.log('Usuários carregados:', response.data);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarPessoas = async () => {
    try {
      const response = await api.get(`/api/mesada/pessoas?username=${user}`);
      setPessoas(response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        await api.put(`/api/usuarios/${editingUsuario.id}`, formData);
      } else {
        await api.post('/api/usuarios', formData);
      }
      carregarUsuarios();
      setShowForm(false);
      setEditingUsuario(null);
      setFormData({ username: '', email: '', password: '', role: 'USER', pessoaMesadaId: '' });
      alert('Usuário salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar usuário');
    }
  };

  const excluirUsuario = async (id) => {
    if (window.confirm('Deseja excluir este usuário?')) {
      try {
        await api.delete(`/api/usuarios/${id}`);
        carregarUsuarios();
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'ADMIN': 'Administrador',
      'USER': 'Usuário Completo',
      'MESADA': 'Apenas Mesada'
    };
    return labels[role] || role;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Gerenciar Usuários</h2>
        <button className="btn" onClick={() => setShowForm(true)}>Novo Usuário</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingUsuario ? 'Editar' : 'Novo'} Usuário</h3>
          <form onSubmit={salvarUsuario}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Nome de Usuário:</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div>
                <label>Email:</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Senha {editingUsuario && '(deixe em branco para não alterar)'}:</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingUsuario} />
              </div>
              <div>
                <label>Perfil:</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value, pessoaMesadaId: e.target.value !== 'MESADA' ? '' : formData.pessoaMesadaId})}>
                  <option value="ADMIN">Administrador</option>
                  <option value="USER">Usuário Completo</option>
                  <option value="MESADA">Apenas Mesada</option>
                </select>
              </div>
            </div>
            {formData.role === 'MESADA' && (
              <div style={{ marginBottom: '1rem' }}>
                <label>Vincular à Pessoa:</label>
                <select value={formData.pessoaMesadaId} onChange={(e) => setFormData({...formData, pessoaMesadaId: e.target.value})} required>
                  <option value="">Selecione uma pessoa</option>
                  {pessoas.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn" style={{ marginRight: '0.5rem' }}>{editingUsuario ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingUsuario(null); setFormData({ username: '', email: '', password: '', role: 'USER', pessoaMesadaId: '' }); }}>Cancelar</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Usuários Cadastrados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Usuário</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Perfil</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Pessoa Vinculada</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{usuario.username}</td>
                <td style={{ padding: '0.5rem' }}>{usuario.email}</td>
                <td style={{ padding: '0.5rem' }}>{getRoleLabel(usuario.role)}</td>
                <td style={{ padding: '0.5rem' }}>{usuario.pessoaMesada?.nome || '-'}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <button onClick={() => { setEditingUsuario(usuario); setFormData({ username: usuario.username, email: usuario.email, password: '', role: usuario.role, pessoaMesadaId: usuario.pessoaMesada?.id || '' }); setShowForm(true); }} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Editar</button>
                  <button onClick={() => excluirUsuario(usuario.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
