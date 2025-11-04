import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Cartoes() {
  const [cartoes, setCartoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCartao, setEditingCartao] = useState(null);
  const [formData, setFormData] = useState({ apelido: '', banco: '', ultimosDigitos: '', diaFechamento: '', diaVencimento: '' });
  const [selectedCartao, setSelectedCartao] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    valor: '',
    estabelecimento: '',
    categoriaId: '',
    dataGasto: '',
    parcelado: false,
    parcelasTotal: '',
    valorTotal: ''
  });
  const [editingGasto, setEditingGasto] = useState(null);
  const [showFaturaForm, setShowFaturaForm] = useState(false);
  const [mesReferencia, setMesReferencia] = useState('');
  const [showHistorico, setShowHistorico] = useState(false);
  const [faturas, setFaturas] = useState([]);
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [gastosFatura, setGastosFatura] = useState([]);

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarCartoes();
    carregarCategorias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarCartoes = async () => {
    try {
      const response = await api.get(`/api/cartoes?username=${user}`);
      setCartoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
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

  const carregarGastos = async (cartaoId) => {
    try {
      const response = await api.get(`/api/gastos/cartao/${cartaoId}`);
      setGastos(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
    }
  };

  const salvarCartao = async (e) => {
    e.preventDefault();
    try {
      const dados = { ...formData, username: user };
      if (editingCartao) {
        await api.put(`/api/cartoes/${editingCartao.id}`, dados);
      } else {
        await api.post('/api/cartoes', dados);
      }
      carregarCartoes();
      setShowForm(false);
      setEditingCartao(null);
      setFormData({ apelido: '', banco: '', ultimosDigitos: '', diaFechamento: '', diaVencimento: '' });
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const excluirCartao = async (id) => {
    if (window.confirm('Deseja excluir este cartão?')) {
      try {
        await api.delete(`/api/cartoes/${id}`);
        carregarCartoes();
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  const salvarGasto = async (e) => {
    e.preventDefault();
    try {
      const dados = {
        ...gastoForm,
        cartaoId: selectedCartao.id,
        dataGasto: gastoForm.dataGasto + 'T12:00:00'
      };
      if (editingGasto) {
        await api.put(`/api/gastos/${editingGasto.id}`, dados);
      } else {
        await api.post('/api/gastos', dados);
      }
      carregarGastos(selectedCartao.id);
      carregarCartoes(); // Atualiza totais
      setShowGastoForm(false);
      setEditingGasto(null);
      setGastoForm({
        valor: '',
        estabelecimento: '',
        categoriaId: '',
        dataGasto: '',
        parcelado: false,
        parcelasTotal: '',
        valorTotal: ''
      });
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
    }
  };

  const excluirGasto = async (id) => {
    if (window.confirm('Deseja excluir este gasto?')) {
      try {
        await api.delete(`/api/gastos/${id}`);
        carregarGastos(selectedCartao.id);
        carregarCartoes(); // Atualiza totais
      } catch (error) {
        console.error('Erro ao excluir gasto:', error);
      }
    }
  };

  const gerarPDF = async () => {
    try {
      // Gerar PDF
      const response = await api.post(`/api/fatura/gerar-pdf/${selectedCartao.id}`,
        JSON.stringify(mesReferencia),
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura_${selectedCartao.apelido}_${mesReferencia.replace('/', '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Fechar fatura (marcar gastos como faturados)
      await api.post(`/api/fatura/fechar-fatura/${selectedCartao.id}`, JSON.stringify(mesReferencia), {
        headers: { 'Content-Type': 'application/json' }
      });

      // Atualizar dados
      carregarGastos(selectedCartao.id);
      carregarCartoes();

      setShowFaturaForm(false);
      setMesReferencia('');

      alert('Fatura gerada e gastos removidos com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao processar fatura!');
    }
  };

  const carregarHistorico = async (cartaoId) => {
    try {
      const response = await api.get(`/api/fatura/historico/${cartaoId}`);
      setFaturas(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const carregarGastosFatura = async (faturaId) => {
    try {
      const response = await api.get(`/api/fatura/gastos-fatura/${faturaId}`);
      setGastosFatura(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos da fatura:', error);
    }
  };

  if (selectedFatura) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Fatura - {selectedFatura.mesReferencia}</h2>
          <button className="btn" onClick={() => setSelectedFatura(null)}>
            Voltar
          </button>
        </div>

        <div className="card">
          <h3>Detalhes da Fatura</h3>
          <p><strong>Cartão:</strong> {selectedCartao.apelido}</p>
          <p><strong>Mês:</strong> {selectedFatura.mesReferencia}</p>
          <p><strong>Total:</strong> R$ {parseFloat(selectedFatura.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p><strong>Data Fechamento:</strong> {new Date(selectedFatura.dataFechamento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="card">
          <h3>Gastos da Fatura</h3>
          {gastosFatura.length === 0 ? (
            <p>Nenhum gasto encontrado</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Data</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Estabelecimento</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Categoria</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Parcelas</th>
                  </tr>
                </thead>
                <tbody>
                  {gastosFatura.map(gasto => (
                    <tr key={gasto.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(gasto.dataGasto + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '0.5rem' }}>{gasto.estabelecimento}</td>
                      <td style={{ padding: '0.5rem' }}>{gasto.categoria}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        R$ {parseFloat(gasto.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {gasto.parcelado ? `${gasto.parcelasTotal}/${gasto.parcelasTotal}` : '-'}
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

  if (showHistorico) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Histórico de Faturas - {selectedCartao.apelido}</h2>
          <button className="btn" onClick={() => setShowHistorico(false)}>
            Voltar
          </button>
        </div>

        <div className="card">
          <h3>Faturas Fechadas</h3>
          {faturas.length === 0 ? (
            <p>Nenhuma fatura encontrada</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {faturas.map(fatura => (
                <div key={fatura.id} className="card" style={{ cursor: 'pointer' }} onClick={() => {
                  setSelectedFatura(fatura);
                  carregarGastosFatura(fatura.id);
                }}>
                  <h4>{fatura.mesReferencia}</h4>
                  <p><strong>Total:</strong> R$ {parseFloat(fatura.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p><strong>Fechada em:</strong> {new Date(fatura.dataFechamento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  <p style={{ marginTop: '1rem', color: '#3498db', fontSize: '0.9rem' }}>Clique para ver detalhes</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCartao) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Gastos - {selectedCartao.apelido}</h2>
          <div>
            <button className="btn" onClick={() => setShowGastoForm(true)} style={{ marginRight: '1rem' }}>
              Novo Gasto
            </button>
            <button className="btn" onClick={() => {
              if (window.confirm('Ao fechar a fatura, todos os gastos serão removidos após gerar o PDF. Deseja continuar?')) {
                setShowFaturaForm(true);
              }
            }} style={{ marginRight: '1rem', backgroundColor: '#27ae60' }}>
              Fechar Fatura
            </button>
            <button className="btn" onClick={() => {
              setShowHistorico(true);
              carregarHistorico(selectedCartao.id);
            }} style={{ marginRight: '1rem', backgroundColor: '#9b59b6' }}>
              Histórico
            </button>
            <button className="btn" onClick={() => setSelectedCartao(null)}>
              Voltar
            </button>
          </div>
        </div>

        {showFaturaForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Fechar Fatura</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Mês de Referência:</label>
              <input
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                required
              />
            </div>
            <div>
              <button className="btn" onClick={gerarPDF} style={{ marginRight: '1rem' }}>
                Gerar PDF
              </button>
              <button className="btn" onClick={() => {
                setShowFaturaForm(false);
                setMesReferencia('');
              }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {showGastoForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>{editingGasto ? 'Editar' : 'Novo'} Gasto</h3>
            <form onSubmit={salvarGasto}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Valor:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gastoForm.valor}
                    onChange={(e) => setGastoForm({ ...gastoForm, valor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Estabelecimento:</label>
                  <input
                    type="text"
                    value={gastoForm.estabelecimento}
                    onChange={(e) => setGastoForm({ ...gastoForm, estabelecimento: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Data do Gasto:</label>
                  <input
                    type="date"
                    value={gastoForm.dataGasto}
                    onChange={(e) => setGastoForm({ ...gastoForm, dataGasto: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Categoria:</label>
                <select
                  value={gastoForm.categoriaId}
                  onChange={(e) => setGastoForm({ ...gastoForm, categoriaId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={gastoForm.parcelado}
                    onChange={(e) =>
                      setGastoForm({ ...gastoForm, parcelado: e.target.checked })
                    }
                    style={{
                      margin: 0, // remove a margem padrão do checkbox
                      verticalAlign: 'middle' // ajuda na centralização
                    }}
                  />
                  Compra parcelada
                </label>
              </div>





              {gastoForm.parcelado && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label>Número de Parcelas:</label>
                    <input
                      type="number"
                      min="2"
                      value={gastoForm.parcelasTotal}
                      onChange={(e) => setGastoForm({ ...gastoForm, parcelasTotal: e.target.value })}
                      required={gastoForm.parcelado}
                    />
                  </div>
                  <div>
                    <label>Valor Total da Compra:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gastoForm.valorTotal}
                      onChange={(e) => setGastoForm({ ...gastoForm, valorTotal: e.target.value })}
                      required={gastoForm.parcelado}
                    />
                  </div>
                </div>
              )}
              <div>
                <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                  {editingGasto ? 'Atualizar' : 'Salvar'}
                </button>
                <button type="button" className="btn" onClick={() => {
                  setShowGastoForm(false);
                  setEditingGasto(null);
                  setGastoForm({
                    valor: '',
                    estabelecimento: '',
                    categoriaId: '',
                    dataGasto: '',
                    parcelado: false,
                    parcelasTotal: '',
                    valorTotal: ''
                  });
                }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Lista de Gastos</h3>
          {gastos.length === 0 ? (
            <p>Nenhum gasto cadastrado</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Data</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Estabelecimento</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Categoria</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Parcelas</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map(gasto => (
                    <tr key={gasto.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(gasto.dataGasto + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '0.5rem' }}>{gasto.estabelecimento}</td>
                      <td style={{ padding: '0.5rem' }}>{gasto.categoria.nome}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        R$ {parseFloat(gasto.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {gasto.parcelado ? `${gasto.parcelasRestantes}/${gasto.parcelasTotal}` : '-'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingGasto(gasto);
                            setGastoForm({
                              valor: gasto.valor,
                              estabelecimento: gasto.estabelecimento,
                              categoriaId: gasto.categoria.id,
                              dataGasto: new Date(gasto.dataGasto).toISOString().split('T')[0],
                              parcelado: gasto.parcelado || false,
                              parcelasTotal: gasto.parcelasTotal || '',
                              valorTotal: gasto.valorTotal || ''
                            });
                            setShowGastoForm(true);
                          }}
                          style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirGasto(gasto.id)}
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Meus Cartões</h2>
        <button className="btn" onClick={() => setShowForm(true)}>
          Novo Cartão
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingCartao ? 'Editar' : 'Novo'} Cartão</h3>
          <form onSubmit={salvarCartao}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Apelido:</label>
                <input
                  type="text"
                  value={formData.apelido}
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Banco:</label>
                <input
                  type="text"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Últimos 4 dígitos:</label>
                <input
                  type="text"
                  maxLength="4"
                  value={formData.ultimosDigitos}
                  onChange={(e) => setFormData({ ...formData, ultimosDigitos: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Dia de Fechamento (1-31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaFechamento}
                  onChange={(e) => setFormData({ ...formData, diaFechamento: e.target.value })}
                  placeholder="Ex: 22"
                />
              </div>
              <div>
                <label>Dia de Vencimento (1-31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaVencimento}
                  onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
                  placeholder="Ex: 1"
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn" style={{ marginRight: '1rem' }}>
                {editingCartao ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn" onClick={() => {
                setShowForm(false);
                setEditingCartao(null);
                setFormData({ apelido: '', banco: '', ultimosDigitos: '', diaFechamento: '', diaVencimento: '' });
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {cartoes.map(cartao => (
          <div key={cartao.id} className="card">
            <h3>{cartao.apelido}</h3>
            <p><strong>Banco:</strong> {cartao.banco}</p>
            <p><strong>Final:</strong> **** {cartao.ultimosDigitos}</p>
            <p><strong>Total Gastos:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              R$ {parseFloat(cartao.totalGastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span></p>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => {
                  setSelectedCartao(cartao);
                  carregarGastos(cartao.id);
                }}
              >
                Ver Gastos
              </button>
              <button
                className="btn"
                onClick={() => {
                  setEditingCartao(cartao);
                  setFormData({
                    apelido: cartao.apelido,
                    banco: cartao.banco,
                    ultimosDigitos: cartao.ultimosDigitos,
                    diaFechamento: cartao.diaFechamento || '',
                    diaVencimento: cartao.diaVencimento || ''
                  });
                  setShowForm(true);
                }}
              >
                Editar
              </button>
              <button
                onClick={() => excluirCartao(cartao.id)}
                style={{
                  padding: '0.5rem 1rem',
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

      {cartoes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>Nenhum cartão cadastrado. Clique em "Novo Cartão" para começar.</p>
        </div>
      )}
    </div>
  );
}

export default Cartoes;