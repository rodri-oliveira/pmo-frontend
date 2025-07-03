"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

// --- Variáveis de Estilo ---
const styles = {
  wegBluePrimary: '#00579d',
  wegBlueDark: '#003f6f',
  textColorDark: '#333',
  cardBg: '#ffffff',
  borderColor: '#e0e0e0',
  dashboardBg: '#f4f7f6',
};

// --- Componente de Cartão ---
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
    height: '100%', // Garante que todos os cartões tenham a mesma altura
  };

  const cardTitleStyle = {
    fontSize: '1.2rem',
    color: styles.wegBluePrimary,
    fontWeight: 'bold',
    marginBottom: '15px',
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
  };

  const valueWrapperStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
  };

  const cardValueStyle = {
    fontSize: '2.8rem',
    fontWeight: '700',
    color: styles.wegBluePrimary,
  };

  const cardUnitStyle = {
    fontSize: '1rem',
    fontWeight: '500',
    marginLeft: '8px',
    color: '#555',
  };

  if (type === 'status') {
    cardValueStyle.color = styles.textColorDark;
  }

  return (
    <div style={baseCardStyle}>
      <div style={cardTitleStyle}>{title}</div>
      <div style={valueWrapperStyle}>
        <span style={cardValueStyle}>{value}</span>
        {unit && <span style={cardUnitStyle}>{unit}</span>}
      </div>
    </div>
  );
};

// --- Componente de Gráfico (Placeholder) ---
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
      <p style={chartPlaceholderStyle}>(Gráfico de Status dos Projetos aqui)</p>
    </div>
  );
};

// --- Componente de Gráfico (Placeholder) ---
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
      <h3 style={chartTitleStyle}>Horas Planejadas vs. Apontadas</h3>
       <p style={chartPlaceholderStyle}>(Gráfico de Comparação de Horas aqui)</p>
    </div>
  );
};


// --- Componente Principal do Dashboard ---
const PMODashboard = () => {
  const [secaoData, setSecaoData] = useState({ SGI: '...', TIN: '...', SEG: '...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/backend/v1/dashboard/projetos-ativos-por-secao');
        if (!response.ok) {
          throw new Error('A resposta da rede não foi ok');
        }
        const data = await response.json();
        setSecaoData({
          SGI: data.SGI || 0,
          TIN: data.TIN || 0,
          SEG: data.SEG || 0,
        });
      } catch (err) {
        setError(err.message);
        setSecaoData({ SGI: 'Erro', TIN: 'Erro', SEG: 'Erro' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dados mockados para outros componentes
  const projectSummary = { total: 125, delayed: 5, completed: 10 };
  const teamSummary = { totalTeams: 8 };
  const resourceSummary = { allocated: 60 };
  const allocationSummary = { overAllocated: 3 };
  const hoursData = { planned: 5000, reported: 4200 };
  const projectStatusData = [
    { status: 'Em Andamento', count: 30 },
    { status: 'Atrasado', count: 5 },
    { status: 'Concluído', count: 10 },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: styles.dashboardBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: 3, // padding de 24px (theme.spacing(3))
        }}
      >
        {/* Seção 1: Cartões de Visão Geral */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            mb: 3,
          }}
        >
          <DashboardCard title="SGI" value={loading ? '...' : secaoData.SGI} unit="projetos" />
          <DashboardCard title="TIN" value={loading ? '...' : secaoData.TIN} unit="projetos" />
          <DashboardCard title="SEG" value={loading ? '...' : secaoData.SEG} unit="projetos" />
          <DashboardCard title="Total Projetos" value={projectSummary.total} unit="" />
          <DashboardCard title="Total Equipes" value={teamSummary.totalTeams} unit="" />
          <DashboardCard title="Recursos Alocados" value={resourceSummary.allocated} unit="" />
        </Box>

        {/* Seção 2: Gráficos Principais */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
            mb: 3,
          }}
        >
          <ProjectStatusChart data={projectStatusData} />
          <HoursComparisonChart planned={hoursData.planned} reported={hoursData.reported} />
        </Box>

        {/* Seção 3: Outros Resumos */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 3,
          }}
        >
          <DashboardCard title="Projetos Atrasados" value={projectSummary.delayed} unit="" type="status" />
          <DashboardCard title="Projetos Concluídos" value={projectSummary.completed} unit="" type="status" />
          <DashboardCard title="Alocações Acima do Limite" value={allocationSummary.overAllocated} unit="" type="status" />
        </Box>
      </Box>
    </Box>
  );
};

export default PMODashboard;
