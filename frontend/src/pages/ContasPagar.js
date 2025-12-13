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
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    categoriaId: '',
    formaPagamento: '',
    chavePix: '',
    anexoBoleto: ''
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarContas();
    carregarCategorias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarContas = async () => {
    try {
      const response = await api.get(`/api/contas?username=${user}`);
      setContas(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
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
      const dados = { ...formData, username: user };
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
        anexoBoleto: ''
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Contas a Pagar</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                setFormData({
                  descricao: '',
                  valor: '',
                  dataVencimento: '',
                  categoriaId: '',
                  formaPagamento: '',
                  chavePix: '',
                  anexoBoleto: ''
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
              R$ {contas.reduce((sum, c) => sum + parseFloat(c.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                            anexoBoleto: conta.anexoBoleto || ''
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