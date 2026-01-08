import React, { useState, useEffect } from 'react';

const Mesada = () => {
  const [pessoas, setPessoas] = useState([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null);
  const [acoes, setAcoes] = useState([]);
  const [showFormPessoa, setShowFormPessoa] = useState(false);
  const [showFormAcao, setShowFormAcao] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [editingPessoa, setEditingPessoa] = useState(null);
  const [editingAcao, setEditingAcao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formPessoa, setFormPessoa] = useState({ nome: '', valorMesada: '' });
  const [formAcao, setFormAcao] = useState({ 
    descricao: '', 
    valor: '', 
    tipo: 'ACRESCIMO', 
    data: new Date().toISOString().split('T')[0] 
  });

  const user = localStorage.getItem('user') || 'admin';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await carregarPessoas();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const carregarPessoas = async () => {
    try {
      const response = await financeService.getPessoasMesada(user);
      setPessoas(response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      // Fallback para dados mock
      setPessoas([
        { id: 1, nome: 'João', valorMesada: 100.00 }
      ]);
    }
  };

  const carregarAcoes = async (pessoaId) => {
    try {
      const response = await financeService.getAcoesMesada(pessoaId);
      setAcoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
      // Fallback para dados mock
      setAcoes([
        { id: 1, descricao: 'Ajudou nas tarefas', valor: 20.00, tipo: 'ACRESCIMO', data: '2026-01-05' }
      ]);
    }
  };

  const setMockData = () => {
    setPessoas([
      { id: 1, nome: 'João', valorMesada: 100.00 }
    ]);
  };

  const salvarPessoa = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formPessoa, username: user };
      
      if (editingPessoa) {
        await financeService.updatePessoaMesada(editingPessoa.id, dados);
      } else {
        await financeService.createPessoaMesada(dados);
      }
      
      carregarPessoas();
      setShowFormPessoa(false);
      setEditingPessoa(null);
      resetFormPessoa();
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      alert('Erro ao salvar pessoa');
    }
  };

  const salvarAcao = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formAcao, pessoaId: pessoaSelecionada.id, username: user };
      
      if (editingAcao) {
        await financeService.updateAcaoMesada(editingAcao.id, dados);
      } else {
        await financeService.createAcaoMesada(dados);
      }
      
      carregarAcoes(pessoaSelecionada.id);
      setShowFormAcao(false);
      setEditingAcao(null);
      resetFormAcao();
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
      alert('Erro ao salvar ação');
    }
  };

  const excluirPessoa = async (id) => {
    if (window.confirm('Deseja excluir esta pessoa?')) {
      try {
        await financeService.deletePessoaMesada(id, user);
        carregarPessoas();
      } catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        // Fallback local
        setPessoas(pessoas.filter(p => p.id !== id));
      }
    }
  };

  const excluirAcao = async (id) => {
    if (window.confirm('Deseja excluir esta ação?')) {
      try {
        await financeService.deleteAcaoMesada(id, user);
        carregarAcoes(pessoaSelecionada.id);
      } catch (error) {
        console.error('Erro ao excluir ação:', error);
        // Fallback local
        setAcoes(acoes.filter(a => a.id !== id));
      }
    }
  };

  const gerarRelatorio = async (pessoaId) => {
    try {
      const response = await financeService.getRelatorioMesada(pessoaId);
      setRelatorio(response.data);
      setShowRelatorio(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      // Fallback local
      const pessoa = pessoas.find(p => p.id === pessoaId);
      const totalAcrescimos = acoes.filter(a => a.tipo === 'ACRESCIMO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
      const totalDescontos = acoes.filter(a => a.tipo === 'DESCONTO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
      
      setRelatorio({
        pessoa: pessoa.nome,
        valorBase: pessoa.valorMesada,
        totalAcrescimos,
        totalDescontos,
        valorFinal: pessoa.valorMesada + totalAcrescimos - totalDescontos,
        acoes: acoes
      });
      setShowRelatorio(true);
    }
  };

  const resetFormPessoa = () => {
    setFormPessoa({ nome: '', valorMesada: '' });
  };

  const resetFormAcao = () => {
    setFormAcao({ 
      descricao: '', 
      valor: '', 
      tipo: 'ACRESCIMO', 
      data: new Date().toISOString().split('T')[0] 
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Tela de relatório
  if (showRelatorio && relatorio) {
    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📊 Relatório - {relatorio.pessoa}</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => setShowRelatorio(false)}
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value" style={{color: '#007bff'}}>
              R$ {parseFloat(relatorio.valorBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Valor Base</div>
          </div>
          <div className="summary-card">
            <div className="summary-value positive">
              R$ {parseFloat(relatorio.totalAcrescimos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Acréscimos</div>
          </div>
          <div className="summary-card">
            <div className="summary-value negative">
              R$ {parseFloat(relatorio.totalDescontos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Descontos</div>
          </div>
          <div className="summary-card" style={{ backgroundColor: '#d1ecf1' }}>
            <div className="summary-value" style={{color: '#17a2b8'}}>
              R$ {parseFloat(relatorio.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label" style={{color: '#0c5460'}}>Valor Final</div>
          </div>
        </div>

        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📋 Ações do Mês</h3>
          </div>
          
          {relatorio.acoes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
              Nenhuma ação registrada
            </div>
          ) : (
            relatorio.acoes.map(acao => (
              <div key={acao.id} className="list-item">
                <div className="item-header">
                  <span className="item-title">{acao.descricao}</span>
                  <span className={`item-value ${acao.tipo === 'ACRESCIMO' ? 'positive' : 'negative'}`}>
                    {acao.tipo === 'ACRESCIMO' ? '+' : '-'} R$ {parseFloat(acao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="item-details">
                  {acao.tipo === 'ACRESCIMO' ? '➕ Acréscimo' : '➖ Desconto'} • {new Date(acao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Tela de detalhes da pessoa
  if (pessoaSelecionada) {
    const totalAcrescimos = acoes.filter(a => a.tipo === 'ACRESCIMO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
    const totalDescontos = acoes.filter(a => a.tipo === 'DESCONTO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
    const valorFinal = parseFloat(pessoaSelecionada.valorMesada) + totalAcrescimos - totalDescontos;

    return (
      <div className="mobile-content">
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">👤 {pessoaSelecionada.nome}</h3>
            <button 
              className="btn-mobile btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => { setPessoaSelecionada(null); setAcoes([]); }}
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mobile-card">
          <button 
            className="btn-mobile btn-success"
            onClick={() => setShowFormAcao(true)}
          >
            ➕ Nova Ação
          </button>
          <button 
            className="btn-mobile" 
            style={{ backgroundColor: '#6f42c1' }}
            onClick={() => gerarRelatorio(pessoaSelecionada.id)}
          >
            📊 Relatório
          </button>
        </div>

        {/* Resumo */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value" style={{color: '#007bff'}}>
              R$ {parseFloat(pessoaSelecionada.valorMesada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Valor Base</div>
          </div>
          <div className="summary-card">
            <div className="summary-value positive">
              R$ {totalAcrescimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Acréscimos</div>
          </div>
          <div className="summary-card">
            <div className="summary-value negative">
              R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Descontos</div>
          </div>
          <div className="summary-card" style={{ backgroundColor: '#d1ecf1' }}>
            <div className="summary-value" style={{color: '#17a2b8'}}>
              R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label" style={{color: '#0c5460'}}>Valor Final</div>
          </div>
        </div>

        {/* Formulário de Ação */}
        {showFormAcao && (
          <div className="mobile-card">
            <div className="card-header">
              <h3 className="card-title">{editingAcao ? 'Editar' : 'Nova'} Ação</h3>
            </div>
            
            <form onSubmit={salvarAcao}>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="form-input"
                  value={formAcao.descricao}
                  onChange={(e) => setFormAcao({...formAcao, descricao: e.target.value})}
                  placeholder="Ex: Ajudou nas tarefas..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formAcao.valor}
                  onChange={(e) => setFormAcao({...formAcao, valor: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-input"
                  value={formAcao.tipo}
                  onChange={(e) => setFormAcao({...formAcao, tipo: e.target.value})}
                >
                  <option value="ACRESCIMO">➕ Acréscimo</option>
                  <option value="DESCONTO">➖ Desconto</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={formAcao.data}
                  onChange={(e) => setFormAcao({...formAcao, data: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="btn-mobile btn-success">
                {editingAcao ? 'Atualizar' : 'Salvar'}
              </button>
              
              <button 
                type="button" 
                className="btn-mobile btn-secondary"
                onClick={() => {
                  setShowFormAcao(false);
                  setEditingAcao(null);
                  resetFormAcao();
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* Lista de Ações */}
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📋 Ações do Mês</h3>
          </div>
          
          {acoes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
              Nenhuma ação registrada
            </div>
          ) : (
            acoes.map(acao => (
              <div key={acao.id} className="list-item">
                <div className="item-header">
                  <span className="item-title">{acao.descricao}</span>
                  <span className={`item-value ${acao.tipo === 'ACRESCIMO' ? 'positive' : 'negative'}`}>
                    {acao.tipo === 'ACRESCIMO' ? '+' : '-'} R$ {parseFloat(acao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="item-details">
                  {acao.tipo === 'ACRESCIMO' ? '➕ Acréscimo' : '➖ Desconto'} • {new Date(acao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => {
                      setEditingAcao(acao);
                      setFormAcao({
                        descricao: acao.descricao,
                        valor: acao.valor,
                        tipo: acao.tipo,
                        data: acao.data
                      });
                      setShowFormAcao(true);
                    }}
                    className="btn-mobile"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#6c757d' }}
                  >
                    ✏️ Editar
                  </button>
                  
                  <button 
                    onClick={() => excluirAcao(acao.id)}
                    className="btn-mobile btn-danger"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <button 
          className="fab"
          onClick={() => setShowFormAcao(true)}
        >
          +
        </button>
      </div>
    );
  }

  // Tela principal - lista de pessoas
  return (
    <div className="mobile-content">
      {/* Botão Nova Pessoa */}
      <div className="mobile-card">
        <button 
          className="btn-mobile btn-success"
          onClick={() => setShowFormPessoa(true)}
        >
          ➕ Nova Pessoa
        </button>
      </div>

      {/* Formulário de Pessoa */}
      {showFormPessoa && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">{editingPessoa ? 'Editar' : 'Nova'} Pessoa</h3>
          </div>
          
          <form onSubmit={salvarPessoa}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-input"
                value={formPessoa.nome}
                onChange={(e) => setFormPessoa({...formPessoa, nome: e.target.value})}
                placeholder="Digite o nome"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor da Mesada</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formPessoa.valorMesada}
                onChange={(e) => setFormPessoa({...formPessoa, valorMesada: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <button type="submit" className="btn-mobile btn-success">
              {editingPessoa ? 'Atualizar' : 'Salvar'}
            </button>
            
            <button 
              type="button" 
              className="btn-mobile btn-secondary"
              onClick={() => {
                setShowFormPessoa(false);
                setEditingPessoa(null);
                resetFormPessoa();
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Lista de Pessoas */}
      {pessoas.length === 0 ? (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6c757d' }}>Nenhuma pessoa cadastrada</p>
        </div>
      ) : (
        pessoas.map(pessoa => (
          <div 
            key={pessoa.id} 
            className="mobile-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => { 
              setPessoaSelecionada(pessoa); 
              carregarAcoes(pessoa.id); 
            }}
          >
            <div className="card-header">
              <h3 className="card-title">👤 {pessoa.nome}</h3>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="summary-value positive" style={{ fontSize: '1.5rem' }}>
                R$ {parseFloat(pessoa.valorMesada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="summary-label">Valor base da mesada</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPessoa(pessoa);
                  setFormPessoa({ nome: pessoa.nome, valorMesada: pessoa.valorMesada });
                  setShowFormPessoa(true);
                }}
                className="btn-mobile"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#007bff' }}
              >
                ✏️ Editar
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  excluirPessoa(pessoa.id);
                }}
                className="btn-mobile btn-danger"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                🗑️ Excluir
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#007bff', fontSize: '0.9rem' }}>
              Toque para gerenciar mesada
            </div>
          </div>
        ))
      )}

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => setShowFormPessoa(true)}
      >
        +
      </button>
    </div>
  );
};

export default Mesada;