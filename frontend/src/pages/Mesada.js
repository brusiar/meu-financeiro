import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Mesada() {
  const [pessoas, setPessoas] = useState([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null);
  const [acoes, setAcoes] = useState([]);
  const [showFormPessoa, setShowFormPessoa] = useState(false);
  const [showFormAcao, setShowFormAcao] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [editingPessoa, setEditingPessoa] = useState(null);
  const [editingAcao, setEditingAcao] = useState(null);
  const [formPessoa, setFormPessoa] = useState({ nome: '', valorMesada: '' });
  const [formAcao, setFormAcao] = useState({ descricao: '', valor: '', tipo: 'ACRESCIMO', data: new Date().toISOString().split('T')[0] });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarPessoas();
  }, []);

  const carregarPessoas = async () => {
    try {
      const response = await api.get(`/api/mesada/pessoas?username=${user}`);
      setPessoas(response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const carregarAcoes = async (pessoaId) => {
    try {
      const response = await api.get(`/api/mesada/acoes/${pessoaId}`);
      setAcoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
    }
  };

  const salvarPessoa = async (e) => {
    e.preventDefault();
    try {
      if (editingPessoa) {
        await api.put(`/api/mesada/pessoas/${editingPessoa.id}`, formPessoa);
        alert('Pessoa atualizada com sucesso!');
      } else {
        await api.post('/api/mesada/pessoas', { ...formPessoa, username: user });
        alert('Pessoa cadastrada com sucesso!');
      }
      setShowFormPessoa(false);
      setEditingPessoa(null);
      setFormPessoa({ nome: '', valorMesada: '' });
      carregarPessoas();
    } catch (error) {
      alert('Erro ao salvar pessoa');
    }
  };

  const salvarAcao = async (e) => {
    e.preventDefault();
    try {
      if (editingAcao) {
        await api.put(`/api/mesada/acoes/${editingAcao.id}`, formAcao);
        alert('Ação atualizada com sucesso!');
      } else {
        await api.post('/api/mesada/acoes', { ...formAcao, pessoaId: pessoaSelecionada.id });
        alert('Ação registrada com sucesso!');
      }
      setShowFormAcao(false);
      setEditingAcao(null);
      setFormAcao({ descricao: '', valor: '', tipo: 'ACRESCIMO', data: new Date().toISOString().split('T')[0] });
      carregarAcoes(pessoaSelecionada.id);
    } catch (error) {
      alert('Erro ao salvar ação');
    }
  };

  const excluirPessoa = async (id) => {
    if (!window.confirm('Deseja excluir esta pessoa?')) return;
    try {
      await api.delete(`/api/mesada/pessoas/${id}`);
      alert('Pessoa excluída!');
      carregarPessoas();
    } catch (error) {
      alert('Erro ao excluir pessoa');
    }
  };

  const excluirAcao = async (id) => {
    if (!window.confirm('Deseja excluir esta ação?')) return;
    try {
      await api.delete(`/api/mesada/acoes/${id}`);
      alert('Ação excluída!');
      carregarAcoes(pessoaSelecionada.id);
    } catch (error) {
      alert('Erro ao excluir ação');
    }
  };

  const gerarRelatorio = async (pessoaId) => {
    try {
      const response = await api.get(`/api/mesada/relatorio/${pessoaId}`);
      setRelatorio(response.data);
      setShowRelatorio(true);
    } catch (error) {
      alert('Erro ao gerar relatório');
    }
  };

  if (showRelatorio && relatorio) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Relatório de Mesada - {relatorio.pessoa}</h2>
          <button className="btn" onClick={() => setShowRelatorio(false)}>Voltar</button>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Valor Base</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                R$ {parseFloat(relatorio.valorBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Acréscimos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                + R$ {parseFloat(relatorio.totalAcrescimos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Descontos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                - R$ {parseFloat(relatorio.totalDescontos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ backgroundColor: '#d1ecf1', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c5460', fontWeight: 'bold' }}>Valor Final</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
                R$ {parseFloat(relatorio.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Ações do Mês</h3>
          {relatorio.acoes.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma ação registrada</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.acoes.map(acao => (
                  <tr key={acao.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>
                      {new Date(acao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{acao.descricao}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {acao.tipo === 'ACRESCIMO' ? '➕ Acréscimo' : '➖ Desconto'}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: acao.tipo === 'ACRESCIMO' ? '#27ae60' : '#e74c3c' }}>
                      R$ {parseFloat(acao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (pessoaSelecionada) {
    const totalAcrescimos = acoes.filter(a => a.tipo === 'ACRESCIMO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
    const totalDescontos = acoes.filter(a => a.tipo === 'DESCONTO').reduce((sum, a) => sum + parseFloat(a.valor), 0);
    const valorFinal = parseFloat(pessoaSelecionada.valorMesada) + totalAcrescimos - totalDescontos;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Mesada - {pessoaSelecionada.nome}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={() => gerarRelatorio(pessoaSelecionada.id)} style={{ backgroundColor: '#9b59b6' }}>
              Relatório
            </button>
            <button className="btn" onClick={() => setShowFormAcao(true)}>Nova Ação</button>
            <button className="btn" onClick={() => { setPessoaSelecionada(null); setAcoes([]); }}>Voltar</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Valor Base</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                R$ {parseFloat(pessoaSelecionada.valorMesada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Acréscimos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                + R$ {totalAcrescimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Descontos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                - R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ backgroundColor: '#d1ecf1', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c5460', fontWeight: 'bold' }}>Valor Final</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
                R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {showFormAcao && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>{editingAcao ? 'Editar' : 'Nova'} Ação</h3>
            <form onSubmit={salvarAcao}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Descrição:</label>
                  <input type="text" value={formAcao.descricao} onChange={(e) => setFormAcao({...formAcao, descricao: e.target.value})} required />
                </div>
                <div>
                  <label>Valor:</label>
                  <input type="number" step="0.01" value={formAcao.valor} onChange={(e) => setFormAcao({...formAcao, valor: e.target.value})} required />
                </div>
                <div>
                  <label>Tipo:</label>
                  <select value={formAcao.tipo} onChange={(e) => setFormAcao({...formAcao, tipo: e.target.value})}>
                    <option value="ACRESCIMO">Acréscimo</option>
                    <option value="DESCONTO">Desconto</option>
                  </select>
                </div>
                <div>
                  <label>Data:</label>
                  <input type="date" value={formAcao.data} onChange={(e) => setFormAcao({...formAcao, data: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn" style={{ marginRight: '0.5rem' }}>{editingAcao ? 'Atualizar' : 'Salvar'}</button>
              <button type="button" className="btn" onClick={() => { setShowFormAcao(false); setEditingAcao(null); setFormAcao({ descricao: '', valor: '', tipo: 'ACRESCIMO', data: new Date().toISOString().split('T')[0] }); }}>Cancelar</button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Ações do Mês Atual</h3>
          {acoes.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma ação registrada</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {acoes.map(acao => (
                  <tr key={acao.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(acao.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '0.5rem' }}>{acao.descricao}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {acao.tipo === 'ACRESCIMO' ? '➕ Acréscimo' : '➖ Desconto'}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: acao.tipo === 'ACRESCIMO' ? '#27ae60' : '#e74c3c' }}>
                      R$ {parseFloat(acao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button onClick={() => { setEditingAcao(acao); setFormAcao({ descricao: acao.descricao, valor: acao.valor, tipo: acao.tipo, data: acao.data }); setShowFormAcao(true); }} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Editar
                      </button>
                      <button onClick={() => excluirAcao(acao.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Controle de Mesada</h2>
        <button className="btn" onClick={() => setShowFormPessoa(true)}>Nova Pessoa</button>
      </div>

      {showFormPessoa && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{editingPessoa ? 'Editar' : 'Nova'} Pessoa</h3>
          <form onSubmit={salvarPessoa}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Nome:</label>
                <input type="text" value={formPessoa.nome} onChange={(e) => setFormPessoa({...formPessoa, nome: e.target.value})} required />
              </div>
              <div>
                <label>Valor da Mesada:</label>
                <input type="number" step="0.01" value={formPessoa.valorMesada} onChange={(e) => setFormPessoa({...formPessoa, valorMesada: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginRight: '0.5rem' }}>{editingPessoa ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn" onClick={() => { setShowFormPessoa(false); setEditingPessoa(null); setFormPessoa({ nome: '', valorMesada: '' }); }}>Cancelar</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Pessoas Cadastradas</h3>
        {pessoas.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma pessoa cadastrada</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {pessoas.map(pessoa => (
              <div key={pessoa.id} className="card" style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }} onClick={() => { setPessoaSelecionada(pessoa); carregarAcoes(pessoa.id); }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{pessoa.nome}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60', margin: '0.5rem 0' }}>
                  R$ {parseFloat(pessoa.valorMesada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Valor base da mesada</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingPessoa(pessoa); setFormPessoa({ nome: pessoa.nome, valorMesada: pessoa.valorMesada }); setShowFormPessoa(true); }} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Editar
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); excluirPessoa(pessoa.id); }} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>
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

export default Mesada;
