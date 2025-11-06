import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Dividas() {
  const [dividas, setDividas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDivida, setEditingDivida] = useState(null);
  const [selectedDivida, setSelectedDivida] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [showPagamentoForm, setShowPagamentoForm] = useState(false);
  const [formData, setFormData] = useState({
    instituicao: '',
    valorTotal: '',
    taxaJuros: '',
    tipoTaxa: 'MENSAL',
    saldoDevedor: ''
  });
  const [pagamentoForm, setPagamentoForm] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: ''
  });

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarDividas();
  }, []);

  const carregarDividas = async () => {
    try {
      const response = await api.get(`/api/dividas?username=${user}`);
      setDividas(response.data);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
    }
  };

  const carregarPagamentos = async (dividaId) => {
    try {
      const response = await api.get(`/api/dividas/${dividaId}/pagamentos`);
      setPagamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  };

  const salvarDivida = async (e) => {
    e.preventDefault();
    try {
      if (editingDivida) {
        await api.put(`/api/dividas/${editingDivida.id}`, formData);
      } else {
        await api.post('/api/dividas', { ...formData, username: user });
      }
      carregarDividas();
      setShowForm(false);
      setEditingDivida(null);
      setFormData({ instituicao: '', valorTotal: '', taxaJuros: '', tipoTaxa: 'MENSAL', saldoDevedor: '' });
    } catch (error) {
      alert('Erro ao salvar dívida');
    }
  };

  const excluirDivida = async (id) => {
    if (window.confirm('Deseja excluir esta dívida?')) {
      try {
        await api.delete(`/api/dividas/${id}`);
        carregarDividas();
      } catch (error) {
        alert('Erro ao excluir dívida');
      }
    }
  };

  const salvarPagamento = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/dividas/${selectedDivida.id}/pagamentos`, pagamentoForm);
      carregarPagamentos(selectedDivida.id);
      carregarDividas();
      setShowPagamentoForm(false);
      setPagamentoForm({ dataPagamento: new Date().toISOString().split('T')[0], valorPago: '' });
    } catch (error) {
      alert('Erro ao registrar pagamento');
    }
  };

  const excluirPagamento = async (id) => {
    if (window.confirm('Deseja excluir este pagamento?')) {
      try {
        await api.delete(`/api/dividas/pagamentos/${id}`);
        carregarPagamentos(selectedDivida.id);
        carregarDividas();
      } catch (error) {
        alert('Erro ao excluir pagamento');
      }
    }
  };

  if (selectedDivida) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>{selectedDivida.instituicao}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={() => setShowPagamentoForm(true)}>Registrar Pagamento</button>
            <button className="btn" onClick={() => setSelectedDivida(null)}>Voltar</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Valor Total</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                R$ {parseFloat(selectedDivida.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Taxa de Juros</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                {parseFloat(selectedDivida.taxaJuros).toFixed(2)}% {selectedDivida.tipoTaxa === 'MENSAL' ? 'a.m.' : 'a.a.'}
              </p>
            </div>
            <div style={{ backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#721c24', fontWeight: 'bold' }}>Saldo Devedor</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                R$ {parseFloat(selectedDivida.saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {showPagamentoForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Registrar Pagamento</h3>
            <form onSubmit={salvarPagamento}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Data do Pagamento:</label>
                  <input type="date" value={pagamentoForm.dataPagamento} onChange={(e) => setPagamentoForm({...pagamentoForm, dataPagamento: e.target.value})} required />
                </div>
                <div>
                  <label>Valor Pago:</label>
                  <input type="number" step="0.01" value={pagamentoForm.valorPago} onChange={(e) => setPagamentoForm({...pagamentoForm, valorPago: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn" style={{ marginRight: '0.5rem' }}>Salvar</button>
              <button type="button" className="btn" onClick={() => { setShowPagamentoForm(false); setPagamentoForm({ dataPagamento: new Date().toISOString().split('T')[0], valorPago: '' }); }}>Cancelar</button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Histórico de Pagamentos</h3>
          {pagamentos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhum pagamento registrado</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Valor Pago</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map(pag => (
                  <tr key={pag.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(pag.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>R$ {parseFloat(pag.valorPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button onClick={() => excluirPagamento(pag.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
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
        <h2>Dívidas</h2>
        <button className="btn" onClick={() => setShowForm(true)}>Nova Dívida</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{editingDivida ? 'Editar' : 'Nova'} Dívida</h3>
          <form onSubmit={salvarDivida}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Instituição:</label>
              <input type="text" value={formData.instituicao} onChange={(e) => setFormData({...formData, instituicao: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Valor Total:</label>
                <input type="number" step="0.01" value={formData.valorTotal} onChange={(e) => setFormData({...formData, valorTotal: e.target.value})} required />
              </div>
              <div>
                <label>Saldo Devedor Atual:</label>
                <input type="number" step="0.01" value={formData.saldoDevedor} onChange={(e) => setFormData({...formData, saldoDevedor: e.target.value})} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Taxa de Juros (%):</label>
                <input type="number" step="0.01" value={formData.taxaJuros} onChange={(e) => setFormData({...formData, taxaJuros: e.target.value})} required />
              </div>
              <div>
                <label>Tipo de Taxa:</label>
                <select value={formData.tipoTaxa} onChange={(e) => setFormData({...formData, tipoTaxa: e.target.value})}>
                  <option value="MENSAL">Mensal (a.m.)</option>
                  <option value="ANUAL">Anual (a.a.)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginRight: '0.5rem' }}>{editingDivida ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingDivida(null); setFormData({ instituicao: '', valorTotal: '', taxaJuros: '', tipoTaxa: 'MENSAL', saldoDevedor: '' }); }}>Cancelar</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {dividas.map(divida => (
          <div key={divida.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedDivida(divida); carregarPagamentos(divida.id); }}>
            <h3>{divida.instituicao}</h3>
            <p><strong>Valor Total:</strong> R$ {parseFloat(divida.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><strong>Taxa:</strong> {parseFloat(divida.taxaJuros).toFixed(2)}% {divida.tipoTaxa === 'MENSAL' ? 'a.m.' : 'a.a.'}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
              Saldo: R$ {parseFloat(divida.saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={(e) => { e.stopPropagation(); setEditingDivida(divida); setFormData({ instituicao: divida.instituicao, valorTotal: divida.valorTotal, taxaJuros: divida.taxaJuros, tipoTaxa: divida.tipoTaxa, saldoDevedor: divida.saldoDevedor }); setShowForm(true); }} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>Editar</button>
              <button onClick={(e) => { e.stopPropagation(); excluirDivida(divida.id); }} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {dividas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhuma dívida cadastrada</p>
        </div>
      )}
    </div>
  );
}

export default Dividas;
