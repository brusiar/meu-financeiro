import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [cartoes, setCartoes] = useState([]);
  const [resumoContas, setResumoContas] = useState(null);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [gastosAtual, setGastosAtual] = useState([]);
  const [gastosPorCartao, setGastosPorCartao] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarDados();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarCartoes(),
        carregarResumoContas(),
        carregarGastosPorCategoria(),
        carregarGastosAtual(),
        carregarGastosPorCartao()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const carregarCartoes = async () => {
    try {
      const response = await api.get(`/api/cartoes?username=${user}`);
      setCartoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    }
  };

  const carregarResumoContas = async () => {
    try {
      const response = await api.get(`/api/contas/resumo-mes?username=${user}`);
      setResumoContas(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo de contas:', error);
    }
  };

  const carregarGastosPorCategoria = async () => {
    try {
      const response = await api.get(`/api/dashboard/gastos-categoria?username=${user}`);
      setGastosPorCategoria(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos por categoria:', error);
    }
  };

  const carregarGastosAtual = async () => {
    try {
      const response = await api.get(`/api/dashboard/gastos-categoria-atual?username=${user}`);
      setGastosAtual(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos atuais:', error);
    }
  };

  const carregarGastosPorCartao = async () => {
    try {
      const response = await api.get(`/api/dashboard/gastos-cartao?username=${user}`);
      setGastosPorCartao(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos por cartão:', error);
    }
  };

  const cores = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  const getMesAnoAtual = () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const data = new Date();
    return `${meses[data.getMonth()]}/${data.getFullYear()}`;
  };

  const getMesAnoAnterior = () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const data = new Date();
    data.setMonth(data.getMonth() - 1);
    return `${meses[data.getMonth()]}/${data.getFullYear()}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Dashboard</h2>

      {/* Resumo de Contas do Mês */}
      {resumoContas && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center' }}>Contas do Mês Atual</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404', fontWeight: 'bold' }}>Pendentes</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#e74c3c' }}>
                {resumoContas.pendentes}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                R$ {parseFloat(resumoContas.valorPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724', fontWeight: 'bold' }}>Pagas</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#27ae60' }}>
                {resumoContas.pagas}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                R$ {parseFloat(resumoContas.valorPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c5460', fontWeight: 'bold' }}>Total</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#17a2b8' }}>
                {resumoContas.total}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                R$ {parseFloat(resumoContas.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className="btn" 
              onClick={() => navigate('/contas')}
              style={{ backgroundColor: '#3498db' }}
            >
              Verificar Contas
            </button>
          </div>
        </div>
      )}

      {/* Cartões de Crédito */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Cartões de Crédito</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {cartoes.map(cartao => (
            <div key={cartao.id} className="card" style={{ backgroundColor: '#f8f9fa' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{cartao.apelido}</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                {cartao.banco} - **** {cartao.ultimosDigitos}
              </p>
              <p style={{ margin: '1rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                R$ {parseFloat(cartao.totalGastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                Gastos não faturados
              </p>
            </div>
          ))}
          {cartoes.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum cartão cadastrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Gastos por Cartão */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Gastos por Cartão - Mês Atual</h3>
        {gastosPorCartao.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum gasto em cartão neste mês</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {gastosPorCartao.map((item, index) => {
                const total = gastosPorCartao.reduce((sum, g) => sum + parseFloat(g.total), 0);
                const percentual = (parseFloat(item.total) / total) * 100;
                
                return (
                  <div key={item.cartao} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ minWidth: '150px' }}>
                      <strong>{item.cartao}</strong>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '30px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${percentual}%`,
                        backgroundColor: cores[index % cores.length],
                        transition: 'width 0.3s ease'
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        color: percentual > 50 ? 'white' : '#333',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        R$ {parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentual.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #ddd', textAlign: 'right' }}>
              <strong style={{ fontSize: '1.2rem' }}>
                Total: R$ {gastosPorCartao.reduce((sum, g) => sum + parseFloat(g.total), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Gastos Mês Atual */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Gastos por Categoria - Mês Atual</h3>
        {gastosAtual.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum gasto registrado neste mês</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {gastosAtual.map((item, index) => {
                const total = gastosAtual.reduce((sum, g) => sum + parseFloat(g.total), 0);
                const percentual = (parseFloat(item.total) / total) * 100;
                
                return (
                  <div key={item.categoria} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ minWidth: '150px' }}>
                      <strong>{item.categoria}</strong>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '30px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${percentual}%`,
                        backgroundColor: cores[index % cores.length],
                        transition: 'width 0.3s ease'
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        color: percentual > 50 ? 'white' : '#333',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        R$ {parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentual.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #ddd', textAlign: 'right' }}>
              <strong style={{ fontSize: '1.2rem' }}>
                Total: R$ {gastosAtual.reduce((sum, g) => sum + parseFloat(g.total), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Gastos por Categoria */}
      <div>
        <h3>Gastos de {getMesAnoAnterior()} por Categoria</h3>
        {gastosPorCategoria.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum gasto registrado no mês anterior</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {gastosPorCategoria.map((item, index) => {
                const total = gastosPorCategoria.reduce((sum, g) => sum + parseFloat(g.total), 0);
                const percentual = (parseFloat(item.total) / total) * 100;
                
                return (
                  <div key={item.categoria} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ minWidth: '150px' }}>
                      <strong>{item.categoria}</strong>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '30px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${percentual}%`,
                        backgroundColor: cores[index % cores.length],
                        transition: 'width 0.3s ease'
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        color: percentual > 50 ? 'white' : '#333',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        R$ {parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentual.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #ddd', textAlign: 'right' }}>
              <strong style={{ fontSize: '1.2rem' }}>
                Total: R$ {gastosPorCategoria.reduce((sum, g) => sum + parseFloat(g.total), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
