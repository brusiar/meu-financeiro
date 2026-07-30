import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const pluginValores = (id) => ({
  id,
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
        ctx.textAlign = j === 0 ? 'left' : j === total - 1 ? 'right' : 'center';
        ctx.fillText(`R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, point.x, point.y - 8);
        ctx.restore();
      });
    });
  }
});

const opcoesLinha = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 30 } },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => `R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
  },
  scales: {
    y: { beginAtZero: true, ticks: { callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
  }
};

function BlocoGraficos({ titulo, historico, cores }) {
  if (!historico?.datasets?.length) return null;
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{titulo}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {historico.datasets.map((ds, i) => {
          const cor = cores[i % cores.length];
          const valores = ds.valores.map(v => parseFloat(v));
          const ultimoValor = valores.filter(v => v > 0).at(-1);
          const dadosLinha = {
            labels: historico.labels,
            datasets: [{ label: ds.nome, data: valores, borderColor: cor, backgroundColor: cor + '22', tension: 0.3, pointRadius: 5, pointHoverRadius: 7, fill: true }]
          };
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
                <Line data={dadosLinha} options={opcoesLinha} plugins={[pluginValores(`plugin-${titulo}-${i}`)]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Graficos() {
  const [historicoContas, setHistoricoContas] = useState(null);
  const [historicoRendimentos, setHistoricoRendimentos] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem('user');

  useEffect(() => {
    Promise.all([
      api.get(`/api/dashboard/contas-recorrentes-historico?username=${user}`).then(r => setHistoricoContas(r.data)),
      api.get(`/api/dashboard/rendimentos-recorrentes-historico?username=${user}`).then(r => setHistoricoRendimentos(r.data))
    ]).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando gráficos...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Gráficos</h2>
      <BlocoGraficos
        titulo="Contas Recorrentes — Últimos 6 Meses"
        historico={historicoContas}
        cores={['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']}
      />
      <BlocoGraficos
        titulo="Pagadores Recorrentes — Últimos 6 Meses"
        historico={historicoRendimentos}
        cores={['#27ae60', '#2ecc71', '#1abc9c', '#16a085', '#3498db', '#9b59b6', '#f39c12', '#e67e22']}
      />
      {!historicoContas?.datasets?.length && !historicoRendimentos?.datasets?.length && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>Nenhum dado recorrente cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
}

export default Graficos;
