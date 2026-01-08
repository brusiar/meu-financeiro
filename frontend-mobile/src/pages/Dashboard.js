import React, { useState, useEffect } from 'react';
import { financeService } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await financeService.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Dados mock para demonstração
      setData({
        totalReceitas: 5000,
        totalDespesas: 3200,
        saldo: 1800,
        contasPendentes: 5,
        proximosVencimentos: [
          { id: 1, descricao: 'Cartão de Crédito', valor: 850, vencimento: '2026-01-15' },
          { id: 2, descricao: 'Financiamento Casa', valor: 1200, vencimento: '2026-01-20' },
        ]
      });
    } finally {
      setLoading(false);
    }
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
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-value positive">
            R$ {data?.totalReceitas?.toLocaleString('pt-BR') || '0,00'}
          </div>
          <div className="summary-label">Receitas</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value negative">
            R$ {data?.totalDespesas?.toLocaleString('pt-BR') || '0,00'}
          </div>
          <div className="summary-label">Despesas</div>
        </div>
        
        <div className="summary-card">
          <div className={`summary-value ${data?.saldo >= 0 ? 'positive' : 'negative'}`}>
            R$ {data?.saldo?.toLocaleString('pt-BR') || '0,00'}
          </div>
          <div className="summary-label">Saldo</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{color: '#007bff'}}>
            {data?.contasPendentes || 0}
          </div>
          <div className="summary-label">Pendentes</div>
        </div>
      </div>

      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">📅 Próximos Vencimentos</h3>
        </div>
        
        {data?.proximosVencimentos?.length > 0 ? (
          data.proximosVencimentos.map((conta) => (
            <div key={conta.id} className="list-item">
              <div className="item-header">
                <span className="item-title">{conta.descricao}</span>
                <span className="item-value negative">
                  R$ {conta.valor.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="item-details">
                Vence em: {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '1rem' }}>
            Nenhum vencimento próximo
          </div>
        )}
      </div>

      <div className="mobile-card">
        <div className="card-header">
          <h3 className="card-title">⚡ Ações Rápidas</h3>
        </div>
        
        <button className="btn-mobile btn-success">
          ➕ Nova Receita
        </button>
        
        <button className="btn-mobile btn-danger">
          ➖ Nova Despesa
        </button>
        
        <button className="btn-mobile btn-secondary">
          📊 Ver Relatórios
        </button>
      </div>
    </div>
  );
};

export default Dashboard;