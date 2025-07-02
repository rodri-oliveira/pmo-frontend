"use client";

import React, { useState, useEffect } from 'react';

// --- Variáveis de Estilo (para manter a cor principal em um só lugar) ---
const styles = {
  wegBluePrimary: '#00579d',
  wegBlueDark: '#003f6f', // Um pouco mais escuro para detalhes
  textColorDark: '#333',
  textColorLight: '#f9f9f9',
  cardBg: '#ffffff',
  borderColor: '#e0e0e0',
  dashboardBg: '#f4f7f6', // Fundo claro para o dashboard
};

// --- Componentes Placeholder (Você os substituirá por seus componentes reais de busca de dados e mais complexos) ---

// Um componente de cartão simples e reutilizável com estilos inline
const DashboardCard = ({ title, value, unit, type = 'default' }) => {
  const baseCardStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s ease-in-out',
  };

  const cardTitleStyle = {
    fontSize: '1.2rem', // Aumentado para melhor legibilidade
    color: styles.wegBluePrimary, // Cor azul WEG, conforme solicitado
    fontWeight: 'bold', // Negrito, conforme solicitado
    marginBottom: '15px', // Aumentando o espaçamento para melhor UX
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
  };

  // Wrapper para alinhar valor e unidade de forma mais precisa
  const valueWrapperStyle = {
    display: 'flex',
    alignItems: 'baseline', // Alinha a base do número com o texto da unidade
    justifyContent: 'center',
  };

  const cardValueStyle = {
    fontSize: '2.8rem', // Aumentado para maior impacto visual
    fontWeight: '700',
    color: styles.wegBluePrimary,
  };

  const cardUnitStyle = {
    fontSize: '1rem',
    fontWeight: '500',
    marginLeft: '8px', // Espaçamento ajustado
    color: '#555',
  };

  // Ajustes para tipos específicos de cartão
  if (type === 'status') {
    cardValueStyle.color = styles.textColorDark; // Default para status, pode ser ajustado
  }

  return (
    <div style={baseCardStyle}>
      <div style={cardTitleStyle}>{title}</div>
      {/* O valor e a unidade agora estão dentro de um flex container para alinhamento perfeito */}
      <div style={valueWrapperStyle}>
        <span style={cardValueStyle}>{value}</span>
        {unit && <span style={cardUnitStyle}>{unit}</span>}
      </div>
    </div>
  );
};

// Placeholder para um componente de gráfico mais complexo com estilos inline
const ProjectStatusChart = ({ data }) => {
  const chartPanelStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  };

  const chartTitleStyle = {
    color: styles.textColorDark,
    marginTop: '0',
    marginBottom: '15px',
    fontSize: '1.3rem',
    borderBottom: `1px solid ${styles.borderColor}`,
    paddingBottom: '10px',
  };

  const statusItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
  };

  const statusItemLastChildStyle = {
    borderBottom: 'none',
  };

  const statusLabelStyle = {
    fontWeight: '500',
    color: styles.textColorDark,
  };

  const statusValueStyle = {
    fontWeight: '600',
    color: styles.wegBlueDark,
  };

  const chartPlaceholderStyle = {
    textAlign: 'center',
    color: '#bbb',
    fontStyle: 'italic',
    padding: '50px 0',
    border: `1px dashed ${styles.borderColor}`,
    marginTop: '20px',
  };

  return (
    <div style={chartPanelStyle}>
      <h3 style={chartTitleStyle}>Status dos Projetos</h3>
      {data.map((item, index) => (
        <div
          key={index}
          style={{
            ...statusItemStyle,
            ...(index === data.length - 1 ? statusItemLastChildStyle : {}),
          }}
        >
          <span style={statusLabelStyle}>{item.status}:</span>
          <span style={statusValueStyle}>{item.count}</span>
        </div>
      ))}
      <p style={chartPlaceholderStyle}>(Gráfico de Status dos Projetos aqui)</p>
    </div>
  );
};

