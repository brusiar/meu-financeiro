import React, { useState, useEffect } from 'react';
import { financeService } from '../services/api';

const Dividas = () => {
  const [dividas, setDividas] = useState([]);
  const [rendimentos, setRendimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDivida, setEditingDivida] = useState(null);
  const [selectedDivida, setSelectedDivida] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [showPagamentoForm, setShowPagamentoForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    instituicao: '',
    valorTotal: '',
    taxaJuros: '',
    tipoTaxa: 'MENSAL',
    valorParcela: '',
    saldoDevedor: ''
  });
  const [pagamentoForm, setPagamentoForm] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: ''
  });

  const user = localStorage.getItem('user') || 'admin';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarDividas(),
        carregarRendimentos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const carregarDividas = async () => {
    try {
      const response = await financeService.getDividas(user);
      setDividas(response.data);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      setDividas([]);
    }
  };

  const carregarRendimentos = async () => {
    try {
      const response = await financeService.getFontesRenda();
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
      setRendimentos([]);
    }
  };

  const carregarPagamentos = async (dividaId) => {
    try {
      const response = await financeService.getPagamentosDivida(dividaId);
      setPagamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setPagamentos([]);
    }
  };

  const setMockData = () => {
    setDividas([
      {
        id: 1,
        instituicao: 'Banco XYZ',
        valorTotal: 10000.00,
        taxaJuros: 2.5,
        tipoTaxa: 'MENSAL',
        valorParcela: 500.00,
        saldoDevedor: 8000.00
      }
    ]);
    setRendimentos([
      { id: 1, descricao: 'Salário', valor: 4500.00 }
    ]);
  };

  const salvarDivida = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formData, username: user };
      
      if (editingDivida) {
        await financeService.updateDivida(editingDivida.id, dados);
      } else {
        await financeService.createDivida(dados);
      }
      
      carregarDividas();
      setShowForm(false);
      setEditingDivida(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
      alert('Erro ao salvar dívida');
    }
  };

  const excluirDivida = async (id) => {
    if (window.confirm('Deseja excluir esta dívida?')) {
      try {
        await financeService.deleteDivida(id);
        carregarDividas();
      } catch (error) {
        console.error('Erro ao excluir dívida:', error);
      }
    }
  };

  const salvarPagamento = async (e) => {
    e.preventDefault();
    try {
      await financeService.createPagamentoDivida(selectedDivida.id, pagamentoForm);
      carregarPagamentos(selectedDivida.id);
      carregarDividas();
      setShowPagamentoForm(false);
      resetPagamentoForm();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento');
    }
  };

  const excluirPagamento = async (id) => {
    if (window.confirm('Deseja excluir este pagamento?')) {
      try {
        await financeService.deletePagamentoDivida(id);
        carregarPagamentos(selectedDivida.id);
        carregarDividas();
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      instituicao: '',
      valorTotal: '',
      taxaJuros: '',
      tipoTaxa: 'MENSAL',
      valorParcela: '',
      saldoDevedor: ''
    });
  };

  const resetPagamentoForm = () => {
    setPagamentoForm({
      dataPagamento: new Date().toISOString().split('T')[0],
      valorPago: ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Tela de detalhes da dívida
  if (selectedDivida) {
    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">🏦 {selectedDivida.instituicao}</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => setSelectedDivida(null)}
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Botão Registrar Pagamento */}
        <div className="mobile-card">
          <button 
            className="btn-mobile btn-success"
            onClick={() => setShowPagamentoForm(true)}
          >
            💰 Registrar Pagamento
          </button>
        </div>

        {/* Resumo da Dívida */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value" style={{color: '#007bff'}}>
              R$ {parseFloat(selectedDivida.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Valor Total</div>
          </div>
          <div className="summary-card">
            <div className="summary-value" style={{color: '#17a2b8'}}>
              {parseFloat(selectedDivida.taxaJuros).toFixed(2)}%
            </div>
            <div className="summary-label">{selectedDivida.tipoTaxa === 'MENSAL' ? 'Taxa a.m.' : 'Taxa a.a.'}</div>
          </div>
          <div className="summary-card" style={{ backgroundColor: '#f8d7da' }}>
            <div className="summary-value negative">
              R$ {parseFloat(selectedDivida.saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label" style={{color: '#721c24'}}>Saldo Devedor</div>
          </div>
          {selectedDivida.valorParcela && (
            <div className="summary-card">
              <div className="summary-value" style={{color: '#ffc107'}}>
                R$ {parseFloat(selectedDivida.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="summary-label">Parcela</div>
            </div>
          )}
        </div>

        {/* Formulário de Pagamento */}
        {showPagamentoForm && (
          <div className="mobile-card">
            <div className="card-header">
              <h3 className="card-title">💰 Registrar Pagamento</h3>
            </div>
            
            <form onSubmit={salvarPagamento}>
              <div className="form-group">
                <label className="form-label">Data do Pagamento</label>
                <input
                  type="date"
                  className="form-input"
                  value={pagamentoForm.dataPagamento}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, dataPagamento: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor Pago</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={pagamentoForm.valorPago}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, valorPago: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>

              <button type="submit" className="btn-mobile btn-success">
                Salvar Pagamento
              </button>
              
              <button 
                type="button" 
                className="btn-mobile btn-secondary"
                onClick={() => {
                  setShowPagamentoForm(false);
                  resetPagamentoForm();
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* Histórico de Pagamentos */}
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📋 Histórico de Pagamentos</h3>
          </div>
          
          {pagamentos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
              Nenhum pagamento registrado
            </div>
          ) : (
            pagamentos.map(pag => (
              <div key={pag.id} className="list-item">
                <div className="item-header">
                  <span className="item-title">Pagamento</span>
                  <span className="item-value positive">
                    R$ {parseFloat(pag.valorPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="item-details">
                  Data: {new Date(pag.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => excluirPagamento(pag.id)}
                    className="btn-mobile btn-danger"
                    style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Cálculos do resumo
  const totalSaldoDevedor = dividas.reduce((sum, d) => sum + parseFloat(d.saldoDevedor), 0);
  const totalParcelas = dividas.reduce((sum, d) => sum + (d.valorParcela ? parseFloat(d.valorParcela) : 0), 0);
  const totalRendimentos = rendimentos.reduce((sum, r) => sum + parseFloat(r.valor), 0);
  const totalValorOriginal = dividas.reduce((sum, d) => sum + parseFloat(d.valorTotal), 0);
  const totalPago = totalValorOriginal - totalSaldoDevedor;
  const percentualPago = totalValorOriginal > 0 ? (totalPago / totalValorOriginal) * 100 : 0;
  
  const dividaPrioritaria = dividas.length > 0 ? dividas.reduce((max, d) => {
    const taxaMax = parseFloat(max.taxaJuros);
    const taxaAtual = parseFloat(d.taxaJuros);
    return taxaAtual > taxaMax ? d : max;
  }) : null;

  return (
    <div className="mobile-content">
      {/* Botão Nova Dívida */}
      <div className="mobile-card">
        <button 
          className="btn-mobile btn-success"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Dívida
        </button>
      </div>

      {/* Alerta de Priorização */}
      {dividaPrioritaria && (
        <div className="mobile-card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#856404', fontSize: '1rem' }}>Priorize esta dívida!</p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
                <strong>{dividaPrioritaria.instituicao}</strong> - {parseFloat(dividaPrioritaria.taxaJuros).toFixed(2)}% {dividaPrioritaria.tipoTaxa === 'MENSAL' ? 'a.m.' : 'a.a.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo Geral */}
      <div className="summary-grid">
        <div className="summary-card" style={{ backgroundColor: '#f8d7da' }}>
          <div className="summary-value negative">
            R$ {totalSaldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="summary-label" style={{color: '#721c24'}}>Saldo Devedor</div>
        </div>
        <div className="summary-card" style={{ backgroundColor: '#d1ecf1' }}>
          <div className="summary-value" style={{color: '#17a2b8'}}>
            R$ {totalParcelas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="summary-label" style={{color: '#0c5460'}}>Total Parcelas</div>
        </div>
        <div className="summary-card" style={{ backgroundColor: '#d4edda' }}>
          <div className="summary-value positive">
            R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="summary-label" style={{color: '#155724'}}>Rendimentos</div>
        </div>
        <div className="summary-card" style={{ backgroundColor: '#fff3cd' }}>
          <div className="summary-value" style={{color: '#f39c12'}}>
            {totalRendimentos > 0 ? ((totalParcelas / totalRendimentos) * 100).toFixed(1) : 0}%
          </div>
          <div className="summary-label" style={{color: '#856404'}}>Comprometimento</div>
        </div>
      </div>

      {/* Progresso de Quitação */}
      {totalValorOriginal > 0 && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📊 Progresso de Quitação</h3>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Pago: R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>Restante: R$ {totalSaldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ height: '30px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${percentualPago}%`, backgroundColor: '#28a745', transition: 'width 0.3s ease' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: percentualPago > 50 ? 'white' : '#333', fontSize: '0.8rem' }}>
                {percentualPago.toFixed(1)}% quitado
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.8rem' }}>
            Total Original: R$ {totalValorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      )}

      {/* Formulário de Dívida */}
      {showForm && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">{editingDivida ? 'Editar' : 'Nova'} Dívida</h3>
          </div>
          
          <form onSubmit={salvarDivida}>
            <div className="form-group">
              <label className="form-label">Instituição</label>
              <input
                type="text"
                className="form-input"
                value={formData.instituicao}
                onChange={(e) => setFormData({...formData, instituicao: e.target.value})}
                placeholder="Ex: Banco XYZ"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor Total</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.valorTotal}
                onChange={(e) => setFormData({...formData, valorTotal: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Saldo Devedor Atual</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.saldoDevedor}
                onChange={(e) => setFormData({...formData, saldoDevedor: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taxa de Juros (%)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.taxaJuros}
                onChange={(e) => setFormData({...formData, taxaJuros: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Taxa</label>
              <select
                className="form-input"
                value={formData.tipoTaxa}
                onChange={(e) => setFormData({...formData, tipoTaxa: e.target.value})}
              >
                <option value="MENSAL">Mensal (a.m.)</option>
                <option value="ANUAL">Anual (a.a.)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valor da Parcela (opcional)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.valorParcela}
                onChange={(e) => setFormData({...formData, valorParcela: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <button type="submit" className="btn-mobile btn-success">
              {editingDivida ? 'Atualizar' : 'Salvar'}
            </button>
            
            <button 
              type="button" 
              className="btn-mobile btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingDivida(null);
                resetForm();
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Lista de Dívidas */}
      {dividas.length === 0 ? (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6c757d' }}>Nenhuma dívida cadastrada</p>
        </div>
      ) : (
        dividas.map(divida => (
          <div 
            key={divida.id} 
            className="mobile-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => { 
              setSelectedDivida(divida); 
              carregarPagamentos(divida.id); 
            }}
          >
            <div className="card-header">
              <h3 className="card-title">🏦 {divida.instituicao}</h3>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Valor Total:</span>
                <strong>R$ {parseFloat(divida.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Taxa:</span>
                <strong>{parseFloat(divida.taxaJuros).toFixed(2)}% {divida.tipoTaxa === 'MENSAL' ? 'a.m.' : 'a.a.'}</strong>
              </div>
              {divida.valorParcela && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Parcela:</span>
                  <strong>R$ {parseFloat(divida.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e9ecef' }}>
                <span>Saldo Devedor:</span>
                <strong style={{ color: '#dc3545' }}>R$ {parseFloat(divida.saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDivida(divida);
                  setFormData({
                    instituicao: divida.instituicao,
                    valorTotal: divida.valorTotal,
                    taxaJuros: divida.taxaJuros,
                    tipoTaxa: divida.tipoTaxa,
                    valorParcela: divida.valorParcela || '',
                    saldoDevedor: divida.saldoDevedor
                  });
                  setShowForm(true);
                }}
                className="btn-mobile"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#007bff' }}
              >
                ✏️ Editar
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  excluirDivida(divida.id);
                }}
                className="btn-mobile btn-danger"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                🗑️ Excluir
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#007bff', fontSize: '0.9rem' }}>
              Toque para gerenciar pagamentos
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

export default Dividas;