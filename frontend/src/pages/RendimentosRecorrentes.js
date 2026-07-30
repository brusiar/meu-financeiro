import React, { useState, useEffect } from 'react';
import api from '../services/api';

function RendimentosRecorrentes() {
  const [pagadores, setPagadores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const user = localStorage.getItem('user');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const res = await api.get(`/api/rendimentos-recorrentes?username=${user}`);
      setPagadores(res.data);
    } catch (e) {
      console.error('Erro ao carregar pagadores recorrentes:', e);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/rendimentos-recorrentes/${editing.id}`, { ...formData, username: user });
      } else {
        await api.post('/api/rendimentos-recorrentes', { ...formData, username: user });
      }
      carregar();
      fecharForm();
    } catch (e) {
      alert('Erro ao salvar: ' + (e.response?.data?.message || e.message));
    }
  };

  const excluir = async (id) => {
    if (window.confirm('Deseja excluir este pagador recorrente?')) {
      try {
        await api.delete(`/api/rendimentos-recorrentes/${id}`);
        carregar();
      } catch (e) {
        alert('Erro ao excluir');
      }
    }
  };

  const fecharForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ nome: '', descricao: '' });
  };

  const abrirEdicao = (r) => {
    setEditing(r);
    setFormData({ nome: r.nome, descricao: r.descricao || '' });
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Pagadores Recorrentes</h2>
        <button className="btn" onClick={() => setShowForm(true)}>Novo Pagador</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editing ? 'Editar' : 'Novo'} Pagador Recorrente</h3>
          <form onSubmit={salvar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Nome do Pagador:</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Vivo, Empresa X"
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
        <h3>Pagadores Cadastrados — {pagadores.length} pagador(es)</h3>
        {pagadores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum pagador recorrente cadastrado</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Pagador</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagadores.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{r.nome}</td>
                    <td style={{ padding: '0.5rem', color: '#666' }}>{r.descricao || '-'}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => abrirEdicao(r)}
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(r.id)}
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

export default RendimentosRecorrentes;
