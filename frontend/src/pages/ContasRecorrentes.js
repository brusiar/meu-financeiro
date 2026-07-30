import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ContasRecorrentes() {
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', categoriaId: '' });
  const user = localStorage.getItem('user');

  useEffect(() => {
    carregar();
    carregarCategorias();
  }, []);

  const carregar = async () => {
    try {
      const res = await api.get(`/api/contas-recorrentes?username=${user}`);
      setContas(res.data);
    } catch (e) {
      console.error('Erro ao carregar contas recorrentes:', e);
    }
  };

  const carregarCategorias = async () => {
    try {
      const res = await api.get('/api/categorias');
      setCategorias(res.data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/contas-recorrentes/${editing.id}`, { ...formData, username: user });
      } else {
        await api.post('/api/contas-recorrentes', { ...formData, username: user });
      }
      carregar();
      fecharForm();
    } catch (e) {
      alert('Erro ao salvar: ' + (e.response?.data?.message || e.message));
    }
  };

  const excluir = async (id) => {
    if (window.confirm('Deseja excluir esta conta recorrente?')) {
      try {
        await api.delete(`/api/contas-recorrentes/${id}`);
        carregar();
      } catch (e) {
        alert('Erro ao excluir');
      }
    }
  };

  const fecharForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ nome: '', descricao: '', categoriaId: '' });
  };

  const abrirEdicao = (conta) => {
    setEditing(conta);
    setFormData({
      nome: conta.nome,
      descricao: conta.descricao || '',
      categoriaId: conta.categoria ? String(conta.categoria.id) : ''
    });
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Contas Recorrentes</h2>
        <button className="btn" onClick={() => setShowForm(true)}>Nova Conta Recorrente</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editing ? 'Editar' : 'Nova'} Conta Recorrente</h3>
          <form onSubmit={salvar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Nome da Conta:</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Descrição:</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label>Categoria:</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editing ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={fecharForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Lista de Contas Recorrentes — {contas.length} conta(s)</h3>
        {contas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhuma conta recorrente cadastrada</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.map(conta => (
                  <tr key={conta.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{conta.nome}</td>
                    <td style={{ padding: '0.5rem', color: '#666' }}>{conta.descricao || '-'}</td>
                    <td style={{ padding: '0.5rem' }}>{conta.categoria ? conta.categoria.nome : '-'}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => abrirEdicao(conta)}
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(conta.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContasRecorrentes;
