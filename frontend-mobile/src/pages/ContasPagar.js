import React, { useState, useEffect } from 'react';
import { financeService } from '../services/api';

const ContasPagar = () => {
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoMensal, setHistoricoMensal] = useState([]);
  const [selectedMes, setSelectedMes] = useState(null);
  const [contasMes, setContasMes] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    categoriaId: '',
    formaPagamento: '',
    chavePix: '',
    anexoBoleto: ''
  });

  const user = localStorage.getItem('user') || 'admin';

  useEffect(() => {
    carregarDados();
  }, [mesAtual]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarContas(),
        carregarCategorias()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Dados mock para demonstração
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const carregarContas = async () => {
    try {
      const response = await financeService.getContasPagar();
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0);
      
      const contasFiltradas = response.data.filter(conta => {
        const vencimento = new Date(conta.dataVencimento + 'T00:00:00');
        return vencimento >= inicio && vencimento <= fim;
      });
      
      setContas(contasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      // Fallback para dados mock
      setContas([
        {
          id: 1,
          descricao: 'Cartão de Crédito',
          valor: 850.00,
          dataVencimento: '2026-01-15',
          pago: false,
          categoria: { id: 1, nome: 'Cartão' },
          formaPagamento: 'CARTAO_CREDITO'
        }
      ]);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await financeService.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([
        { id: 1, nome: 'Cartão' },
        { id: 2, nome: 'Moradia' },
        { id: 3, nome: 'Utilidades' }
      ]);
    }
  };

  const carregarHistorico = async () => {
    try {
      setHistoricoMensal([
        { anoMes: '2025-12', mesAno: 'Dezembro 2025', total: 2150.50, quantidade: 6 },
        { anoMes: '2025-11', mesAno: 'Novembro 2025', total: 1980.30, quantidade: 5 },
        { anoMes: '2025-10', mesAno: 'Outubro 2025', total: 2300.75, quantidade: 7 }
      ]);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const setMockData = () => {
    setContas([
      {
        id: 1,
        descricao: 'Cartão de Crédito',
        valor: 850.00,
        dataVencimento: '2026-01-15',
        pago: false,
        categoria: { id: 1, nome: 'Cartão' },
        formaPagamento: 'CARTAO_CREDITO'
      }
    ]);
    setCategorias([
      { id: 1, nome: 'Cartão' },
      { id: 2, nome: 'Moradia' }
    ]);
  };

  const salvarConta = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formData, username: user };
      
      if (editingConta) {
        await financeService.updateContaPagar(editingConta.id, dados);
      } else {
        await financeService.createContaPagar(dados);
      }
      
      carregarContas();
      setShowForm(false);
      setEditingConta(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const marcarComoPago = async (id) => {
    try {
      await financeService.marcarContaComoPaga(id);
      carregarContas();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      // Fallback local
      const contasAtualizadas = contas.map(c => 
        c.id === id ? { ...c, pago: true, dataPagamento: new Date().toISOString().split('T')[0] } : c
      );
      setContas(contasAtualizadas);
    }
  };

  const excluirConta = async (id) => {
    if (window.confirm('Deseja excluir esta conta?')) {
      try {
        await financeService.deleteContaPagar(id);
        carregarContas();
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        // Fallback local
        setContas(contas.filter(c => c.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      dataVencimento: '',
      categoriaId: '',
      formaPagamento: '',
      chavePix: '',
      anexoBoleto: ''
    });
  };

  const getStatusColor = (conta) => {
    if (conta.pago) return '#d4edda';
    if (conta.tipo === 'FATURA_CARTAO') return '#fff3cd';
    const hoje = new Date();
    const vencimento = new Date(conta.dataVencimento);
    if (vencimento < hoje) return '#f8d7da';
    return '#fff';
  };

  const getTipoLabel = (conta) => {
    if (conta.tipo === 'FATURA_CARTAO') return 'Fatura Cartão';
    return conta.recorrente ? 'Recorrente' : 'Pontual';
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Tela de histórico detalhado
  if (selectedMes) {
    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📅 {selectedMes.mesAno}</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => {
                setSelectedMes(null);
                setContasMes([]);
              }}
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value positive">
              R$ {selectedMes.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Total Pago</div>
          </div>
          <div className="summary-card">
            <div className="summary-value" style={{color: '#007bff'}}>
              {contasMes.length}
            </div>
            <div className="summary-label">Contas Pagas</div>
          </div>
        </div>

        {contasMes.map(conta => (
          <div key={conta.id} className="list-item" style={{ backgroundColor: '#d4edda' }}>
            <div className="item-header">
              <span className="item-title">{conta.descricao}</span>
              <span className="item-value positive">
                R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="item-details">
              {conta.categoria.nome} • {getTipoLabel(conta)} • Pago em: {new Date(conta.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Tela de histórico mensal
  if (showHistorico) {
    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📊 Histórico de Contas</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => setShowHistorico(false)}
            >
              Voltar
            </button>
          </div>
        </div>

        {historicoMensal.map(mes => (
          <div 
            key={mes.anoMes} 
            className="mobile-card" 
            style={{ cursor: 'pointer' }} 
            onClick={async () => {
              // Simular carregamento das contas do mês
              const contasMock = [
                {
                  id: 1,
                  descricao: 'Cartão de Crédito',
                  valor: 750.00,
                  categoria: { nome: 'Cartão' },
                  dataPagamento: mes.anoMes + '-15',
                  recorrente: false
                }
              ];
              setContasMes(contasMock);
              setSelectedMes(mes);
            }}
          >
            <div className="card-header">
              <h4 className="card-title">{mes.mesAno}</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Pago:</span>
              <strong style={{ color: '#28a745' }}>R$ {mes.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Contas:</span>
              <strong>{mes.quantidade}</strong>
            </div>
            <div style={{ color: '#007bff', fontSize: '0.9rem', textAlign: 'center' }}>
              Toque para ver detalhes
            </div>
          </div>
        ))}

        {historicoMensal.length === 0 && (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6c757d' }}>Nenhuma conta paga no histórico</p>
          </div>
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
          ➕ Nova Conta
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
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-value negative">
            R$ {contas.reduce((sum, c) => sum + parseFloat(c.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="summary-label">Total a Pagar</div>
        </div>
        <div className="summary-card">
          <div className="summary-value" style={{color: '#007bff'}}>
            {contas.length}
          </div>
          <div className="summary-label">Contas</div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">{editingConta ? 'Editar' : 'Nova'} Conta</h3>
          </div>
          
          <form onSubmit={salvarConta}>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-input"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Digite a descrição"
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
              <label className="form-label">Categoria</label>
              <select
                className="form-input"
                value={formData.categoriaId}
                onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Vencimento</label>
              <input
                type="date"
                className="form-input"
                value={formData.dataVencimento}
                onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <select
                className="form-input"
                value={formData.formaPagamento}
                onChange={(e) => setFormData({...formData, formaPagamento: e.target.value, chavePix: '', anexoBoleto: ''})}
                required
              >
                <option value="">Selecione</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="PIX">Pix</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>

            {formData.formaPagamento === 'PIX' && (
              <div className="form-group">
                <label className="form-label">Chave Pix</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.chavePix}
                  onChange={(e) => setFormData({...formData, chavePix: e.target.value})}
                  placeholder="Digite a chave Pix"
                />
              </div>
            )}

            <button type="submit" className="btn-mobile btn-success">
              {editingConta ? 'Atualizar' : 'Salvar'}
            </button>
            
            <button 
              type="button" 
              className="btn-mobile btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingConta(null);
                resetForm();
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Lista de Contas */}
      {contas.length === 0 ? (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6c757d' }}>Nenhuma conta pendente</p>
        </div>
      ) : (
        contas.map(conta => (
          <div 
            key={conta.id} 
            className="list-item" 
            style={{ backgroundColor: getStatusColor(conta) }}
          >
            <div className="item-header">
              <span className="item-title">{conta.descricao}</span>
              <span className="item-value negative">
                R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="item-details">
              {conta.categoria.nome} • {getTipoLabel(conta)} • Vence: {new Date(conta.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>

            {conta.formaPagamento === 'PIX' && conta.chavePix && (
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                Pix: {conta.chavePix}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {!conta.pago && (
                <button 
                  onClick={() => marcarComoPago(conta.id)}
                  className="btn-mobile btn-success"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  ✅ Pagar
                </button>
              )}
              
              <button 
                onClick={() => {
                  setEditingConta(conta);
                  setFormData({
                    descricao: conta.descricao,
                    valor: conta.valor,
                    dataVencimento: conta.dataVencimento,
                    categoriaId: conta.categoria.id,
                    formaPagamento: conta.formaPagamento || '',
                    chavePix: conta.chavePix || '',
                    anexoBoleto: conta.anexoBoleto || ''
                  });
                  setShowForm(true);
                }}
                className="btn-mobile"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#6c757d' }}
              >
                ✏️ Editar
              </button>
              
              <button 
                onClick={() => excluirConta(conta.id)}
                className="btn-mobile btn-danger"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                🗑️ Excluir
              </button>
            </div>

            {conta.pago && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#28a745', fontWeight: 'bold' }}>
                ✅ Conta Paga
              </div>
            )}
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

export default ContasPagar;