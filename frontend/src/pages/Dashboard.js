import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

function Dashboard() {
  const [contas, setContas] = useState([]);
  const [rendimentos, setRendimentos] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [resumoMes, setResumoMes] = useState(null);
  const [historicoRecorrentes, setHistoricoRecorrentes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());

  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!user) {
      console.error('Usuário não encontrado no localStorage');
      setLoading(false);
      return;
    }
    carregarDados();
  }, [mesAtual]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      await Promise.all([
        carregarContas(ano, mes),
        carregarRendimentos(),
        carregarDividas(),
        carregarResumoMes(ano, mes),
        carregarHistoricoRecorrentes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistoricoRecorrentes = async () => {
    try {
      const res = await api.get(`/api/dashboard/contas-recorrentes-historico?username=${user}`);
      setHistoricoRecorrentes(res.data);
    } catch (e) {
      console.error('Erro ao carregar histórico de recorrentes:', e);
    }
  };

  const carregarContas = async (ano, mes) => {
    try {
      const response = await api.get(`/api/dashboard/contas-mes?username=${user}&ano=${ano}&mes=${mes}`);
      setContas(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const carregarResumoMes = async (ano, mes) => {
    try {
      const response = await api.get(`/api/dashboard/resumo-mes?username=${user}&ano=${ano}&mes=${mes}`);
      setResumoMes(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const carregarRendimentos = async () => {
    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      const response = await api.get(`/api/dashboard/rendimentos-mes?username=${user}&ano=${ano}&mes=${mes}`);
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

  const dadosContas = {
    labels: contas.map(c => c.descricao),
    datasets: [{
      data: contas.map(c => parseFloat(c.valor)),
      backgroundColor: cores.slice(0, contas.length),
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
  const totalParcelasDividas = dividas.reduce((sum, d) => sum + parseFloat(d.valorParcela || 0), 0);
  const rendaLivre = Math.max(0, totalRendimentos - totalParcelasDividas);

  const dadosDividas = {
    labels: ['Comprometido com Parcelas', 'Renda Livre'],
    datasets: [{
      data: [totalParcelasDividas, rendaLivre],
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dashboard Financeiro</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={voltarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
          <h3 style={{ margin: 0 }}>{getMesAno()}</h3>
          <button onClick={avancarMes} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>→</button>
          <button onClick={() => window.print()} className="btn" style={{ backgroundColor: '#9b59b6' }}>📄 Relatório</button>
        </div>
      </div>

      {resumoMes && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Resumo do Mês</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total em Contas</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c', margin: '0.5rem 0' }}>
                R$ {resumoMes.totalContas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>{resumoMes.quantidadeContas} contas</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Contas Pagas</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60', margin: '0.5rem 0' }}>
                {resumoMes.contasPagas}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Contas Pendentes</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12', margin: '0.5rem 0' }}>
                {resumoMes.contasPendentes}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Gráfico de Contas do Mês */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Contas do Mês</h3>
          {contas.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Nenhuma conta cadastrada</p>
          ) : (
            <>
              <div style={{ height: '300px', marginBottom: '1rem' }}>
                <Pie data={dadosContas} options={opcoes} />
              </div>
              <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <strong style={{ fontSize: '1.1rem', color: '#e74c3c' }}>
                  Total: R$ {contas.reduce((sum, c) => sum + parseFloat(c.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <span>Parcelas:</span>
                  <strong style={{ color: '#e74c3c' }}>R$ {totalParcelasDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                  <span>Comprometimento:</span>
                  <strong style={{ color: totalParcelasDividas > totalRendimentos * 0.3 ? '#e74c3c' : '#f39c12' }}>
                    {totalRendimentos > 0 ? ((totalParcelasDividas / totalRendimentos) * 100).toFixed(1) : 0}%
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bloco de Contas Recorrentes - um gráfico por conta */}
      {historicoRecorrentes && historicoRecorrentes.datasets && historicoRecorrentes.datasets.length > 0 && (() => {
        const cores = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
        const pluginValoresPontos = {
          id: 'valoresPontos',
          afterDatasetsDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              const total = meta.data.length;
              meta.data.forEach((point, j) => {
                const valor = dataset.data[j];
                if (valor === 0) return;
                ctx.save();
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = dataset.borderColor;
                ctx.textBaseline = 'bottom';
                if (j === 0) ctx.textAlign = 'left';
                else if (j === total - 1) ctx.textAlign = 'right';
                else ctx.textAlign = 'center';
                ctx.fillText(
                  `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  point.x,
                  point.y - 8
                );
                ctx.restore();
              });
            });
          }
        };
        const opcoesLinha = {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 30 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }
            }
          }
        };
        return (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Contas Recorrentes — Últimos 6 Meses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {historicoRecorrentes.datasets.map((ds, i) => {
                const cor = cores[i % cores.length];
                const valores = ds.valores.map(v => parseFloat(v));
                const dadosLinha = {
                  labels: historicoRecorrentes.labels,
                  datasets: [{
                    label: ds.nome,
                    data: valores,
                    borderColor: cor,
                    backgroundColor: cor + '22',
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true
                  }]
                };
                const ultimoValor = valores.filter(v => v > 0).at(-1);
                return (
                  <div key={ds.nome} style={{ border: `2px solid ${cor}22`, borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong style={{ color: cor, fontSize: '1rem' }}>{ds.nome}</strong>
                      {ultimoValor && (
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          Último: <strong style={{ color: cor }}>R$ {ultimoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </span>
                      )}
                    </div>
                    <div style={{ height: '280px' }}>
                      <Line data={dadosLinha} options={opcoesLinha} plugins={[pluginValoresPontos]} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Dashboard;
