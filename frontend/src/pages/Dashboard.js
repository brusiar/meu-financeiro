import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [rendimentos, setRendimentos] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem('user');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarGastosPorCategoria(),
        carregarRendimentos(),
        carregarDividas()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const carregarGastosPorCategoria = async () => {
    try {
      const response = await api.get(`/api/dashboard/gastos-categoria-atual?username=${user}`);
      setGastosPorCategoria(response.data);
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
    }
  };

  const carregarRendimentos = async () => {
    try {
      const response = await api.get(`/api/rendimentos?username=${user}`);
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
    }
  };

  const carregarDividas = async () => {
    try {
      const response = await api.get(`/api/dividas?username=${user}`);
      setDividas(response.data);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
    }
  };

  const cores = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'];

  const dadosGastos = {
    labels: gastosPorCategoria.map(g => g.categoria),
    datasets: [{
      data: gastosPorCategoria.map(g => parseFloat(g.total)),
      backgroundColor: cores.slice(0, gastosPorCategoria.length),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const dadosRendimentos = {
    labels: rendimentos.map(r => r.descricao),
    datasets: [{
      data: rendimentos.map(r => parseFloat(r.valor)),
      backgroundColor: cores.slice(0, rendimentos.length),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const totalRendimentos = rendimentos.reduce((sum, r) => sum + parseFloat(r.valor), 0);
  const totalDividas = dividas.reduce((sum, d) => sum + parseFloat(d.valorTotal), 0);
  const rendaLivre = Math.max(0, totalRendimentos - totalDividas);

  const dadosDividas = {
    labels: ['Comprometido com Dívidas', 'Renda Livre'],
    datasets: [{
      data: [totalDividas, rendaLivre],
      backgroundColor: ['#e74c3c', '#27ae60'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    }
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
      <h2 style={{ marginBottom: '2rem' }}>Dashboard Financeiro</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Gráfico de Gastos por Categoria */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Gastos por Categoria</h3>
          {gastosPorCategoria.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Nenhum gasto registrado</p>
          ) : (
            <>
              <div style={{ height: '300px', marginBottom: '1rem' }}>
                <Pie data={dadosGastos} options={opcoes} />
              </div>
              <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <strong style={{ fontSize: '1.1rem' }}>
                  Total: R$ {gastosPorCategoria.reduce((sum, g) => sum + parseFloat(g.total), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </>
          )}
        </div>

        {/* Gráfico de Rendimentos */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Rendimentos</h3>
          {rendimentos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Nenhum rendimento cadastrado</p>
          ) : (
            <>
              <div style={{ height: '300px', marginBottom: '1rem' }}>
                <Pie data={dadosRendimentos} options={opcoes} />
              </div>
              <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <strong style={{ fontSize: '1.1rem', color: '#27ae60' }}>
                  Total: R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </>
          )}
        </div>

        {/* Gráfico de Impacto das Dívidas */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Impacto das Dívidas na Renda</h3>
          {totalRendimentos === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Cadastre rendimentos para visualizar</p>
          ) : (
            <>
              <div style={{ height: '300px', marginBottom: '1rem' }}>
                <Pie data={dadosDividas} options={opcoes} />
              </div>
              <div style={{ paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Renda Total:</span>
                  <strong style={{ color: '#27ae60' }}>R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Dívidas:</span>
                  <strong style={{ color: '#e74c3c' }}>R$ {totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                  <span>Comprometimento:</span>
                  <strong style={{ color: totalDividas > totalRendimentos * 0.3 ? '#e74c3c' : '#f39c12' }}>
                    {totalRendimentos > 0 ? ((totalDividas / totalRendimentos) * 100).toFixed(1) : 0}%
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
