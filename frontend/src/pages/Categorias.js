import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({ nome: '' });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/api/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const salvarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await api.put(`/api/categorias/${editingCategoria.id}`, formData);
      } else {
        await api.post('/api/categorias', formData);
      }
      carregarCategorias();
      setShowForm(false);
      setEditingCategoria(null);
      setFormData({ nome: '' });
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const excluirCategoria = async (id) => {
    if (window.confirm('Deseja excluir esta categoria?')) {
      try {
        await api.delete(`/api/categorias/${id}`);
        carregarCategorias();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Categorias</h2>
        <button className="btn" onClick={() => setShowForm(true)}>
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingCategoria ? 'Editar' : 'Nova'} Categoria</h3>
          <form onSubmit={salvarCategoria}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Nome:</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editingCategoria ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={() => {
                setShowForm(false);
                setEditingCategoria(null);
                setFormData({ nome: '' });
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Lista de Categorias</h3>
        {categorias.length === 0 ? (
          <p>Nenhuma categoria cadastrada</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {categorias.map(categoria => (
              <div key={categoria.id} style={{ 
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>{categoria.nome}</h4>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setEditingCategoria(categoria);
                      setFormData({ nome: categoria.nome });
                      setShowForm(true);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => excluirCategoria(categoria.id)}
                    style={{ 
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorias;