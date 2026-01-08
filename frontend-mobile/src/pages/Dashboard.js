import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { financeService } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [contas, setContas] = useState([]);
  const [rendimentos, setRendimentos] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [resumoMes, setResumoMes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());

  const user = localStorage.getItem('user') || 'admin';

  useEffect(() => {
    loadDashboard();
  }, [mesAtual]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;
      
      await Promise.all([
        carregarContas(ano, mes),
        carregarRendimentos(ano, mes),
        carregarDividas(),
        carregarResumoMes(ano, mes)
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Dados mock para demonstração
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const carregarContas = async (ano, mes) => {
    try {
      const response = await financeService.getContasMes(user, ano, mes);
      setContas(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      // Fallback para dados mock em caso de erro
      setContas([
        { id: 1, descricao: 'Cartão de Crédito', valor: 850, categoria: 'Cartão' },
        { id: 2, descricao: 'Financiamento Casa', valor: 1200, categoria: 'Moradia' }
      ]);
    }
  };

  const carregarRendimentos = async (ano, mes) => {
    try {
      const response = await financeService.getRendimentosMes(user, ano, mes);
      setRendimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
      setRendimentos([
        { id: 1, descricao: 'Salário', valor: 4500 },
        { id: 2, descricao: 'Freelance', valor: 800 }
      ]);
    }
  };

  const carregarDividas = async () => {
    try {
      const response = await financeService.getDividas(user);
      setDividas(response.data);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      setDividas([
        { id: 1, descricao: 'Financiamento Carro', valorTotal: 15000 }
      ]);
    }
  };

  const carregarResumoMes = async (ano, mes) => {
    try {
      const response = await financeService.getResumoMes(user, ano, mes);
      setResumoMes(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      setResumoMes({
        totalContas: 2050,
        quantidadeContas: 2,
        contasPagas: 1,
        contasPendentes: 1
      });
    }
  };

  const setMockData = () => {
    setContas([
      { id: 1, descricao: 'Cartão de Crédito', valor: 850, categoria: 'Cartão' },
      { id: 2, descricao: 'Financiamento Casa', valor: 1200, categoria: 'Moradia' }
    ]);
    setRendimentos([
      { id: 1, descricao: 'Salário', valor: 4500 },
      { id: 2, descricao: 'Freelance', valor: 800 }
    ]);
    setResumoMes({
      totalContas: 2050,
      quantidadeContas: 2,
      contasPagas: 1,
      contasPendentes: 1
    });
  };

  const cores = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];

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
  const totalDividas = dividas.reduce((sum, d) => sum + parseFloat(d.valorTotal), 0);
  const totalParcelasDividas = dividas.reduce((sum, d) => sum + (d.valorParcela ? parseFloat(d.valorParcela) : 0), 0);
  const rendaLivre = Math.max(0, totalRendimentos - totalParcelasDividas);

  const dadosDividas = {
    labels: ['Comprometido com Parcelas', 'Renda Livre'],
    datasets: [{
      data: [totalParcelasDividas, rendaLivre],
      backgroundColor: ['#dc3545', '#28a745'],
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
          padding: 10,
          font: { size: 10 }
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

  const getMesAno = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[mesAtual.getMonth()]}/${mesAtual.getFullYear()}`;
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="mobile-content">
      {/* Navegação de Mês */}
      <div className="mobile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={voltarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>←</button>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>{getMesAno()}</h3>
          <button onClick={avancarMes} className="btn-mobile btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>→</button>
        </div>
      </div>

      {/* Resumo do Mês */}
      {resumoMes && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value negative">
              R$ {resumoMes.totalContas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="summary-label">Total Contas</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value positive">
              {resumoMes.contasPagas}
            </div>
            <div className="summary-label">Pagas</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value" style={{color: '#ffc107'}}>
              {resumoMes.contasPendentes}
            </div>
            <div className="summary-label">Pendentes</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value" style={{color: '#007bff'}}>
              {resumoMes.quantidadeContas}
            </div>
            <div className="summary-label">Total</div>
          </div>
        </div>
      )}

      {/* Gráfico de Contas */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">💳 Contas do Mês</h3>
        </div>
        {contas.length > 0 ? (
          <>
            <div style={{ height: '200px', marginBottom: '1rem' }}>
              <Pie data={dadosContas} options={opcoes} />
            </div>
            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <strong style={{ color: '#dc3545' }}>
                Total: R$ {contas.reduce((sum, c) => sum + parseFloat(c.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
            Nenhuma conta cadastrada
          </div>
        )}
      </div>

      {/* Gráfico de Rendimentos */}
      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">💰 Rendimentos</h3>
        </div>
        {rendimentos.length > 0 ? (
          <>
            <div style={{ height: '200px', marginBottom: '1rem' }}>
              <Pie data={dadosRendimentos} options={opcoes} />
            </div>
            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <strong style={{ color: '#28a745' }}>
                Total: R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
            Nenhum rendimento cadastrado
          </div>
        )}
      </div>

      {/* Gráfico de Impacto das Dívidas */}
      {totalRendimentos > 0 && (
        <div className="mobile-card">
          <div className="card-header">
            <h3 className="card-title">📊 Impacto das Dívidas</h3>
          </div>
          <div style={{ height: '200px', marginBottom: '1rem' }}>
            <Pie data={dadosDividas} options={opcoes} />
          </div>
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Renda Total:</span>
              <strong style={{ color: '#28a745' }}>R$ {totalRendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Parcelas:</span>
              <strong style={{ color: '#dc3545' }}>R$ {totalParcelasDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e9ecef', fontSize: '0.9rem' }}>
              <span>Comprometimento:</span>
              <strong style={{ color: totalParcelasDividas > totalRendimentos * 0.3 ? '#dc3545' : '#ffc107' }}>
                {totalRendimentos > 0 ? ((totalParcelasDividas / totalRendimentos) * 100).toFixed(1) : 0}%
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;