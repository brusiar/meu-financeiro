import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Rendimentos() {
  const [rendimentos, setRendimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [editingRendimento, setEditingRendimento] = useState(null);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    diaRecebimento: '',
    recorrente: true
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarRendimentos();
  }, []);

  const carregarRendimentos = async () => {
    try {
      const response = await api.get(`/api/rendimentos?username=${user}`);
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
      alert('Erro ao carregar rendimentos');
    }
  };

  const salvarRendimento = async (e) => {
    e.preventDefault();
    try {
      const dados = {
        ...formData,
        username: user
      };

      if (editingRendimento) {
        await api.put(`/api/rendimentos/${editingRendimento.id}`, dados);
        alert('Rendimento atualizado com sucesso!');
      } else {
        await api.post('/api/rendimentos', dados);
        alert('Rendimento cadastrado com sucesso!');
      }

      setShowForm(false);
      setEditingRendimento(null);
      setFormData({ descricao: '', valor: '', diaRecebimento: '', recorrente: true });
      carregarRendimentos();
    } catch (error) {
      console.error('Erro ao salvar rendimento:', error);
      alert('Erro ao salvar rendimento');
    }
  };

  const excluirRendimento = async (id) => {
    if (!window.confirm('Deseja realmente excluir este rendimento?')) return;
    
    try {
      await api.delete(`/api/rendimentos/${id}`);
      alert('Rendimento excluído com sucesso!');
      carregarRendimentos();
    } catch (error) {
      console.error('Erro ao excluir rendimento:', error);
      alert('Erro ao excluir rendimento');
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await api.get(`/api/rendimentos/historico?username=${user}`);
      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      alert('Erro ao carregar histórico');
    }
  };

  const registrarRecebimento = async (id) => {
    try {
      await api.post(`/api/rendimentos/registrar/${id}`);
      alert('Recebimento registrado com sucesso!');
      carregarHistorico();
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      alert('Erro ao registrar recebimento');
    }
  };

  const totalRendimentos = rendimentos.reduce((sum, r) => sum + parseFloat(r.valor), 0);

  if (showHistorico) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Histórico de Rendimentos</h2>
          <button className="btn" onClick={() => setShowHistorico(false)}>
            Voltar
          </button>
        </div>

        <div className="card">
          <h3>Recebimentos Registrados</h3>
          {historico.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum recebimento registrado</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Data Recebimento</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Referência</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{item.descricao}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {new Date(item.dataRecebimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {item.mesReferencia}/{item.anoReferencia}
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Rendimentos</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => {
            setShowHistorico(true);
            carregarHistorico();
          }} style={{ backgroundColor: '#9b59b6' }}>
            Histórico
          </button>
          <button className="btn" onClick={() => setShowForm(true)}>
            Novo Rendimento
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingRendimento ? 'Editar' : 'Novo'} Rendimento</h3>
          <form onSubmit={salvarRendimento}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Descrição:</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Dia do Recebimento (1-31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaRecebimento}
                  onChange={(e) => setFormData({...formData, diaRecebimento: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                <label>
                  Rendimento recorrente
                  <input
                    type="checkbox"
                    checked={formData.recorrente}
                    onChange={(e) => setFormData({...formData, recorrente: e.target.checked})}
                    style={{ marginLeft: '0.5rem' }}
                  />
                </label>
              </div>
            </div>

            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editingRendimento ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={() => {
                setShowForm(false);
                setEditingRendimento(null);
                setFormData({ descricao: '', valor: '', diaRecebimento: '', recorrente: true });
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#d4edda', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>Total de Rendimentos Mensais</p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
          R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="card">
        <h3>Lista de Rendimentos - {rendimentos.length} rendimento(s)</h3>
        {rendimentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum rendimento cadastrado</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Dia Recebimento</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rendimentos.map(rendimento => (
                  <tr key={rendimento.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{rendimento.descricao}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      R$ {parseFloat(rendimento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      Dia {rendimento.diaRecebimento}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {rendimento.recorrente ? '🔄 Recorrente' : '📅 Único'}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => registrarRecebimento(rendimento.id)}
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Registrar
                      </button>
                      <button 
                        onClick={() => {
                          setEditingRendimento(rendimento);
                          setFormData({
                            descricao: rendimento.descricao,
                            valor: rendimento.valor,
                            diaRecebimento: rendimento.diaRecebimento,
                            recorrente: rendimento.recorrente
                          });
                          setShowForm(true);
                        }}
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirRendimento(rendimento.id)}
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

export default Rendimentos;
