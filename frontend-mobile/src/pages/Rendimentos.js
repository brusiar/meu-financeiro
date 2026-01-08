import React, { useState, useEffect } from 'react';
import { financeService } from '../services/api';

const Rendimentos = () => {
  const [rendimentos, setRendimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [editingRendimento, setEditingRendimento] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    recorrente: false,
    dataRecebimento: new Date().toISOString().split('T')[0]
  });

  const user = localStorage.getItem('user') || 'admin';

  useEffect(() => {
    carregarDados();
  }, [mesAtual]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarRendimentos(),
        carregarHistorico()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const carregarRendimentos = async () => {
    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const response = await financeService.getFontesRenda();
      // Filtrar por mês se necessário
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
      // Fallback para dados mock
      setRendimentos([
        {
          id: 1,
          descricao: 'Salário',
          valor: 4500.00,
          recorrente: true,
          dataRecebimento: '2026-01-05'
        }
      ]);
    }
  };

  const carregarHistorico = async () => {
    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const response = await financeService.getRendimentosMes(user, ano, mes);
      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistorico([
        { id: 1, descricao: 'Salário', valor: 4500.00 }
      ]);
    }
  };

  const setMockData = () => {
    setRendimentos([
      { id: 1, descricao: 'Salário', valor: 4500.00, recorrente: true, dataRecebimento: '2026-01-05' }
    ]);
    setHistorico([
      { id: 1, descricao: 'Salário', valor: 4500.00 }
    ]);
  };

  const salvarRendimento = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formData, username: user };
      
      if (editingRendimento) {
        await financeService.updateFonteRenda(editingRendimento.id, dados);
      } else {
        await financeService.createFonteRenda(dados);
      }
      
      carregarRendimentos();
      setShowForm(false);
      setEditingRendimento(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar rendimento:', error);
      alert('Erro ao salvar rendimento');
    }
  };

  const excluirRendimento = async (id) => {
    if (window.confirm('Deseja excluir este rendimento?')) {
      try {
        await financeService.deleteFonteRenda(id);
        carregarRendimentos();
      } catch (error) {
        console.error('Erro ao excluir rendimento:', error);
        // Fallback local
        setRendimentos(rendimentos.filter(r => r.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      recorrente: false,
      dataRecebimento: new Date().toISOString().split('T')[0]
    });
  };

  const getMesAno = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[mesAtual.getMonth()]}/${mesAtual.getFullYear()}`;
  };

  const voltarMes = () => {
    const novaData = new Date(mesAtual);
    novaData.setMonth(novaData.getMonth() - 1);
    setMesAtual(novaData);
  };

  const avancarMes = () => {
    const novaData = new Date(mesAtual);
    novaData.setMonth(novaData.getMonth() + 1);
    setMesAtual(novaData);
  };

  const totalRendimentos = rendimentos.reduce((sum, r) => sum + parseFloat(r.valor), 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Tela de histórico
  if (showHistorico) {
    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📊 Histórico de Rendimentos</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => setShowHistorico(false)}
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="mobile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={voltarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>←</button>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>{getMesAno()}</h3>
            <button onClick={avancarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>→</button>
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6c757d' }}>Nenhum recebimento registrado</p>
          </div>
        ) : (
          historico.map(item => (
            <div key={item.id} className="list-item">
              <div className="item-header">
                <span className="item-title">{item.descricao}</span>
                <span className="item-value positive">
                  R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="mobile-content">
      {/* Navegação de Mês */}
      <div className="mobile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={voltarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>←</button>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>{getMesAno()}</h3>
          <button onClick={avancarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>→</button>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mobile-card">
        <button 
          className="btn-mobile btn-success"
          onClick={() => setShowForm(true)}
        >
          ➕ Novo Rendimento
        </button>
        <button 
          className="btn-mobile" 
          style={{ backgroundColor: '#6f42c1' }}
          onClick={() => {
            setShowHistorico(true);
            carregarHistorico();
          }}
        >
          📊 Histórico
        </button>
      </div>

      {/* Resumo */}
      <div className="mobile-card" style={{ backgroundColor: '#d4edda', textAlign: 'center' }}>
        <div className="summary-value positive" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="summary-label" style={{ color: '#155724' }}>Total de Rendimentos Mensais</div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">{editingRendimento ? 'Editar' : 'Novo'} Rendimento</h3>
          </div>
          
          <form onSubmit={salvarRendimento}>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-input"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Salário, Freelance..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data do Recebimento</label>
              <input
                type="date"
                className="form-input"
                value={formData.dataRecebimento}
                onChange={(e) => setFormData({...formData, dataRecebimento: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.recorrente}
                  onChange={(e) => setFormData({...formData, recorrente: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                Rendimento recorrente
              </label>
            </div>

            <button type="submit" className="btn-mobile btn-success">
              {editingRendimento ? 'Atualizar' : 'Salvar'}
            </button>
            
            <button 
              type="button" 
              className="btn-mobile btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingRendimento(null);
                resetForm();
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Lista de Rendimentos */}
      {rendimentos.length === 0 ? (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6c757d' }}>Nenhum rendimento cadastrado</p>
        </div>
      ) : (
        rendimentos.map(rendimento => (
          <div key={rendimento.id} className="list-item">
            <div className="item-header">
              <span className="item-title">{rendimento.descricao}</span>
              <span className="item-value positive">
                R$ {parseFloat(rendimento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="item-details">
              {rendimento.recorrente ? '🔄 Recorrente' : '📅 Único'} • Recebimento: {new Date(rendimento.dataRecebimento + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  setEditingRendimento(rendimento);
                  setFormData({
                    descricao: rendimento.descricao,
                    valor: rendimento.valor,
                    recorrente: rendimento.recorrente,
                    dataRecebimento: rendimento.dataRecebimento
                  });
                  setShowForm(true);
                }}
                className="btn-mobile"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#6c757d' }}
              >
                ✏️ Editar
              </button>
              
              <button 
                onClick={() => excluirRendimento(rendimento.id)}
                className="btn-mobile btn-danger"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))
      )}

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => setShowForm(true)}
      >
        +
      </button>
    </div>
  );
};

export default Rendimentos;