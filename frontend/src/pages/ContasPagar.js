import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ContasPagar() {
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoMensal, setHistoricoMensal] = useState([]);
  const [selectedMes, setSelectedMes] = useState(null);
  const [contasMes, setContasMes] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [contasRecorrentes, setContasRecorrentes] = useState([]);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [cadastroRapidoData, setCadastroRapidoData] = useState({ nome: '', descricao: '', categoriaId: '' });
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    categoriaId: '',
    formaPagamento: '',
    chavePix: '',
    anexoBoleto: '',
    tipoCadastro: 'pontual',
    contaRecorrenteId: ''
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarContas();
    carregarCategorias();
    carregarContasRecorrentes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesAtual]);

  const carregarContasRecorrentes = async () => {
    try {
      const res = await api.get(`/api/contas-recorrentes?username=${user}`);
      setContasRecorrentes(res.data);
    } catch (e) {
      console.error('Erro ao carregar contas recorrentes:', e);
    }
  };

  const salvarCadastroRapido = async () => {
    if (!cadastroRapidoData.nome.trim()) return;
    try {
      const res = await api.post('/api/contas-recorrentes', { ...cadastroRapidoData, username: user });
      await carregarContasRecorrentes();
      setFormData(prev => ({ ...prev, contaRecorrenteId: String(res.data.id), categoriaId: res.data.categoriaId ? String(res.data.categoriaId) : prev.categoriaId }));
      setShowCadastroRapido(false);
      setCadastroRapidoData({ nome: '', descricao: '', categoriaId: '' });
    } catch (e) {
      alert('Erro ao cadastrar: ' + (e.response?.data?.message || e.message));
    }
  };

  const carregarContas = async () => {
    try {
      const response = await api.get(`/api/contas?username=${user}`);
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
      setContas([]);
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await api.get(`/api/contas/historico?username=${user}`);
      setHistoricoMensal(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const carregarContasMes = async (anoMes) => {
    try {
      const [ano, mes] = anoMes.split('-');
      const response = await api.get(`/api/contas/mes-historico?username=${user}&ano=${ano}&mes=${mes}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar contas do mês:', error);
      return [];
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/api/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const salvarConta = async (e) => {
    e.preventDefault();
    try {
      const cr = contasRecorrentes.find(c => String(c.id) === String(formData.contaRecorrenteId));
      const dados = {
        ...formData,
        username: user,
        descricao: formData.tipoCadastro === 'recorrente' ? (cr?.nome || formData.descricao) : formData.descricao,
        contaRecorrenteId: formData.tipoCadastro === 'recorrente' ? formData.contaRecorrenteId : null
      };
      console.log('Enviando dados:', dados);
      
      let response;
      if (editingConta) {
        response = await api.put(`/api/contas/${editingConta.id}`, dados);
      } else {
        response = await api.post('/api/contas', dados);
      }
      
      console.log('Resposta:', response.data);
      carregarContas();
      setShowForm(false);
      setEditingConta(null);
      setFormData({
        descricao: '',
        valor: '',
        dataVencimento: '',
        categoriaId: '',
        formaPagamento: '',
        chavePix: '',
        anexoBoleto: '',
        tipoCadastro: 'pontual',
        contaRecorrenteId: ''
      });
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      console.error('Detalhes do erro:', error.response?.data);
      alert('Erro ao salvar conta: ' + (error.response?.data?.message || error.message));
    }
  };

  const marcarComoPago = async (id) => {
    try {
      await api.put(`/api/contas/${id}/pagar`);
      carregarContas();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      alert('Erro ao marcar conta como paga');
    }
  };

  const excluirConta = async (id) => {
    if (window.confirm('Deseja excluir esta conta?')) {
      try {
        await api.delete(`/api/contas/${id}`);
        carregarContas();
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
      }
    }
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

  if (selectedMes) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Contas de {selectedMes.mesAno}</h2>
          <button className="btn" onClick={() => {
            setSelectedMes(null);
            setContasMes([]);
          }}>
            Voltar
          </button>
        </div>

        <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#d4edda' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Pago</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                R$ {selectedMes.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Contas Pagas</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                {contasMes.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Detalhes das Contas</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Vencimento</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Data Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {contasMes.map(conta => (
                  <tr key={conta.id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#d4edda' }}>
                    <td style={{ padding: '0.5rem' }}>{conta.descricao}</td>
                    <td style={{ padding: '0.5rem' }}>{conta.categoria.nome}</td>
                    <td style={{ padding: '0.5rem' }}>{getTipoLabel(conta)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {new Date(conta.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {conta.dataPagamento ? new Date(conta.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (showHistorico) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Histórico de Contas Pagas</h2>
          <button className="btn" onClick={() => setShowHistorico(false)}>
            Voltar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {historicoMensal.map(mes => (
            <div key={mes.anoMes} className="card" style={{ cursor: 'pointer' }} onClick={async () => {
              const contas = await carregarContasMes(mes.anoMes);
              setContasMes(contas);
              setSelectedMes(mes);
            }}>
              <h4>{mes.mesAno}</h4>
              <p><strong>Total Pago:</strong> R$ {mes.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Contas:</strong> {mes.quantidade}</p>
              <p style={{ marginTop: '1rem', color: '#3498db', fontSize: '0.9rem' }}>Clique para ver detalhes</p>
            </div>
          ))}
        </div>

        {historicoMensal.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhuma conta paga no histórico</p>
          </div>
        )}
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
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Nova Conta Recorrente</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Nome da Conta:</label>
              <input
                type="text"
                value={cadastroRapidoData.nome}
                onChange={(e) => setCadastroRapidoData({ ...cadastroRapidoData, nome: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); salvarCadastroRapido(); } }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Descrição:</label>
              <input
                type="text"
                value={cadastroRapidoData.descricao}
                onChange={(e) => setCadastroRapidoData({ ...cadastroRapidoData, descricao: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); salvarCadastroRapido(); } }}
                placeholder="Opcional"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Categoria:</label>
              <select
                value={cadastroRapidoData.categoriaId}
                onChange={(e) => setCadastroRapidoData({ ...cadastroRapidoData, categoriaId: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn"
                style={{ backgroundColor: '#27ae60' }}
                onClick={salvarCadastroRapido}
                disabled={!cadastroRapidoData.nome.trim()}
              >
                Salvar
              </button>
              <button
                className="btn"
                onClick={() => { setShowCadastroRapido(false); setCadastroRapidoData({ nome: '', descricao: '' }); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Contas a Pagar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={voltarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
          <h3 style={{ margin: 0 }}>{getMesAno()}</h3>
          <button onClick={avancarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>→</button>
          <button className="btn" onClick={() => {
            setShowHistorico(true);
            carregarHistorico();
          }} style={{ backgroundColor: '#9b59b6' }}>
            Histórico
          </button>
          <button className="btn" onClick={() => setShowForm(true)}>
            Nova Conta
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingConta ? 'Editar' : 'Nova'} Conta</h3>
          <form onSubmit={salvarConta}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Tipo de Conta:</label>
                <select
                  value={formData.tipoCadastro}
                  onChange={(e) => setFormData({ ...formData, tipoCadastro: e.target.value, contaRecorrenteId: '' })}
                >
                  <option value="pontual">Pontual</option>
                  <option value="recorrente">Recorrente</option>
                </select>
              </div>
              {formData.tipoCadastro === 'recorrente' && (
                <div>
                  <label>Conta Recorrente:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={formData.contaRecorrenteId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const cr = contasRecorrentes.find(c => String(c.id) === id);
                        setFormData(prev => ({
                          ...prev,
                          contaRecorrenteId: id,
                          categoriaId: cr?.categoria ? String(cr.categoria.id) : prev.categoriaId
                        }));
                      }}
                      required
                      style={{ flex: 1 }}
                    >
                      <option value="">Selecione</option>
                      {contasRecorrentes.map(cr => (
                        <option key={cr.id} value={cr.id}>{cr.nome}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCadastroRapido(true)}
                      style={{ padding: '0.5rem', fontSize: '0.8rem', whiteSpace: 'nowrap', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Nova
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {formData.tipoCadastro === 'pontual' && (
                <div>
                  <label>Descrição:</label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                </div>
              )}
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
                <label>Categoria:</label>
                <select
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
              <div>
                <label>Data de Vencimento:</label>
                <input
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Forma de Pagamento:</label>
                <select
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
                <div>
                  <label>Chave Pix:</label>
                  <input
                    type="text"
                    value={formData.chavePix}
                    onChange={(e) => setFormData({...formData, chavePix: e.target.value})}
                    placeholder="Digite a chave Pix"
                    maxLength={300}
                  />
                </div>
              )}
              {formData.formaPagamento === 'BOLETO' && (
                <div>
                  <label>Anexar Boleto (PDF/JPG):</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, anexoBoleto: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editingConta ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={() => {
                setShowForm(false);
                setEditingConta(null);
                setShowCadastroRapido(false);
                setFormData({
                  descricao: '',
                  valor: '',
                  dataVencimento: '',
                  categoriaId: '',
                  formaPagamento: '',
                  chavePix: '',
                  anexoBoleto: '',
                  tipoCadastro: 'pontual',
                  contaRecorrenteId: ''
                });
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#fff3cd' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total a Pagar</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
              R$ {contas.filter(c => c.formaPagamento !== 'CARTAO_CREDITO').reduce((sum, c) => sum + parseFloat(c.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Quantidade de Contas</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
              {contas.length}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Lista de Contas - {contas.length} conta(s)</h3>
        {contas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhuma conta pendente</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Vencimento</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.map(conta => (
                  <tr key={conta.id} style={{ borderBottom: '1px solid #eee', backgroundColor: getStatusColor(conta) }}>
                    <td style={{ padding: '0.5rem' }}>
                      {conta.descricao}
                      {conta.formaPagamento === 'PIX' && conta.chavePix && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                          Pix: {conta.chavePix}
                        </div>
                      )}
                      {conta.formaPagamento === 'BOLETO' && conta.anexoBoleto && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const win = window.open();
                              win.document.write(`<iframe src="${conta.anexoBoleto}" style="width:100%;height:100%;border:none;"></iframe>`);
                            }}
                            style={{ fontSize: '0.8rem', color: '#3498db', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            📄 Ver Boleto
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{conta.categoria.nome}</td>
                    <td style={{ padding: '0.5rem' }}>{getTipoLabel(conta)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {new Date(conta.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {conta.pago ? '✅ Pago' : '⏳ Pendente'}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {!conta.pago && (
                        <button 
                          onClick={() => marcarComoPago(conta.id)}
                          style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                          Pagar
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
                            anexoBoleto: conta.anexoBoleto || '',
                            tipoCadastro: conta.contaRecorrente ? 'recorrente' : 'pontual',
                            contaRecorrenteId: conta.contaRecorrente ? String(conta.contaRecorrente.id) : ''
                          });
                          setShowForm(true);
                        }}
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirConta(conta.id)}
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

export default ContasPagar;