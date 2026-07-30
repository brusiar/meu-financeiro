import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Rendimentos() {
  const [rendimentos, setRendimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [editingRendimento, setEditingRendimento] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [rendimentosRecorrentes, setRendimentosRecorrentes] = useState([]);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [cadastroRapidoData, setCadastroRapidoData] = useState({ nome: '', descricao: '' });
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    recorrente: false,
    tipoCadastro: 'pontual',
    rendimentoRecorrenteId: '',
    dataRecebimento: new Date().toLocaleDateString('pt-BR')
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarRendimentos();
    carregarHistorico();
    carregarRendimentosRecorrentes();
  }, [mesAtual]);

  const carregarRendimentosRecorrentes = async () => {
    try {
      const res = await api.get(`/api/rendimentos-recorrentes?username=${user}`);
      setRendimentosRecorrentes(res.data);
    } catch (e) {
      console.error('Erro ao carregar rendimentos recorrentes:', e);
    }
  };

  const salvarCadastroRapido = async () => {
    if (!cadastroRapidoData.nome.trim()) return;
    try {
      const res = await api.post('/api/rendimentos-recorrentes', { ...cadastroRapidoData, username: user });
      await carregarRendimentosRecorrentes();
      setFormData(prev => ({ ...prev, rendimentoRecorrenteId: String(res.data.id) }));
      setShowCadastroRapido(false);
      setCadastroRapidoData({ nome: '', descricao: '' });
    } catch (e) {
      alert('Erro ao cadastrar: ' + (e.response?.data?.message || e.message));
    }
  };

  const carregarRendimentos = async () => {
    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const response = await api.get(`/api/rendimentos?username=${user}&ano=${ano}&mes=${mes}`);
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
      console.error('Detalhes:', error.response?.data);
      setRendimentos([]);
    }
  };

  const salvarRendimento = async (e) => {
    e.preventDefault();
    try {
      const rr = rendimentosRecorrentes.find(r => String(r.id) === String(formData.rendimentoRecorrenteId));
      const dados = {
        ...formData,
        username: user,
        descricao: formData.descricao,
        recorrente: formData.tipoCadastro === 'recorrente',
        rendimentoRecorrenteId: formData.tipoCadastro === 'recorrente' ? formData.rendimentoRecorrenteId : null
      };

      if (editingRendimento) {
        await api.put(`/api/rendimentos/${editingRendimento.id}`, dados);
        alert('Rendimento atualizado com sucesso!');
      } else {
        const response = await api.post('/api/rendimentos', dados);
        alert('Rendimento cadastrado com sucesso!');
        // Registra automaticamente o recebimento
        if (response.data.id) {
          await api.post(`/api/rendimentos/registrar/${response.data.id}`);
        }
      }

      setShowForm(false);
      setEditingRendimento(null);
      setFormData({ descricao: '', valor: '', recorrente: false, tipoCadastro: 'pontual', rendimentoRecorrenteId: '', dataRecebimento: new Date().toLocaleDateString('pt-BR') });
      carregarRendimentos();
      carregarHistorico();
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
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const response = await api.get(`/api/dashboard/rendimentos-mes?username=${user}&ano=${ano}&mes=${mes}`);
      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const registrarRecebimento = async (id) => {
    try {
      await api.post(`/api/rendimentos/registrar/${id}`);
      alert('Recebimento registrado com sucesso!');
      carregarHistorico();
      carregarRendimentos();
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      alert('Erro ao registrar recebimento');
    }
  };

  const getMesAno = () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[mesAtual.getMonth()]} de ${mesAtual.getFullYear()}`;
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

  if (showHistorico) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Histórico de Rendimentos</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={voltarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
            <h3 style={{ margin: 0 }}>{getMesAno()}</h3>
            <button onClick={avancarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>→</button>
            <button className="btn" onClick={() => setShowHistorico(false)}>
              Voltar
            </button>
          </div>
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
                  </tr>
                </thead>
                <tbody>
                  {historico.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{item.descricao}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
      {showCadastroRapido && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} onKeyDown={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Novo Pagador Recorrente</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Nome do Pagador:</label>
              <input type="text" value={cadastroRapidoData.nome}
                onChange={(e) => setCadastroRapidoData({ ...cadastroRapidoData, nome: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); salvarCadastroRapido(); } }}
                placeholder="Ex: Vivo, Empresa X"
                autoFocus />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Descrição:</label>
              <input type="text" value={cadastroRapidoData.descricao}
                onChange={(e) => setCadastroRapidoData({ ...cadastroRapidoData, descricao: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); salvarCadastroRapido(); } }}
                placeholder="Opcional" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ backgroundColor: '#27ae60' }}
                onClick={salvarCadastroRapido} disabled={!cadastroRapidoData.nome.trim()}>Salvar</button>
              <button className="btn" onClick={() => { setShowCadastroRapido(false); setCadastroRapidoData({ nome: '', descricao: '' }); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2>Rendimentos</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={voltarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
            <h3 style={{ margin: 0 }}>{getMesAno()}</h3>
            <button onClick={avancarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>→</button>
          </div>
        </div>
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
                <label>Fonte Pagadora:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={formData.rendimentoRecorrenteId || 'pontual'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData,
                        tipoCadastro: val === 'pontual' ? 'pontual' : 'recorrente',
                        rendimentoRecorrenteId: val === 'pontual' ? '' : val
                      });
                    }}
                    style={{ flex: 1 }}
                  >
                    <option value="pontual">Pontual</option>
                    {rendimentosRecorrentes.map(rr => (
                      <option key={rr.id} value={rr.id}>{rr.nome}</option>
                    ))}
                  </select>
                  <button type="button"
                    onClick={() => setShowCadastroRapido(true)}
                    style={{ padding: '0.5rem', fontSize: '0.8rem', whiteSpace: 'nowrap', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >+ Novo</button>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Descrição:</label>
                <input type="text" value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})} required />
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
                <label>Data do Recebimento:</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataRecebimento}
                  onChange={(e) => setFormData({...formData, dataRecebimento: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editingRendimento ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={() => {
                setShowForm(false);
                setEditingRendimento(null);
                setFormData({ descricao: '', valor: '', recorrente: false, tipoCadastro: 'pontual', rendimentoRecorrenteId: '', dataRecebimento: new Date().toLocaleDateString('pt-BR') });
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
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rendimentos.map(rendimento => (
                  <tr key={rendimento.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>
                        {rendimento.rendimentoRecorrente ? `${rendimento.descricao} - ${rendimento.rendimentoRecorrente.nome}` : rendimento.descricao}
                      </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      R$ {parseFloat(rendimento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {rendimento.recorrente ? '🔄 Recorrente' : '📅 Único'}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          setEditingRendimento(rendimento);
                          const dataArray = rendimento.dataRecebimento;
                          let dataFormatada;
                          if (Array.isArray(dataArray) && dataArray.length === 3) {
                            dataFormatada = `${String(dataArray[2]).padStart(2, '0')}/${String(dataArray[1]).padStart(2, '0')}/${dataArray[0]}`;
                          } else {
                            dataFormatada = new Date().toLocaleDateString('pt-BR');
                          }
                          setFormData({
                            descricao: rendimento.descricao,
                            valor: rendimento.valor,
                            recorrente: rendimento.recorrente,
                            tipoCadastro: rendimento.rendimentoRecorrente ? 'recorrente' : 'pontual',
                            rendimentoRecorrenteId: rendimento.rendimentoRecorrente ? String(rendimento.rendimentoRecorrente.id) : '',
                            dataRecebimento: dataFormatada
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