const HoursComparisonChart = ({ planned, reported }) => {
  const chartPanelStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  };

  const chartTitleStyle = {
    color: styles.textColorDark,
    marginTop: '0',
    marginBottom: '15px',
    fontSize: '1.3rem',
    borderBottom: `1px solid ${styles.borderColor}`,
    paddingBottom: '10px',
  };

  const hoursSummaryStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
  };

  const hoursSummaryItemStyle = {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: styles.textColorDark,
  };

  const hoursSummaryItemSpanStyle = {
    display: 'block',
    fontSize: '0.9rem',
    color: '#777',
  };

  const hoursSummaryItemStrongStyle = {
    fontSize: '1.5rem',
    color: styles.wegBluePrimary,
  };

  const hoursProgressBarContainerStyle = {
    display: 'flex',
    height: '25px',
    borderRadius: '5px',
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    marginTop: '20px',
  };

  const total = planned + reported;
  const plannedPercentage = total > 0 ? (planned / total) * 100 : 0;
  const reportedPercentage = total > 0 ? (reported / total) * 100 : 0;

  const plannedBarStyle = {
    backgroundColor: styles.wegBluePrimary,
    width: `${plannedPercentage}%`,
  };

  const reportedBarStyle = {
    backgroundColor: '#5cb85c', // Uma cor distinta para horas apontadas
    width: `${reportedPercentage}%`,
  };

  const chartPlaceholderStyle = {
    textAlign: 'center',
    color: '#bbb',
    fontStyle: 'italic',
    padding: '50px 0',
    border: `1px dashed ${styles.borderColor}`,
    marginTop: '20px',
  };

  return (
    <div style={chartPanelStyle}>
      <h3 style={chartTitleStyle}>Horas Planejadas vs. Apontadas (Jira)</h3>
      <div style={hoursSummaryStyle}>
        <div style={hoursSummaryItemStyle}>
          <span style={hoursSummaryItemSpanStyle}>Planejadas:</span>{' '}
          <strong style={hoursSummaryItemStrongStyle}>{planned}h</strong>
        </div>
        <div style={hoursSummaryItemStyle}>
          <span style={hoursSummaryItemSpanStyle}>Apontadas:</span>{' '}
          <strong style={hoursSummaryItemStrongStyle}>{reported}h</strong>
        </div>
      </div>
      <div style={hoursProgressBarContainerStyle}>
        <div
          style={plannedBarStyle}
          title={`Planejadas: ${planned}h`}
        ></div>
        <div
          style={reportedBarStyle}
          title={`Apontadas: ${reported}h`}
        ></div>
      </div>
      <p style={chartPlaceholderStyle}>(Gráfico de Comparação de Horas aqui)</p>
    </div>
  );
};
const PMODashboard = () => {
  // --- Dados Mock (Substitua pela busca de dados real de suas APIs/estado) ---
  const [secaoData, setSecaoData] = useState({ SGI: 0, TIN: 0, SEG: 0 });

  useEffect(() => {
    const fetchProjetosAtivosPorSecao = async () => {
      try {
        const response = await fetch('http://localhost:8000/backend/v1/dashboard/projetos-ativos-por-secao');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSecaoData(data);
      } catch (error) {
        console.error("Falha ao buscar dados de projetos por seção:", error);
        // Manter os dados zerados ou mostrar uma mensagem de erro
        setSecaoData({ SGI: 'Erro', TIN: 'Erro', SEG: 'Erro' });
      }
    };

    fetchProjetosAtivosPorSecao();
  }, []); // O array vazio garante que o efeito rode apenas uma vez, no mount do componente

  const projectSummary = {
    total: 45,
    inProgress: 30,
    delayed: 5,
    completed: 10,
  };

  const teamSummary = {
    totalTeams: 8,
    activeMembers: 75,
  };

  const resourceSummary = {
    allocated: 60,
    available: 15,
  };

  const allocationSummary = {
    totalAllocations: 120,
    overAllocated: 3,
  };

  const hoursData = {
    planned: 5000, // Total de horas planejadas
    reported: 4200, // Total de horas apontadas do Jira
  };

  const projectStatusData = [
    { status: 'Em Andamento', count: 30 },
    { status: 'Atrasado', count: 5 },
    { status: 'Concluído', count: 10 },
    { status: 'Em Risco', count: 2 },
    { status: 'Planejado', count: 8 },
  ];

  const dashboardContainerStyle = {
    fontFamily: 'Roboto, sans-serif', // Ou sua fonte preferida
    padding: '20px',
    backgroundColor: styles.dashboardBg,
  };

  const dashboardContentStyle = {
    maxWidth: '1400px', // Ajuste conforme necessário
    margin: '0 auto',
  };

  const overviewGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const mainChartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Duas colunas para gráficos
    gap: '20px',
    marginBottom: '30px',
    // Adicionando um media query básico em JS (mais complexo para full responsiveness)
    // Para um responsivo completo, recomenda-se bibliotecas CSS-in-JS como Styled Components
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr', // Empilha gráficos em telas menores
    },
  };

  const bottomSummariesStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  };

  return (
    <div style={dashboardContainerStyle}>
      <main style={dashboardContentStyle}>
        {/* Seção 1: Cartões de Visão Geral (SGI, TIN, SEG, Totais) */}
        <section style={overviewGridStyle}>
          <DashboardCard title="SGI" value={secaoData.SGI} unit="projetos" type="metric" />
          <DashboardCard title="TIN" value={secaoData.TIN} unit="projetos" type="metric" />
          <DashboardCard title="SEG" value={secaoData.SEG} unit="projetos" type="metric" />

          <DashboardCard title="Total Projetos" value={projectSummary.total} unit="" type="metric" />
          <DashboardCard title="Total Equipes" value={teamSummary.totalTeams} unit="" type="metric" />
          <DashboardCard title="Recursos Alocados" value={resourceSummary.allocated} unit="" type="metric" />
        </section>

        {/* Seção 2: Conteúdo Principal - Gráficos e Resumos Chave */}
        {/* Nota: Media queries em estilos inline são limitados. Para responsividade completa, use um framework CSS-in-JS ou JavaScript para mudar estilos dinamicamente. */}
        <section style={mainChartsGridStyle}>
          <div style={{ /* Estilo opcional para o painel do gráfico */ }}>
            <ProjectStatusChart data={projectStatusData} />
          </div>

          <div style={{ /* Estilo opcional para o painel do gráfico */ }}>
            <HoursComparisonChart planned={hoursData.planned} reported={hoursData.reported} />
          </div>
        </section>

        {/* Seção 3: Resumos Adicionais (ex: Detalhes de Status de Projeto, Alocações) */}
        <section style={bottomSummariesStyle}>
          <DashboardCard title="Projetos Atrasados" value={projectSummary.delayed} unit="" type="status" />
          <DashboardCard title="Projetos Concluídos" value={projectSummary.completed} unit="" type="status" />
          <DashboardCard title="Alocações Acima do Limite" value={allocationSummary.overAllocated} unit="" type="status" />
          {/* Adicione mais cartões para outras informações gerais importantes conforme necessário */}
        </section>
      </main>
    </div>
  );
};

export default PMODashboard;